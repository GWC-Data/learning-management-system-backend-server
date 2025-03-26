"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateAssignmentCompletionHandler = exports.getAssignmentCompletionByIdHandler = exports.getAllAssignmentCompletionsHandler = exports.deleteAssignmentCompletionHandler = exports.createAssignmentCompletionHandler = void 0;
var _uuid = require("uuid");
var _bigquery = require("../../config/bigquery");
var _assignmentCompletion = require("../../queries/assignmentCompletion/assignmentCompletion.queries");
var _assignmentCompletionStorage = require("../../config/assignmentCompletionStorage");
var _audit = require("../../queries/audit/audit.queries");
var _class = require("../../queries/class/class.queries");
const TABLE_ASSIGNMENTCOMPLETION = process.env.TABLE_ASSIGNMENTCOMPLETION || 'assignmentCompletions';
const TABLE_USER = process.env.TABLE_USER || 'users';

// Function to check if the assignment completion table exists
const checkAssignmentCompletionTableExists = async () => {
  try {
    console.log('Checking if assignment completion table exists...');
    const [rows] = await _bigquery.bigquery.query({
      query: `SELECT table_name FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.INFORMATION_SCHEMA.TABLES\` WHERE table_name = '${TABLE_ASSIGNMENTCOMPLETION}'`
    });
    console.log(`Table exists: ${rows.length > 0}`);
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking table existence:', error);
    throw new Error('Database error while checking table existence.');
  }
};

// Function to create the assignment completion table if it does not exist
const createAssignmentCompletionTableIfNotExists = async () => {
  const exists = await checkAssignmentCompletionTableExists();
  if (!exists) {
    try {
      console.log('Creating Assignment completion table...');
      await _bigquery.bigquery.query({
        query: `
        CREATE TABLE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${TABLE_ASSIGNMENTCOMPLETION}\` (
          id STRING NOT NULL,
          classId STRING NOT NULL,
          traineeId STRING NOT NULL,
          obtainedMarks FLOAT64 NOT NULL,
          obtainedPercentage FLOAT64 NOT NULL,
          courseAssignmentAnswerFile STRING,
          createdBy STRING NOT NULL,
          updatedBy STRING,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      });
      console.log('Assignment completion table created successfully.');
    } catch (error) {
      console.error('Error creating assignment completion table:', error);
      throw new Error('Failed to create assignment completion table.');
    }
  }
};

// **Create AssignmentCompletion**
const createAssignmentCompletionHandler = async (req, assignmentCompletionData, file) => {
  try {
    const {
      user
    } = req;
    const {
      classId,
      traineeId,
      obtainedMarks,
      obtainedPercentage
    } = req.body;
    const createAt = new Date().toISOString();

    // Validate required fields
    if (!classId || !traineeId) {
      console.error("Missing required fields: classId or traineeId");
      return {
        success: false,
        message: "classId and traineeId are required."
      };
    }
    const [courseAssignmentResults] = await _bigquery.bigquery.query({
      query: `
        SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\`
        WHERE id = @classId;
      `,
      params: {
        classId
      }
    });
    if (courseAssignmentResults.length === 0) {
      console.error(`Course assignment with ID ${classId} not found.`);
      return {
        success: false,
        message: "Invalid classId. No matching record found."
      };
    }

    // Check if traineeId exists in the `users` table
    const [traineeResults] = await _bigquery.bigquery.query({
      query: `
        SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\`
        WHERE id = @traineeId;
      `,
      params: {
        traineeId
      }
    });
    if (traineeResults.length === 0) {
      console.error(`Trainee with ID ${traineeId} not found.`);
      return {
        success: false,
        message: "Invalid traineeId. No matching user found."
      };
    }

    // Convert values safely
    const obtainedMarksNumber = Number(obtainedMarks);
    const obtainedPercentageNumber = Number(obtainedPercentage);
    if (isNaN(obtainedMarksNumber) || isNaN(obtainedPercentageNumber)) {
      console.error("Invalid obtainedMarks or obtainedPercentage values:", obtainedMarks, obtainedPercentage);
      return {
        success: false,
        message: "Invalid obtainedMarks or obtainedPercentage values."
      };
    }

    // Ensure table exists
    await createAssignmentCompletionTableIfNotExists();

    // Check if assignment completion already exists
    const checkQuery = `
      SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${TABLE_ASSIGNMENTCOMPLETION}\`
      WHERE classId = @classId AND traineeId = @traineeId
    `;
    const [existingAssignmentCompletion] = await _bigquery.bigquery.query({
      query: checkQuery,
      params: {
        classId,
        traineeId
      }
    });
    if (existingAssignmentCompletion.length > 0) {
      console.warn("Assignment completion already exists for classId:", classId);
      return {
        success: false,
        message: "Assignment completion already exists."
      };
    }

    // Generate a new UUID
    const assignmentCompletionId = (0, _uuid.v4)();
    const createdAt = new Date().toISOString();
    let uploadedFileUrl = "";

    // Handle file upload if provided
    if (file) {
      try {
        const fileName = `${assignmentCompletionId}.${file.originalname.split('.').pop()}`;
        uploadedFileUrl = await (0, _assignmentCompletionStorage.uploadAssignmentCompletionFileToGCS)(file.buffer, fileName, file.mimetype);
        console.log("File uploaded successfully:", uploadedFileUrl);
      } catch (uploadError) {
        console.error("File upload failed:", uploadError);
        return {
          success: false,
          message: "Failed to upload file."
        };
      }
    }

    // Insert into BigQuery
    await _bigquery.bigquery.query({
      query: `
        INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${TABLE_ASSIGNMENTCOMPLETION}\`
        (id, classId, traineeId, obtainedMarks, obtainedPercentage, courseAssignmentAnswerFile, createdBy, createdAt)
        VALUES (@id, @classId, @traineeId, @obtainedMarks, @obtainedPercentage, @courseAssignmentAnswerFile, @createdBy, @createdAt)
      `,
      params: {
        id: assignmentCompletionId,
        classId,
        traineeId,
        obtainedMarks: obtainedMarksNumber,
        obtainedPercentage: obtainedPercentageNumber,
        courseAssignmentAnswerFile: uploadedFileUrl,
        createdBy: user?.id || "system",
        createdAt: createAt
      },
      types: {
        obtainedMarks: "FLOAT64",
        obtainedPercentage: "FLOAT64",
        createdAt: "TIMESTAMP",
        createdBy: "STRING"
      }
    });

    // Insert Audit Log
    const auditLogParams = {
      id: (0, _uuid.v4)(),
      entityType: "AssignmentCompletion",
      entityId: assignmentCompletionId,
      action: "CREATE",
      previousData: null,
      newData: JSON.stringify({
        id: assignmentCompletionId,
        classId,
        traineeId,
        obtainedMarks,
        obtainedPercentage,
        courseAssignmentAnswerFile: uploadedFileUrl
      }),
      performedBy: user?.id || "system",
      createdAt: createdAt
    };
    await _bigquery.bigquery.query({
      query: _audit.auditQueries.insertAuditLog,
      params: auditLogParams,
      types: {
        previousData: "STRING",
        newData: "STRING",
        createdAt: "TIMESTAMP"
      }
    });
    console.log("Assignment completion created successfully:", assignmentCompletionId);
    return {
      success: true,
      assignmentCompletionData
    };
  } catch (error) {
    console.error("Error processing request:", error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : "Unknown error occurred."]
    };
  }
};

