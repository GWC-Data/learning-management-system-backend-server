import { v4 as uuidv4 } from 'uuid';
import { bigquery } from '../../config/bigquery';
import { moduleQueries } from '../../queries/module/module.queries';
import { Modules } from 'db';
import {
  deleteModuleMaterialFromGCS,
  uploadModuleMaterialToGCS
} from '../../config/moduleStorage';
import { auditQueries } from 'queries/audit/audit.queries';

const TABLE_MODULE = process.env.TABLE_MODULE || 'course';

// // Function to check if the module table exists
const checkModuleTableExists = async (): Promise<boolean> => {
  try {
    console.log('Checking if course table exists...');
    const [rows] = await bigquery.query({
      query: `SELECT table_name FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` WHERE table_name = 'modules'`
    });
    console.log(`Table exists: ${rows.length > 0}`);
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking table existence:', error);
    throw new Error('Database error while checking table existence.');
  }
};

// // Function to create the module table if it does not exist
const createModuleTableIfNotExists = async (): Promise<void> => {
  const exists = await checkModuleTableExists();
  if (!exists) {
    try {
      console.log('Creating module table...');
      await bigquery.query({
        query: `
        CREATE TABLE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\` (
          id STRING NOT NULL, 
          courseId STRING NOT NULL,
          moduleName STRING NOT NULL,
          moduleDescription STRING,
          sequence INT64,
          materialForModule STRING,
          createdBy STRING NOT NULL,
          updatedBy STRING,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      });
      console.log('Course table created successfully.');
    } catch (error) {
      console.error('Error creating module table:', error);
      throw new Error('Failed to create module table.');
    }
  }
};

//CREATE Module
export const createModuleHandler = async (
  req:any,
  moduleData: Modules,
  file?: Express.Multer.File
) => {
  const { courseId, moduleName, moduleDescription, materialForModule } =
    moduleData;

    const { user } = req;
 
  try {
    await createModuleTableIfNotExists();
    console.log('Checking if moduleName already exists...');
 
    // **Check if module already exists**
    const [existingModule] = await bigquery.query({
      query: `SELECT id FROM \`teqcertify.lms.${process.env.TABLE_MODULE}\` WHERE moduleName = @moduleName`,
      params: { moduleName }
    });
 
    if (existingModule.length > 0) {
      console.warn(`Modulename "${moduleName}" already exists.`);
      return { success: false, message: 'ModuleName already exists.' };
    }
 
    console.log(
      'Fetching the highest sequence number for the given courseId...'
    );
    const [maxSequenceResult] = await bigquery.query({
      query: `SELECT MAX(sequence) as maxSequence FROM \`teqcertify.lms.${process.env.TABLE_MODULE}\` WHERE courseId = @courseId`,
      params: { courseId }
    });
 
    const nextSequence = (maxSequenceResult[0]?.maxSequence || 0) + 1;
    console.log(`Next sequence number: ${nextSequence}`);
 
    console.log('Creating new Module...');
    const moduleId = uuidv4();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    let uploadedDocumentUrl = '';
 
    // **Upload file to GCS if provided**
    if (file) {
      try {
        const fileName = `${moduleId}.${file.mimetype.split('/')[1]}`;
        console.log('Uploading material file to GCS...');
        uploadedDocumentUrl = await uploadModuleMaterialToGCS(
          file.buffer,
          fileName,
          file.mimetype
        );
      } catch (uploadError) {
        console.error('Error uploading file to GCS:', uploadError);
        return { success: false, message: 'Failed to upload material file.' };
      }
    }
 
    console.log('Inserting module info into BigQuery...');
 
    await bigquery.query({
      query: moduleQueries.createModule,
      params: {
        id: moduleId,
        courseId,
        moduleName,
        moduleDescription,
        sequence: nextSequence,
        materialForModule: uploadedDocumentUrl,
        createdBy: user?.id,
        createdAt
      }
    });

     // Audit log
    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: {
        id: uuidv4(), 
        entityType: "Module",
        entityId: moduleId, 
        action: "CREATE",
        previousData: null, 
        newData: JSON.stringify({
          id: moduleId,
          courseId,
          moduleName,
          moduleDescription,
          sequence: nextSequence,
          materialForModule: uploadedDocumentUrl
        }), 
        performedBy: user?.id,
        createdAt: createdAt
      },
      types: {
        previousData: 'STRING',
        newData: 'STRING',
      }
    });
 
    console.log(`Module created successfully. ID: ${moduleId}`);
    return {
      success: true,
      message: 'Module created successfully.',
      moduleId,
      materialForModule: uploadedDocumentUrl,
      moduleData: { ...moduleData, sequence: nextSequence }
    };
  } catch (error) {
    console.error('Error creating module:', error);
    return {
      success: false,
      errors: [
        error instanceof Error ? error.message : 'Unknown error occurred.'
      ]
    };
  }
};
 
// **Get All Modules**
export const getAllModulesHandler = async () => {
  await checkModuleTableExists();
  try {
    console.log('Fetching all modules...');
    const [rows] = await bigquery.query({
      query: moduleQueries.getAllModules
    });
    console.log(`Total Module found: ${rows.length}`);
    return rows;
  } catch (error) {
    console.error('Error fetching all course:', error);
    throw error;
  }
};
 
