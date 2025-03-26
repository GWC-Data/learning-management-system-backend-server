import { v4 as uuidv4 } from 'uuid';
import { bigquery } from '../../config/bigquery';
import { classQueries } from '../../queries/class/class.queries';
import { Classes } from 'db';
import {
  deleteClassFilesFromGCS,
  uploadMaterialForClassToGCS
} from '../../config/classStorage';
import { auditQueries } from 'queries/audit/audit.queries';

const TABLE_CLASS = process.env.TABLE_CLASS || 'classes';

// Function to check if the class table exists
const checkClassTableExists = async (): Promise<boolean> => {
  try {
    console.log('Checking if class table exists...');
    const [rows] = await bigquery.query({
      query: `SELECT table_name FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` WHERE table_name = '${TABLE_CLASS}'`
    });
    console.log(`Table exists: ${rows.length > 0}`);
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking table existence:', error);
    throw new Error('Database error while checking table existence.');
  }
};

// Function to create the class table if it does not exist
const createClassTableIfNotExists = async (): Promise<void> => {
  const exists = await checkClassTableExists();
  if (!exists) {
    try {
      console.log("Creating class table...");
      await bigquery.query({
        query: `
        CREATE TABLE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` (
          id STRING NOT NULL, 
          classTitle STRING NOT NULL,
          classDescription STRING,
          classRecordedLink STRING,
          moduleId STRING,
          assignmentName STRING,
          assignmentFile STRING, -- Assignment file URL (optional)
          materialForClass STRING, -- Material file URL
          totalMarks INTEGER,
          createdBy STRING NOT NULL,
          updatedBy STRING,
          createdAt TIMESTAMP NOT NULL, -- Set manually in query
          updatedAt TIMESTAMP -- Updated manually
        )
      `,
      });
      console.log("Class table created successfully.");
    } catch (error) {
      console.error("Error creating Class table:", error);
      throw new Error("Failed to create Class table.");
    }
  }
};

