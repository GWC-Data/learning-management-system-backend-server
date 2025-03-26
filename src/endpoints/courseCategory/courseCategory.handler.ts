import { v4 as uuidv4 } from "uuid";
import { bigquery } from '../../config/bigquery';
import { queries } from "../../queries/courseCategory/courseCategory.queries";
import { CourseCategory } from "db";
import { deleteCourseCategoryImageFromGCS, uploadCourseCategoryImageToGCS } from '../../config/courseCategoryStorage';
import { auditQueries } from "queries/audit/audit.queries";

const TABLE_COURSE_CATEGORY = process.env.TABLE_COURSE_CATEGORY || 'courseCategory';

// Function to check if the course category table exists
const checkCourseCategoryTableExists = async (): Promise<boolean> => {
  try {
    console.log('Checking if course category table exists...');
    const [rows] = await bigquery.query({
      query: `SELECT table_name FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` WHERE table_name = '${TABLE_COURSE_CATEGORY}'`
    });
    console.log(`Table exists: ${rows.length > 0}`);
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking table existence:', error);
    throw new Error('Database error while checking table existence.');
  }
};

// Function to create the course category table if it does not exist
const createCourseCategoryTableIfNotExists = async (): Promise<void> => {
  const exists = await checkCourseCategoryTableExists();
  if (!exists) {
    try {
      console.log('Creating course category table...');
      await bigquery.query({
        query: `
        CREATE TABLE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE_CATEGORY}\` (
          id STRING NOT NULL,
          coursecategoryName STRING NOT NULL,
          description STRING NOT NULL,
          coursecategoryImg STRING,
          createdBy STRING NOT NULL,
          updatedBy STRING,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
      });
      console.log('Course category table created successfully.');
    } catch (error) {
      console.error('Error creating course category table:', error);
      throw new Error('Failed to create course category table.');
    }
  }
};

// **Create CourseCategory**
// export const createCourseCategoryHandler = async (
//   req:any,
//   courseCategoryData: CourseCategory,
//   file?: Express.Multer.File
// ) => {

//   const id = uuidv4();
//   const { user } = req;

//   const { coursecategoryName, description } = courseCategoryData;

//   try {
//     await createCourseCategoryTableIfNotExists();
//     console.log("Checking if course category name already exists...");

//     // **Check if course category already exists**
//     const [existingCourseCategory] = await bigquery.query({
//       query: `SELECT id FROM \`teqcertify.lms.${process.env.TABLE_COURSE_CATEGORY}\` WHERE coursecategoryName = @coursecategoryName`,
//       params: { coursecategoryName },
//     });

//     if (existingCourseCategory.length > 0) {
//       console.warn(`Course category "${coursecategoryName}" already exists.`);
//       return { success: false, message: "Course Category Name already exists." };
//     }

//     console.log("Creating new course category...");
//     const courseCategoryId = uuidv4();
//     const createdAt = new Date().toISOString();
//     const updatedAt = createdAt;
//     let uploadedImgUrl = "";

//     // **Upload image to GCS if provided**
//     if (file) {
//       try {
//         const fileName = `${courseCategoryId}.${file.mimetype.split("/")[1]}`;
//         console.log("Uploading course category image to GCS...");
//         uploadedImgUrl = await uploadCourseCategoryImageToGCS(file.buffer, fileName, file.mimetype);
//       } catch (uploadError) {
//         console.error("Error uploading image to GCS:", uploadError);
//         return { success: false, message: "Failed to upload image." };
//       }
//     }

//     console.log("Inserting course category info into BigQuery...");

//     await bigquery.query({
//       query: queries.createCourseCategory,
//       params: {
//         id: courseCategoryId,
//         coursecategoryName,
//         description,
//         coursecategoryImg: uploadedImgUrl,
//         createdBy: user?.id,
//         createdAt,
//         updatedAt,
//       },
//     });

//     console.log(`Course category created successfully. ID: ${courseCategoryId}`);

//    // **Audit Log**
//    await bigquery.query({
//     query: auditQueries.insertAuditLog,
//     params: {
//       id: uuidv4(),
//       entityType: "CourseCategory", 
//       entityId: courseCategoryId, 
//       action: "CREATE",
//       previousData: null, 
//       newData: JSON.stringify({
//         id: courseCategoryId,
//         coursecategoryName,
//         description,
//         coursecategoryImg: uploadedImgUrl,
//       }),
//       performedBy: user?.id,
//       createdAt: new Date().toISOString(),
//     },
//     types: {
//       previousData: "STRING",
//       newData: "STRING",
//     },
//   });
        
//     return {
//       message: "Course category created successfully.",
//       courseCategoryId,
//       coursecategoryImg: uploadedImgUrl,
//       courseCategoryData: courseCategoryData
//     };
//   } catch (error) {
//     console.error("Error creating course category:", error);
//     return { success: false, errors: [error instanceof Error ? error.message : "Unknown error occurred."] };
//   }
// };

export const createCourseCategoryHandler = async (
  req: any,
  courseCategoryData: any,
  file?: Express.Multer.File
) => {
  try {
    const id = uuidv4();
    const { user } = req;
    const { coursecategoryName, description } = courseCategoryData;

    // Ensure the Course Category table exists
    await createCourseCategoryTableIfNotExists();

    console.log("Checking if course category name already exists...");
    const [existingCourseCategory] = await bigquery.query({
      query: `SELECT id FROM \`teqcertify.lms.${process.env.TABLE_COURSE_CATEGORY}\` WHERE coursecategoryName = @coursecategoryName`,
      params: { coursecategoryName },
      types: { coursecategoryName: "STRING" }
    });

    if (existingCourseCategory.length > 0) {
      console.warn(`Course category "${coursecategoryName}" already exists.`);
      return { success: false, message: "Course Category Name already exists." };
    }

    console.log("Creating new course category...");
    const courseCategoryId = uuidv4();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    let uploadedImgUrl = "";

    // **Upload image to GCS if provided**
    if (file) {
      try {
        const fileName = `${courseCategoryId}.${file.mimetype.split("/")[1]}`;
        console.log("Uploading course category image to GCS...");
        uploadedImgUrl = await uploadCourseCategoryImageToGCS(file.buffer, fileName, file.mimetype);
      } catch (uploadError) {
        console.error("Error uploading image to GCS:", uploadError);
        return { success: false, message: "Failed to upload image." };
      }
    }

    console.log("Inserting course category info into BigQuery...");
    await bigquery.query({
      query: queries.createCourseCategory,
      params: {
        id: courseCategoryId,
        coursecategoryName,
        description,
        coursecategoryImg: uploadedImgUrl || null,
        createdBy: user?.id || null,
        createdAt
      },
      types: {
        coursecategoryImg: "STRING",
        createdBy: "STRING",
      }
    });

    console.log(`Course category created successfully. ID: ${courseCategoryId}`);

    // **Audit Log**
    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: {
        id: uuidv4(),
        entityType: "CourseCategory",
        entityId: courseCategoryId,
        action: "CREATE",
        previousData: null,
        newData: JSON.stringify({
          id: courseCategoryId,
          coursecategoryName,
          description,
          coursecategoryImg: uploadedImgUrl,
        }),
        performedBy: user?.id || null,
        createdAt: new Date().toISOString(),
      },
      types: {
        previousData: "STRING",
        newData: "STRING",
        performedBy: "STRING",
      }
    });

    return {
      success: true,
      message: "Course category created successfully.",
      courseCategoryId,
      coursecategoryImg: uploadedImgUrl,
    };
  } catch (error: any) {
    console.error("Error creating course category:", error);
    return { success: false, errors: [error.message || "Unknown error occurred."] };
  }
};

// **Get All Course Categories**
export const getAllCourseCategoriesHandler = async () => {
  await checkCourseCategoryTableExists();
  try {
    console.log('Fetching all course categories...');
    const [rows] = await bigquery.query({ query: queries.getAllCourseCategories });
    console.log(`Total course categories found: ${rows.length}`);
    return rows;
  } catch (error) {
    console.error('Error fetching all course categories:', error);
    throw error;
  }
};

// **Get Course Category By ID**
export const getCourseCategoryByIdHandler = async (id: string) => {
  await checkCourseCategoryTableExists();
  try {
    console.log(`Fetching course category with ID: ${id}`);
    const [rows] = await bigquery.query({ query: queries.getCourseCategoryById, params: { id } });
    if (!rows.length) {
      console.log(`No course category found with ID: ${id}`);
      return null;
    }
    console.log(`Course category found:`, rows[0]);
    return rows[0];
  } catch (error) {
    console.error(`Error fetching course category with ID ${id}:`, error);
    throw error;
  }
};


export const updateCourseCategoryHandler = async (
  id: string,
  req:any,
  updatedData: CourseCategory,
  file?: Express.Multer.File
) => {
  try {
    const { user } = req;    
    // Check if the table exists
    const tableExists = await checkCourseCategoryTableExists();
    if (!tableExists) {
      return { success: false, message: `Table '${TABLE_COURSE_CATEGORY}' does not exist.` };
    }

    // Fetch existing company data
    const [courseCategoryResults] = await bigquery.query({
      query: `SELECT * FROM \`teqcertify.lms.${TABLE_COURSE_CATEGORY}\` WHERE id = @id`,
      params: { id }
    });
    
    if (!Array.isArray(courseCategoryResults) || courseCategoryResults.length === 0) {
      console.error(`courseCategory with ID ${id} is not registered.`);
      return {
        status: 400,
        success: false,
        errors: [`courseCategory with ID ${id} is not registered.`]
      };
    }

    const courseCategory = courseCategoryResults[0];
    let newCourseCategoryImgUrl = courseCategory.coursecategoryImg;

    // Handle Company Logo Update
    if (file) {
      try {
        // Delete old image if exists
        const oldFileName = courseCategory.coursecategoryImg?.split("/").pop();
        if (oldFileName) {
          await deleteCourseCategoryImageFromGCS(oldFileName);
        }

        // Upload new image
        const fileName = `${id}.${file.mimetype.split("/")[1]}`;
        newCourseCategoryImgUrl = await uploadCourseCategoryImageToGCS(file.buffer, fileName, file.mimetype);
      } catch (uploadError) {
        console.error("Error uploading courseCategory image:", uploadError);
        return { success: false, message: "Failed to upload courseCategory image." };
      }
    }

    // Prepare update values
    const queryParams: Record<string, any> = { id, updatedBy: user?.id, updatedAt: new Date().toISOString() };
    if (newCourseCategoryImgUrl !== courseCategory.coursecategoryImg) {
      queryParams.companyImg = newCourseCategoryImgUrl;
    }

    Object.entries(updatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = value;
      }
    });

    // Construct dynamic update query
    const updateFields = Object.keys(queryParams)
      .filter((key) => key !== "id")
      .map((key) => `${key} = @${key}`)
      .join(", ");

    if (!updateFields) {
      return { success: false, message: "No fields provided for update." };
    }

    // Execute update query
    await bigquery.query({
      query: `UPDATE \`teqcertify.lms.${TABLE_COURSE_CATEGORY}\` SET ${updateFields} WHERE id = @id`,
      params: queryParams
    });

    console.log(`Course Category with ID ${id} updated successfully.`);

    // Insert Audit Log
    const auditLogParams = {
      id: uuidv4(),
      entityType: "CourseCategory",
      entityId: id,
      action: "UPDATE",
      previousData: JSON.stringify(courseCategory),
      newData: JSON.stringify(queryParams),
      performedBy: user?.id,
      createdAt: new Date().toISOString(),
    };

    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: auditLogParams,
      types: { previousData: "STRING", newData: "STRING" }, // Explicit null handling
    });

    return {
      // status: 200,
      // success: true,
      message: `Company with ID ${id} updated successfully.`,
      // courseCategoryImg: queryParams.coursecategoryImg || courseCategory.coursecategoryImg,
      courseCategoryData: courseCategory
    };
  } catch (error) {
    console.error(`Error updating course category with ID ${id}:`, error);
    return { status: 500, success: false, errors: ["Internal server error occurred."] };
  }
};