// **Get All Assignment Completions**
exports.createAssignmentCompletionHandler = createAssignmentCompletionHandler;
const getAllAssignmentCompletionsHandler = async () => {
  await checkAssignmentCompletionTableExists();
  try {
    console.log('Fetching all assignment completions...');
    const [rows] = await _bigquery.bigquery.query({
      query: _assignmentCompletion.assignmentCompletionQueries.getAllAssignmentCompletions
    });
    console.log(`Total assignment completions found: ${rows.length}`);
    return rows;
  } catch (error) {
    console.error('Error fetching all assignment completions:', error);
    throw error;
  }
};

// **Get Assignment Completion By ID**
exports.getAllAssignmentCompletionsHandler = getAllAssignmentCompletionsHandler;
const getAssignmentCompletionByIdHandler = async id => {
  await checkAssignmentCompletionTableExists();
  try {
    console.log(`Fetching assignment completion with ID: ${id}`);
    const [rows] = await _bigquery.bigquery.query({
      query: _assignmentCompletion.assignmentCompletionQueries.getAssignmentCompletionById,
      params: {
        id
      }
    });
    if (!rows.length) {
      console.log(`No assignment completion found with ID: ${id}`);
      return null;
    }
    console.log(`Assignment completion found:`, rows[0]);
    return rows[0];
  } catch (error) {
    console.error(`Error fetching assignment completion with ID ${id}:`, error);
    throw error;
  }
};