// **Get Module By ID**
export const getModuleByIdHandler = async (moduleId: string) => {
  await checkModuleTableExists();
  try {
    console.log(`Fetching module with ID: ${moduleId}`);
    const [rows] = await bigquery.query({
      query: moduleQueries.getModule,
      params: { moduleId } // Ensure the param matches the query placeholder
    });
    if (!rows.length) {
      console.log(`No module found with ID: ${moduleId}`);
      return null;
    }
    console.log(`Module found:`, rows[0]);
    return rows[0];
  } catch (error) {
    console.error(`Error fetching module with ID ${moduleId}:`, error);
    throw error;
  }
};
 
export const updateModuleHandler = async (
  req:any,
  id: string,
  updatedData: Modules,
  file?: Express.Multer.File
) => {

  const { user } = req;

  try {
    console.log(`Updating module info for ID: ${id}`);
 
    // Check if the table exists
    const tableExists = await checkModuleTableExists();
    if (!tableExists) {
      return {
        success: false,
        message: `Table '${TABLE_MODULE}' does not exist.`
      };
    }
 
    // Fetch existing module data
    const [moduleResults] = await bigquery.query({
      query: `SELECT * FROM \`teqcertify.lms.${TABLE_MODULE}\` WHERE id = @id`,
      params: { id }
    });
 
    if (!Array.isArray(moduleResults) || moduleResults.length === 0) {
      console.error(`module with ID ${id} is not registered.`);
      return {
        status: 400,
        success: false,
        errors: [`module with ID ${id} is not registered.`]
      };
    }
 
    const module = moduleResults[0];
    let newMaterialForModule = module.materialForModule;
 
    // Handle material for module Update
    if (file) {
      try {
        // Delete old file if exists
        const oldFileName = module.materialForModule?.split('/').pop();
        if (oldFileName) {
          await deleteModuleMaterialFromGCS(oldFileName);
        }
 
        // Upload new file
        const fileName = `${id}.${file.mimetype.split('/')[1]}`;
        newMaterialForModule = await uploadModuleMaterialToGCS(
          file.buffer,
          fileName,
          file.mimetype
        );
      } catch (uploadError) {
        console.error('Error uploading material for module:', uploadError);
        return {
          success: false,
          message: 'Failed to upload material for module.'
        };
      }
    }
 
    // Prepare update values
    const queryParams: Record<string, any> = {
      id,
      updatedAt: new Date().toISOString()
    };
    if (newMaterialForModule !== module.materialForModule) {
      queryParams.materialForModule = newMaterialForModule;
    }
 
    Object.entries(updatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = value;
      }
    });
 
    // Construct dynamic update query
    const updateFields = Object.keys(queryParams)
      .filter((key) => key !== 'id')
      .map((key) => `${key} = @${key}`)
      .join(', ');
 
    if (!updateFields) {
      return { success: false, message: 'No fields provided for update.' };
    }
 
    // Execute update query
    await bigquery.query({
      query: `UPDATE \`teqcertify.lms.${TABLE_MODULE}\` SET ${updateFields} WHERE id = @id`,
      params: queryParams
    });

    const auditLogParams = {
          id: uuidv4(),
          entityType: "Module",
          entityId: id,
          action: "UPDATE",
          previousData: JSON.stringify(module),
          newData: JSON.stringify(queryParams), 
          performedBy: user?.id, 
          createdAt: new Date().toISOString(),
        };
      
        await bigquery.query({
          query: auditQueries.insertAuditLog,
          params: auditLogParams,
          types: { previousData: "STRING", newData: "STRING" }, 
        });

    console.log(`Module with ID ${id} updated successfully.`);
    return {
      // status: 200,
      success: true,
      message: `Module with ID ${id} updated successfully.`,
      courseData: updatedData
    };
  } catch (error) {
    console.error(`Error updating module with ID ${id}:`, error);
    return {
      status: 500,
      success: false,
      errors: ['Internal server error occurred.']
    };
  }
};
 
 
// **Delete Module Handler**
export const deleteModuleHandler = async (req:any, id: string) => {
  const { user } = req;

  try {
    console.log(`Deleting module with ID: ${id}`);
 
    if (!(await checkModuleTableExists())) {
      throw new Error(`Table '${TABLE_MODULE}' does not exist.`);
    }
 
    // Check if the module exists
    const [rows] = await bigquery.query({
      query: moduleQueries.getModule,
      params: { moduleId: id } // ✅ Correctly maps to @moduleId
    });
   
 
    if (!rows.length) {
      throw new Error('Module not found'); // ❌ Instead of returning, throw an error
    }
 
    // Delete module material from GCS
    const fileName = rows[0].materialForModule?.split('/').pop();
    if (fileName) {
      console.log('Deleting MaterialForModule...');
      await deleteModuleMaterialFromGCS(fileName);
    }
 
    // Delete module from database
    await bigquery.query({
      query: moduleQueries.deleteModule,
      params: { id: id } // ✅ Ensure correct parameter binding
    });

    // Insert Audit Log
    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: {
        id: uuidv4(),
        entityType: "Module",
        entityId: id,
        action: "DELETE",
        previousData: JSON.stringify(rows[0]),  // ✅ Correct previousData
        newData: null,
        performedBy: user?.id,
        createdAt: new Date().toISOString(),
      },
      types: {
        previousData: "STRING",
        newData: "STRING",
      },
    });

    console.log(`✅ Module with ID ${id} deleted successfully.`);
 
  } catch (error) {
    console.error(`❌ Error deleting module with ID ${id}:`, error);
    throw error; // ✅ Now properly throwing the error so `deleteModuleEndpoint` can catch it
  }
};