// **Delete Company Handler**
export const deleteCourseCategoryHandler = async (id: string, req:any) => {

  const { user } = req;
  try {

    if (!(await checkCourseCategoryTableExists())) throw new Error(`Table '${TABLE_COURSE_CATEGORY}' does not exist.`);
    
    const [rows] = await bigquery.query({ query: queries.getCourseCategoryById, params: { id } });
    if (!rows.length) {
      console.log('Company not found.');
      return { success: false, message: 'CourseCategory not found.' };
    }

    const fileName = rows[0].coursecategoryImg?.split('/').pop();
    if (fileName) {
      console.log('Deleting CourseCategory image...');
      await deleteCourseCategoryImageFromGCS(fileName);
    }

    const deleteCategory = await bigquery.query({ 
      query: queries.deleteCourseCategory, 
      params: [{ name: 'id', value: id }] 
    });    
    console.log(`CourseCategory with ID ${id} deleted successfully.`);

     // Insert Audit Log
     const auditLogParams = {
      entityType: "CourseCategory",
      entityId: id,
      action: "DELETE",
      previousData: JSON.stringify(deleteCategory),
      newData: null,
      performedBy: user?.id
    };

    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: auditLogParams,
      types: {
        previousData: "STRING", 
        newData: "STRING",  // Explicitly define null type
        performedBy: "STRING"
      }
    });
    
    return { success: true, message: `CourseCategory with ID ${id} deleted successfully.` };
  } catch (error) {
    console.error(`Error deleting CourseCategory with ID ${id}:`, error);
    return { success: false, errors: ['Internal server error occurred.'] };
  }
};