// // **Update Assignment Completion**
// export const updateAssignmentCompletionHandler = async (
//   id: string,
//   updatedData: AssignmentCompletion,
//   file?: Express.Multer.File
// ) => {
//   try {
//     console.log(`Updating assignment completion for ID: ${id}`);

//     // Check if the table exists
//     const tableExists = await checkAssignmentCompletionTableExists();
//     if (!tableExists) {
//       return {
//         success: false,
//         message: `Table '${TABLE_ASSIGNMENTCOMPLETION}' does not exist.`
//       };
//     }

//     // Fetch existing assignment completion data
//     const [assignmentCompletionResults] = await bigquery.query({
//       query: `SELECT * FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${TABLE_ASSIGNMENTCOMPLETION}\` WHERE id = @id`,
//       params: { id }
//     });

//     if (
//       !Array.isArray(assignmentCompletionResults) ||
//       assignmentCompletionResults.length === 0
//     ) {
//       console.error(`Assignment completion with ID ${id} not found.`);
//       return {
//         success: false,
//         errors: [`Assignment completion with ID ${id} not found.`]
//       };
//     }

//     const assignmentCompletion = assignmentCompletionResults[0];
//     let newFileUrl = assignmentCompletion.courseAssignmentAnswerFile;

//     // Handle file update
//     if (file) {
//       try {
//         // Delete old file if exists
//         const oldFileName = assignmentCompletion.courseAssignmentAnswerFile
//           ?.split('/')
//           .pop();
//         if (oldFileName) {
//           await deleteAssignmentCompletionFileFromGCS(oldFileName);
//         }

//         // Upload new file
//         const fileName = `${id}.${file.originalname.split('.').pop()}`;
//         newFileUrl = await uploadAssignmentCompletionFileToGCS(
//           file.buffer,
//           fileName,
//           file.mimetype
//         );
//       } catch (uploadError) {
//         console.error('Error uploading file:', uploadError);
//         return { success: false, message: 'Failed to upload file.' };
//       }
//     }

//     // Prepare update values
//     const queryParams: Record<string, any> = {
//       id,
//       updatedAt: new Date().toISOString()
//     };
//     if (newFileUrl !== assignmentCompletion.courseAssignmentAnswerFile) {
//       queryParams.courseAssignmentAnswerFile = newFileUrl;
//     }

//     Object.entries(updatedData).forEach(([key, value]) => {
//       if (value !== undefined) {
//         queryParams[key] = value;
//       }
//     });

//     // Construct dynamic update query
//     const updateFields = Object.keys(queryParams)
//       .filter((key) => key !== 'id')
//       .map((key) => `${key} = @${key}`)
//       .join(', ');

//     if (!updateFields) {
//       return { success: false, message: 'No fields provided for update.' };
//     }

//     // Execute update query
//     await bigquery.query({
//       query: `UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${TABLE_ASSIGNMENTCOMPLETION}\` SET ${updateFields} WHERE id = @id`,
//       params: queryParams
//     });

//     console.log(`Assignment completion with ID ${id} updated successfully.`);
//     return {
//       success: true,
//       message: `Assignment completion with ID ${id} updated successfully.`,
//       courseAssignmentAnswerFile: newFileUrl
//     };
//   } catch (error) {
//     console.error(`Error updating assignment completion with ID ${id}:`, error);
//     return { success: false, errors: ['Internal server error occurred.'] };
//   }
// };

// **Update Assignment Completion**

// export const updateAssignmentCompletionHandler = async (
//   req:any,
//   id: string,
//   updatedData: AssignmentCompletion,
//   file?: Express.Multer.File
// ) => {
//   try {
//     console.log(`Updating assignment completion for ID: ${id}`);

//     const { user } = req;
//     // Check if the table exists
//     const tableExists = await checkAssignmentCompletionTableExists();
//     console.log('Table', TABLE_ASSIGNMENTCOMPLETION);
//     if (!tableExists) {
//       return {
//         success: false,
//         message: `Table '${TABLE_ASSIGNMENTCOMPLETION}' does not exist.`
//       };
//     }

//     // Fetch existing assignment completion data
//     const [assignmentCompletionResults] = await bigquery.query({
//       query: `SELECT * FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENTCOMPLETION}\` WHERE id = @id`,
//       params: { id }
//     });

//     console.log('assignmentCompletionResults', assignmentCompletionResults);

//     if (
//       !Array.isArray(assignmentCompletionResults) ||
//       assignmentCompletionResults.length === 0
//     ) {
//       console.error(`Assignment completion with ID ${id} not found.`);
//       return {
//         success: false,
//         errors: [`Assignment completion with ID ${id} not found.`]
//       };
//     }