export const createClassHandler = async (
  req: any,
  classData: Classes,
  files?: { materialForClass?: Express.Multer.File; assignmentFile?: Express.Multer.File }
) => {
  const {
    classTitle,
    classDescription,
    moduleId,
    assignmentName,
    totalMarks,
  } = classData;
  
  const { user } = req;

  try {
    await createClassTableIfNotExists();
    console.log("Checking if class table already exists...");

    // **Check if class already exists**
    const [existingClass] = await bigquery.query({
      query: `SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` WHERE classTitle = @classTitle`,
      params: { classTitle },
    });

    if (existingClass.length > 0) {
      console.warn(`Class Title "${classTitle}" already exists.`);
      return { success: false, message: "Class Title already exists." };
    }

    console.log("Creating new Class...");
    const classId = uuidv4();
    const createdAt = new Date().toISOString();
    let uploadedMaterialUrl = "";
    let uploadedAssignmentUrl = "";

    // **Upload Material for Class**
    if (files?.materialForClass) {
      try {
        const file = files.materialForClass;
        const fileName = `${classId}_material.${file.mimetype.split("/")[1]}`;
        console.log("Uploading materialForClass to GCS...");
        uploadedMaterialUrl = await uploadMaterialForClassToGCS(
          file.buffer,
          fileName,
          file.mimetype
        );
      } catch (uploadError) {
        console.error("Error uploading materialForClass to GCS:", uploadError);
        return {
          success: false,
          message: "Failed to upload materialForClass.",
        };
      }
    }

    // **Upload Assignment File**
    if (files?.assignmentFile) {
      try {
        const file = files.assignmentFile;
        const fileName = `${classId}_assignment.${file.mimetype.split("/")[1]}`;
        console.log("Uploading assignmentFile to GCS...");
        uploadedAssignmentUrl = await uploadMaterialForClassToGCS(
          file.buffer,
          fileName,
          file.mimetype
        );
      } catch (uploadError) {
        console.error("Error uploading assignmentFile to GCS:", uploadError);
        return {
          success: false,
          message: "Failed to upload assignmentFile.",
        };
      }
    }

    console.log("Inserting class info into BigQuery...");

    await bigquery.query({
      query: classQueries.createClass,
      params: {
        id: classId,
        classTitle,
        classDescription,
        moduleId,
        assignmentName,
        assignmentFile: uploadedAssignmentUrl, // Storing the assignment file URL
        materialForClass: uploadedMaterialUrl, // Storing the material file URL
        totalMarks,
        createdBy: user?.id,
        createdAt,
      },
    });

    console.log(`Class created successfully. ID: ${classId}`);

    // **Insert audit log**
    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: {
        id: uuidv4(),
        entityType: "Class",
        entityId: classId,
        action: "CREATE",
        previousData: null,
        newData: JSON.stringify(classData),
        performedBy: user?.id,
        createdAt: new Date().toISOString(),
      },
      types: {
        previousData: "STRING",
        newData: "STRING",
      },
    });

    return {
      success: true,
      message: "Class created successfully.",
      classId,
      classTitle,
      classDescription,
      moduleId,
      assignmentName,
      assignmentFile: uploadedAssignmentUrl, // Storing the assignment file URL
      materialForClass: uploadedMaterialUrl, // Storing the material file URL
      totalMarks,
    };
  } catch (error) {
    console.error("Error creating class:", error);
    return {
      success: false,
      errors: [
        error instanceof Error ? error.message : "Unknown error occurred.",
      ],
    };
  }
};



// **Get All Classes**
export const getAllClassesHandler = async () => {
  await checkClassTableExists();
  try {
    console.log('Fetching all class...');
    const [rows] = await bigquery.query({
      query: classQueries.getAllClasses
    });
    console.log(`Total class found: ${rows.length}`);
    return rows;
  } catch (error) {
    console.error('Error fetching all class:', error);
    throw error;
  }
};

// **Get Class By ID**
export const getClassByIdHandler = async (classId: string) => {
  await checkClassTableExists();
  try {
    console.log(`Fetching course with ID: ${classId}`);
    const [rows] = await bigquery.query({
      query: classQueries.getClass,
      params: { classId } // Ensure the param matches the query placeholder
    });
    if (!rows.length) {
      console.log(`No class found with ID: ${classId}`);
      return null;
    }
    console.log(`Class found:`, rows[0]);
    return rows[0];
  } catch (error) {
    console.error(`Error fetching class with ID ${classId}:`, error);
    throw error;
  }
};

// Handler to get classes by moduleId
export const getClassByModuleIdHandler = async (moduleId: string) => {
  await checkClassTableExists();
  try {
    console.log(`Fetching classes for module ID: ${moduleId}`);
    const [rows] = await bigquery.query({
      query: classQueries.getClassByModuleId,
      params: { moduleId },
    });
    if (!rows.length) {
      console.log(`No classes found for module ID: ${moduleId}`);
      return [];
    }
    console.log(`Classes found:`, rows);
    return rows;
  } catch (error) {
    console.error(`Error fetching classes for module ID ${moduleId}:`, error);
    throw error;
  }
};

export const updateClassHandler = async (
  req: any,
  id: string,
  updatedData: Classes,
  files?: { materialForClass?: Express.Multer.File[]; assignmentFile?: Express.Multer.File[] }
) => {
  try {
    const { user } = req;
    console.log(`Updating class info for ID: ${id}`);
    console.log("Files received:", files);

    // Check if table exists
    const tableExists = await checkClassTableExists();
    if (!tableExists) {
      return {
        success: false,
        message: `Table '${process.env.TABLE_CLASS}' does not exist.`,
      };
    }

    // Fetch existing class data
    const [classResults] = await bigquery.query({
      query: `SELECT * FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` WHERE id = @id`,
      params: { id },
    });

    if (!Array.isArray(classResults) || classResults.length === 0) {
      return {
        status: 400,
        success: false,
        errors: [`Class with ID ${id} is not registered.`],
      };
    }

    const classData = classResults[0];

    let newMaterialForClassUrl = classData.materialForClass;
    let newAssignmentFileUrl = classData.assignmentFile;

    // Handle Material Update
    if (files?.materialForClass?.length) {
      const materialFile = files.materialForClass[0];

      // Delete old material if exists
      if (classData.materialForClass) {
        const oldFileName = classData.materialForClass.split("/").pop();
        if (oldFileName) {
          await deleteClassFilesFromGCS(oldFileName);
        }
      }

      // Upload new material
      const materialExt = materialFile.originalname.split(".").pop();
      const materialFileName = `${id}_material.${materialExt}`;
      newMaterialForClassUrl = await uploadMaterialForClassToGCS(materialFile.buffer, materialFileName, materialFile.mimetype);

      updatedData.materialForClass = newMaterialForClassUrl;
    }

    // Handle Assignment File Update
    if (files?.assignmentFile?.length) {
      const assignmentFile = files.assignmentFile[0];

      // Delete old assignment file if exists
      if (classData.assignmentFile) {
        const oldAssignmentFileName = classData.assignmentFile.split("/").pop();
        if (oldAssignmentFileName) {
          await deleteClassFilesFromGCS(oldAssignmentFileName);
        }
      }

      // Upload new assignment file
      const assignmentExt = assignmentFile.originalname.split(".").pop();
      const assignmentFileName = `${id}_assignment.${assignmentExt}`;
      newAssignmentFileUrl = await uploadMaterialForClassToGCS(assignmentFile.buffer, assignmentFileName, assignmentFile.mimetype);

      updatedData.assignmentFile = newAssignmentFileUrl;
    }

    // Prepare update values
    const queryParams: Record<string, any> = {
      classId: id,
      updatedBy: user?.id,
      updatedAt: new Date().toISOString(),
    };

    // Add all fields from updatedData to queryParams
    Object.entries(updatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = value;
      }
    });

    console.log("Update parameters:", queryParams);

    // Execute update query
    await bigquery.query({
      query: classQueries.updateClass,
      params: queryParams,
    });

    // Audit log
    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: {
        id: uuidv4(),
        entityType: "Class",
        entityId: id,
        action: "UPDATE",
        previousData: JSON.stringify(classData),
        newData: JSON.stringify(updatedData),
        performedBy: user?.id,
        createdAt: new Date().toISOString(),
      },
      types: {
        previousData: "STRING",
        newData: "STRING",
      },
    });

    return {
      success: true,
      message: `Class with ID ${id} updated successfully.`,
      classData: updatedData,
    };
  } catch (error) {
    console.error(`Error updating class with ID ${id}:`, error);
    return {
      status: 500,
      success: false,
      errors: ["Internal server error occurred."],
    };
  }
};