//     const assignmentCompletion = assignmentCompletionResults[0];
//     let newFileUrl = assignmentCompletion.courseAssignmentAnswerFile;

//     // Fetch totalMarks from class
//     const [courseAssignmentResults] = await bigquery.query({
//       query: classQueries.getAllClasses,
//       params: { classId: assignmentCompletion.classId }
//     });

//     console.log(
//       'assignmentCompletion.classId',
//       assignmentCompletion.classId
//     );

//     console.log('courseAssignmentResults', courseAssignmentResults);

//     if (
//       !Array.isArray(courseAssignmentResults) ||
//       courseAssignmentResults.length === 0
//     ) {
//       console.error(
//         `Course assignment with ID ${assignmentCompletion.classId} not found.`
//       );
//       return {
//         success: false,
//         errors: [
//           `Course assignment with ID ${assignmentCompletion.classId} not found.`
//         ]
//       };
//     }

//     const totalMarks = parseFloat(courseAssignmentResults[0].totalMarks);
//     if (isNaN(totalMarks) || totalMarks <= 0) {
//       console.error(
//         `Invalid totalMarks value for course assignment: ${totalMarks}`
//       );
//       return {
//         success: false,
//         message: 'Invalid total marks for course assignment.'
//       };
//     }

//     // Handle file update
//     if (file) {
//       try {
//         // Delete old file if exists
//         const oldFileName = assignmentCompletion.courseAssignmentAnswerFile
//           ?.split('/')
//           .pop();
//         if (oldFileName) {
//           await deleteAssignmentCompletionFileFromGCS(oldFileName);
//         }

//         // Upload new file
//         const fileName = `${id}.${file.originalname.split('.').pop()}`;
//         newFileUrl = await uploadAssignmentCompletionFileToGCS(
//           file.buffer,
//           fileName,
//           file.mimetype
//         );
//       } catch (uploadError) {
//         console.error('Error uploading file:', uploadError);
//         return { success: false, message: 'Failed to upload file.' };
//       }
//     }

//     // Calculate obtainedPercentage if obtainedMarks is provided
//     let obtainedPercentage: number | undefined;
//     if (updatedData.obtainedMarks !== undefined) {
//       const obtainedMarksNumber = parseFloat(
//         updatedData.obtainedMarks.toString()
//       );
//       console.log('obtainedMarksNumber', obtainedMarksNumber);
//       console.log('totalMarks', totalMarks);
//       if (isNaN(obtainedMarksNumber) || obtainedMarksNumber < 0) {
//         return { success: false, message: 'Invalid obtained marks.' };
//       }
//       obtainedPercentage = (obtainedMarksNumber / totalMarks) * 100;
//     }

//     console.log('obtainedPercentage', obtainedPercentage);

//     // Prepare update values
//     const queryParams: Record<string, any> = {
//       id,
//       updatedBy: user?.id,
//       updatedAt: new Date().toISOString(),
//       courseAssignmentAnswerFile: newFileUrl || null 
//     };

//     Object.entries(updatedData).forEach(([key, value]) => {
//       if (value !== undefined) {
//         queryParams[key] =
//           key === 'obtainedMarks' ? parseFloat(value.toString()) : value;
//       }
//     });

//     // Add obtainedPercentage to update query
//     if (obtainedPercentage !== undefined) {
//       queryParams.obtainedPercentage = parseFloat(
//         obtainedPercentage.toFixed(2)
//       );
//     }

//     // Construct dynamic update query
//     const updateFields = Object.keys(queryParams)
//       .filter((key) => key !== 'id')
//       .map((key) => `${key} = @${key}`)
//       .join(', ');

//     if (!updateFields) {
//       return { success: false, message: 'No fields provided for update.' };
//     }

//     console.log('QueryParams', queryParams);

//     // Execute update query
//     await bigquery.query({
//       query: assignmentCompletionQueries.updateAssignmentCompletion,
//       params: queryParams
//     });

//     console.log(`Assignment completion with ID ${id} updated successfully.`);

//     // **Fetch the updated data**
//     const [updatedAssignmentCompletion] = await bigquery.query({
//       query: `SELECT * FROM teqcertify.lms.assignmentCompletions WHERE id = @id`,
//       params: { id }
//     });

//     // ✅ Log audit trail
//     const auditLogParams = {
//       id: uuidv4(),
//       entityType: "AttendanceFile",
//       entityId: id,
//       action: "UPDATE",
//       previousData: JSON.stringify(assignmentCompletion), 
//       newData: JSON.stringify(updatedAssignmentCompletion[0]), 
//       performedBy: user?.id,
//       createdAt: new Date().toISOString(),
//     };

//     await bigquery.query({
//       query: auditQueries.insertAuditLog,
//       params: auditLogParams,
//       types: { previousData: "STRING", newData: "STRING" }, // Ensure JSON storage
//     });

//     return {
//       success: true,
//       message: `Assignment completion with ID ${id} updated successfully.`,
//       updatedData: updatedAssignmentCompletion[0] // Returning the updated record
//     };
//   } catch (error) {
//     console.error(`Error updating assignment completion with ID ${id}:`, error);
//     return { success: false, errors: ['Internal server error occurred.'] };
//   }
// };
exports.getAssignmentCompletionByIdHandler = getAssignmentCompletionByIdHandler;
const updateAssignmentCompletionHandler = async (req, id, updatedData, file) => {
  try {
    console.log(`Updating assignment completion for ID: ${id}`);
    const {
      user
    } = req;
    // Check if the table exists
    const tableExists = await checkAssignmentCompletionTableExists();
    console.log('Table', TABLE_ASSIGNMENTCOMPLETION);
    if (!tableExists) {
      return {
        success: false,
        message: `Table '${TABLE_ASSIGNMENTCOMPLETION}' does not exist.`
      };
    }

    // Fetch existing assignment completion data
    const [assignmentCompletionResults] = await _bigquery.bigquery.query({
      query: `SELECT * FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENTCOMPLETION}\` WHERE id = @id`,
      params: {
        id
      }
    });
    console.log('assignmentCompletionResults', assignmentCompletionResults);
    if (!Array.isArray(assignmentCompletionResults) || assignmentCompletionResults.length === 0) {
      console.error(`Assignment completion with ID ${id} not found.`);
      return {
        success: false,
        errors: [`Assignment completion with ID ${id} not found.`]
      };
    }
    const assignmentCompletion = assignmentCompletionResults[0];
    let newFileUrl = assignmentCompletion.courseAssignmentAnswerFile;

    // Fetch totalMarks from class
    const [classResult] = await _bigquery.bigquery.query({
      query: _class.classQueries.getClass,
      params: {
        classId: assignmentCompletion.classId
      }
    });
    console.log('assignmentCompletion.classId', assignmentCompletion.classId);
    console.log('classResult', classResult);
    if (!Array.isArray(classResult) || classResult.length === 0) {
      console.error(`Class ID ${assignmentCompletion.classId} not found.`);
      return {
        success: false,
        errors: [`class ID ${assignmentCompletion.classId} not found.`]
      };
    }
    const totalMarks = parseFloat(classResult[0].totalMarks);
    if (isNaN(totalMarks) || totalMarks <= 0) {
      console.error(`Invalid totalMarks value for course assignment: ${totalMarks}`);
      return {
        success: false,
        message: 'Invalid total marks for course assignment.'
      };
    }

    // Handle file update
    if (file) {
      try {
        // Delete old file if exists
        const oldFileName = assignmentCompletion.courseAssignmentAnswerFile?.split('/').pop();
        if (oldFileName) {
          await (0, _assignmentCompletionStorage.deleteAssignmentCompletionFileFromGCS)(oldFileName);
        }

        // Upload new file
        const fileName = `${id}.${file.originalname.split('.').pop()}`;
        newFileUrl = await (0, _assignmentCompletionStorage.uploadAssignmentCompletionFileToGCS)(file.buffer, fileName, file.mimetype);
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        return {
          success: false,
          message: 'Failed to upload file.'
        };
      }
    }

    // Calculate obtainedPercentage if obtainedMarks is provided
    let obtainedPercentage;
    if (updatedData.obtainedMarks !== undefined) {
      const obtainedMarksNumber = parseFloat(updatedData.obtainedMarks.toString());
      console.log('obtainedMarksNumber', obtainedMarksNumber);
      console.log('totalMarks', totalMarks);
      if (isNaN(obtainedMarksNumber) || obtainedMarksNumber < 0) {
        return {
          success: false,
          message: 'Invalid obtained marks.'
        };
      }
      obtainedPercentage = obtainedMarksNumber / totalMarks * 100;
    }
    console.log('obtainedPercentage', obtainedPercentage);

    // Prepare update values
    const queryParams = {
      id,
      updatedBy: user?.id,
      updatedAt: new Date().toISOString(),
      courseAssignmentAnswerFile: newFileUrl || null
    };
    Object.entries(updatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = key === 'obtainedMarks' ? parseFloat(value.toString()) : value;
      }
    });

    // Add obtainedPercentage to update query
    if (obtainedPercentage !== undefined) {
      queryParams.obtainedPercentage = parseFloat(obtainedPercentage.toFixed(2));
    }

    // Construct dynamic update query
    const updateFields = Object.keys(queryParams).filter(key => key !== 'id').map(key => `${key} = @${key}`).join(', ');
    if (!updateFields) {
      return {
        success: false,
        message: 'No fields provided for update.'
      };
    }
    console.log('QueryParams', queryParams);

    // Execute update query
    await _bigquery.bigquery.query({
      query: _assignmentCompletion.assignmentCompletionQueries.updateAssignmentCompletion,
      params: queryParams
    });
    console.log(`Assignment completion with ID ${id} updated successfully.`);

    // **Fetch the updated data**
    const [updatedAssignmentCompletion] = await _bigquery.bigquery.query({
      query: `SELECT * FROM teqcertify.lms.assignmentCompletions WHERE id = @id`,
      params: {
        id
      }
    });

    // ✅ Log audit trail
    const auditLogParams = {
      id: (0, _uuid.v4)(),
      entityType: "AssignmentCompletion",
      entityId: id,
      action: "UPDATE",
      previousData: JSON.stringify(assignmentCompletion),
      newData: JSON.stringify(updatedAssignmentCompletion[0]),
      performedBy: user?.id,
      createdAt: new Date().toISOString()
    };
    await _bigquery.bigquery.query({
      query: _audit.auditQueries.insertAuditLog,
      params: auditLogParams,
      types: {
        previousData: "STRING",
        newData: "STRING"
      } // Ensure JSON storage
    });
    return {
      success: true,
      message: `Assignment completion with ID ${id} updated successfully.`,
      updatedData: updatedAssignmentCompletion[0] // Returning the updated record
    };
  } catch (error) {
    console.error(`Error updating assignment completion with ID ${id}:`, error);
    return {
      success: false,
      errors: ['Internal server error occurred.']
    };
  }
};