export const deleteClassHandler = async (req: any, id: string) => {
  const { user } = req;
  
  try {
    console.log(`Deleting class with ID: ${id}`);
    
    // Ensure TABLE_CLASS is defined
    const tableName = process.env.TABLE_CLASS;
    if (!tableName) throw new Error("TABLE_CLASS environment variable is not set.");

    // Check if table exists before querying
    if (!(await checkClassTableExists())) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }

    // Fetch class details
    const [rows] = await bigquery.query({
      query: `SELECT * FROM \`teqcertify.lms.${tableName}\` WHERE id = @id`,
      params: { id }
    });

    if (!rows.length) {
      console.log('Class not found.');
      return { success: false, message: 'Class not found.' };
    }

    // Delete associated material if present
    const fileName = rows[0].materialForClass?.split('/').pop();
    if (fileName) {
      console.log('Deleting Material for class...');
      await deleteClassFilesFromGCS(fileName);
    }
    
    // Delete class
    await bigquery.query({
      query: `DELETE FROM \`teqcertify.lms.${tableName}\` WHERE id = @id`,
      params: { id }
    });
    console.log(`Class with ID ${id} deleted successfully.`);

    // Insert Audit Log
    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: {
        id: uuidv4(),
        entityType: "Class",
        entityId: id,
        action: "DELETE",
        previousData: JSON.stringify(rows[0]),
        newData: null,
        performedBy: user?.id,
        createdAt: new Date().toISOString(),
      },
      types: {
        previousData: "STRING",
        newData: "STRING",
      },
    });

    return { success: true, message: `Class with ID ${id} deleted successfully.` };
  } catch (error) {
    console.error(`Error deleting Class with ID ${id}:`, error);
    return { success: false, errors: ["Internal server error occurred."] };
  }
};