// **Delete Assignment Completion**
exports.updateAssignmentCompletionHandler = updateAssignmentCompletionHandler;
const deleteAssignmentCompletionHandler = async (req, id) => {
  const {
    user
  } = req;
  try {
    console.log(`Deleting assignment completion with ID: ${id}`);
    if (!(await checkAssignmentCompletionTableExists())) throw new Error(`Table '${TABLE_ASSIGNMENTCOMPLETION}' does not exist.`);
    const [rows] = await _bigquery.bigquery.query({
      query: _assignmentCompletion.assignmentCompletionQueries.getAssignmentCompletionById,
      params: {
        id
      }
    });
    if (!rows.length) {
      console.log('Assignment completion not found.');
      return {
        success: false,
        message: 'Assignment completion not found.'
      };
    }
    const assignmentCompletion = rows[0];
    const fileName = rows[0].courseAssignmentAnswerFile?.split('/').pop();
    if (fileName) {
      console.log('Deleting assignment completion file...');
      await (0, _assignmentCompletionStorage.deleteAssignmentCompletionFileFromGCS)(fileName);
    }
    await _bigquery.bigquery.query({
      query: _assignmentCompletion.assignmentCompletionQueries.deleteAssignmentCompletion,
      params: {
        id
      }
    });
    console.log(`Assignment completion with ID ${id} deleted successfully.`);

    // Insert Audit Log
    const auditLogParams = {
      id: (0, _uuid.v4)(),
      entityType: "AssignmentCompletion",
      entityId: id,
      action: "DELETE",
      previousData: JSON.stringify(assignmentCompletion),
      newData: null,
      performedBy: user?.id,
      createdAt: new Date().toISOString()
    };
    await _bigquery.bigquery.query({
      query: _audit.auditQueries.insertAuditLog,
      params: auditLogParams,
      types: {
        previousData: "STRING",
        newData: "STRING"
      }
    });
    return {
      success: true,
      message: `Assignment completion with ID ${id} deleted successfully.`
    };
  } catch (error) {
    console.error(`Error deleting assignment completion with ID ${id}:`, error);
    return {
      success: false,
      errors: ['Internal server error occurred.']
    };
  }
};
exports.deleteAssignmentCompletionHandler = deleteAssignmentCompletionHandler;
//# sourceMappingURL=assignmentCompletion.handler.js.map