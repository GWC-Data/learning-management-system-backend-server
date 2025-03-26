import { Request, Response } from 'express';
import { BigQuery } from '@google-cloud/bigquery';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { bigquery } from '../../config/bigquery';
import { attendanceFileQueries } from '../../queries/attendanceFile/attendanceFile.queries';
import { attendanceQueries } from '../../queries/attendance/attendanceQueries';
import { AttendanceFile, Attendance } from 'db';
import {
  deleteAttendanceForClassFromGCS,
  uploadAttendanceFileForClassToGCS
} from '../../config/attendanceStorage';
import { auditQueries } from 'queries/audit/audit.queries';

const TABLE_ATTENDANCE_FILE =
  process.env.TABLE_ATTENDANCE_FILE || 'attendanceFiles';
const TABLE_CLASS = process.env.TABLE_CLASS || 'classes';

// Function to check if the attendance file table exists
const checkAttendanceFileTableExists = async (): Promise<boolean> => {
  try {
    console.log('Checking if attendance file table exists...');
    const [rows] = await bigquery.query({
      query: `SELECT table_name FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` WHERE table_name = '${TABLE_ATTENDANCE_FILE}'`
    });
    console.log(`Table exists: ${rows.length > 0}`);
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking table existence:', error);
    throw new Error('Database error while checking table existence.');
  }
};

// Function to create the attendance file table if it does not exist
const createAttendanceFileTableIfNotExists = async (): Promise<void> => {
  const exists = await checkAttendanceFileTableExists();
  if (!exists) {
    try {
      console.log('Creating attendance file table...');
      await bigquery.query({
        query: `
        CREATE TABLE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE_FILE}\` (
          id STRING NOT NULL,
          classId STRING NOT NULL,
          teamsAttendanceFile STRING NOT NULL,
          attendanceDate STRING NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      });
      console.log('Attendance File table created successfully.');
    } catch (error) {
      console.error('Error creating attendance file table:', error);
      throw new Error('Failed to create attendance file table.');
    }
  }
};

// **Create AttendanceFile**
export const createAttendanceFileHandler = async (
  req:any,
  AttendanceFileData: AttendanceFile,
  file?: Express.Multer.File
) => {
  const { user } = req;
  const { classId, teamsAttendanceFile, attendanceDate } = AttendanceFileData;

  try {
    await createAttendanceFileTableIfNotExists();
    console.log('Checking if attendance is already exists...');

    console.log(`Validating class ID: ${AttendanceFileData.classId}`);

    // Check if classId exists
    const [classExists] = await bigquery.query({
      query: attendanceFileQueries.validateClassId,
      params: { classId: AttendanceFileData.classId }
    });

    if (!classExists.length) {
      console.error(`Class ID ${AttendanceFileData.classId} does not exist.`);
      return {
        success: false,
        message: 'Invalid classId. Class does not exist.'
      };
    }
    console.log(
      `Class ID ${AttendanceFileData.classId} is valid. Proceeding with insertion.`
    );

    console.log('Creating new Attendance...');
    const attendanceFileId = uuidv4();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    let uploadedTeamsAttendanceFileUrl = '';

    // **Upload image to GCS if provided**
    if (file) {
      try {
        const fileName = `${attendanceFileId}.${file.mimetype.split('/')[1]}`;
        console.log('Uploading TeamsAttendanceFile to GCS...');
        uploadedTeamsAttendanceFileUrl =
          await uploadAttendanceFileForClassToGCS(
            file.buffer,
            fileName,
            file.mimetype
          );
      } catch (uploadError) {
        console.error(
          'Error uploading TeamsAttendanceFile to GCS:',
          uploadError
        );
        return {
          success: false,
          message: 'Failed to upload TeamsAttendanceFile.'
        };
      }
    }

    console.log('Inserting attendanceFile info into BigQuery...');

    await bigquery.query({
      query: attendanceFileQueries.createAttendanceFile,
      params: {
        id: attendanceFileId,
        classId,
        teamsAttendanceFile: uploadedTeamsAttendanceFileUrl,
        attendanceDate,
        createdAt,
        createdBy: user?.id
      }
    });


    // Insert Audit Log
        const auditLogParams = {
          id: uuidv4(),
          entityType: "AttendanceFile",
          entityId: attendanceFileId,
          action: "CREATE",
          previousData: null,
          newData: JSON.stringify({
            id: attendanceFileId,
            classId,
            teamsAttendanceFile,
            attendanceDate
          }),
          performedBy: user?.id,
          createdAt,
        };
    
        await bigquery.query({
          query: auditQueries.insertAuditLog,
          params: auditLogParams,
          types: { previousData: "STRING", newData: "STRING", createdAt: "TIMESTAMP" },
        });

    console.log(
      `Attendance File created successfully. ID: ${attendanceFileId}`
    );
    return {
      success: true,
      message: 'Attendance File created successfully.',
      attendanceFileId,
      teamsAttendanceFile: uploadedTeamsAttendanceFileUrl,
      attendanceFileData: AttendanceFileData
    };
  } catch (error) {
    console.error('Error creating attendanceFile:', error);
    return {
      success: false,
      errors: [
        error instanceof Error ? error.message : 'Unknown error occurred.'
      ]
    };
  }
};

// **Get All AttendanceFile**
export const getAllAttendanceFilesHandler = async () => {
  await checkAttendanceFileTableExists();
  try {
    console.log('Fetching all attendanceFile...');
    const [rows] = await bigquery.query({
      query: attendanceFileQueries.getAllAttendanceFiles
    });
    console.log(`Total Attendance Files found: ${rows.length}`);
    return rows;
  } catch (error) {
    console.error('Error fetching all Attendance Files:', error);
    throw error;
  }
};

// **Get AttendanceFile By ID**
export const getAttendanceFileByIdHandler = async (id: string) => {
  await checkAttendanceFileTableExists();
  try {
    console.log(`Fetching course category with ID: ${id}`);
    const [rows] = await bigquery.query({
      query: attendanceFileQueries.getAttendanceFileById,
      params: { id }
    });
    if (!rows.length) {
      console.log(`No attendance file found with ID: ${id}`);
      return null;
    }
    console.log(`Attendance File found:`, rows[0]);
    return rows[0];
  } catch (error) {
    console.error(`Error fetching Attendance File with ID ${id}:`, error);
    throw error;
  }
};

// **Get Attendance Files By Class ID**
export const getAttendanceFilesByClassIdHandler = async (classId: string) => {
  await checkAttendanceFileTableExists();
  try {
    console.log(`Fetching attendance files for Class ID: ${classId}`);

    const [rows] = await bigquery.query({
      query: attendanceFileQueries.getAttendanceFilesByClassId,
      params: { classId }
    });

    if (!rows.length) {
      console.log(`No attendance files found for Class ID: ${classId}`);
      return null;
    }

    console.log(`Attendance Files found:`, rows);
    return rows;
  } catch (error) {
    console.error(
      `Error fetching attendance files for Class ID ${classId}:`,
      error
    );
    throw error;
  }
};

export const updateAttendanceFileHandler = async (
  req:any,
  id: string,
  updatedData: AttendanceFile,
  file?: Express.Multer.File
) => {
  try {
    const { user } = req;
    console.log(`Updating attendance file info for ID: ${id}`);

    // Check if the table exists
    const tableExists = await checkAttendanceFileTableExists();
    if (!tableExists) {
      return {
        success: false,
        message: `Table '${TABLE_ATTENDANCE_FILE}' does not exist.`
      };
    }

    // Fetch existing attendance file data
    const [attendanceFileResults] = await bigquery.query({
      query: `SELECT * FROM \`teqcertify.lms.${TABLE_ATTENDANCE_FILE}\` WHERE id = @id`,
      params: { id }
    });

    if (
      !Array.isArray(attendanceFileResults) ||
      attendanceFileResults.length === 0
    ) {
      console.error(`Attendance file with ID ${id} is not registered.`);
      return {
        status: 400,
        success: false,
        errors: [`Attendance file with ID ${id} is not registered.`]
      };
    }

    const attendanceFile = attendanceFileResults[0];
    let newTeamsAttendanceFileUrl = attendanceFile.teamsAttendanceFile;

    // Validate classId before updating
    if (updatedData.classId) {
      const [classExists] = await bigquery.query({
        query: `SELECT id FROM \`teqcertify.lms.${TABLE_CLASS}\` WHERE id = @classId`,
        params: { classId: updatedData.classId }
      });

      if (!Array.isArray(classExists) || classExists.length === 0) {
        console.error(`Class ID ${updatedData.classId} does not exist.`);
        return {
          success: false,
          message: 'Invalid classId. Class does not exist.'
        };
      }
    }

    // Handle TeamsAttendanceFile Update
    if (file) {
      try {
        // Delete old file if exists
        const oldFileName = attendanceFile.teamsAttendanceFile
          ?.split('/')
          .pop();
        if (oldFileName) {
          await deleteAttendanceForClassFromGCS(oldFileName);
        }

        // Upload new file
        const fileName = `${id}.${file.mimetype.split('/')[1]}`;
        newTeamsAttendanceFileUrl = await uploadAttendanceFileForClassToGCS(
          file.buffer,
          fileName,
          file.mimetype
        );
      } catch (uploadError) {
        console.error('Error uploading attendance file:', uploadError);
        return { success: false, message: 'Failed to upload attendance file.' };
      }
    }

    // Prepare update values
    const queryParams: Record<string, any> = {
      id,
      classId: updatedData.classId || attendanceFile.classId,
      teamsAttendanceFile: newTeamsAttendanceFileUrl,
      attendanceDate:
      updatedData.attendanceDate || attendanceFile.attendanceDate,
      updatedBy: user?.id,
      updatedAt: new Date().toISOString()
    };

    // Execute update query using updateAttendanceFile
    await bigquery.query({
      query: attendanceFileQueries.updateAttendanceFile, // Using the predefined query name
      params: queryParams
    });

    // Insert Audit Log
    const auditLogParams = {
      id: uuidv4(),
      entityType: "AttendanceFile",
      entityId: id,
      action: "UPDATE",
      previousData: null,
      newData: JSON.stringify({
        id,
        classId: updatedData.classId,
        teamsAttendanceFile: updatedData.teamsAttendanceFile,
        attendanceDate: updatedData.attendanceDate,
      }),
      performedBy: user?.id,
      createdAt: new Date().toISOString(),
    };

    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: auditLogParams,
      types: { previousData: "STRING", newData: "STRING", createdAt: "TIMESTAMP" },
    });

    return {
      message: `Attendance file with ID ${id} updated successfully.`,
      attendanceFileData: updatedData
    };
  } catch (error) {
    console.error(`Error updating attendance file with ID ${id}:`, error);
    return {
      status: 500,
      success: false,
      errors: ['Internal server error occurred.']
    };
  }
};

// **Delete AttendanceFile Handler**
export const deleteAttendanceFileHandler = async (req: any, id: string) => {
  try {

    const { user } = req;
    console.log(`Deleting attendanceFile with ID: ${id}`);
    if (!(await checkAttendanceFileTableExists()))
      throw new Error(`Table '${TABLE_ATTENDANCE_FILE}' does not exist.`);

    const [rows] = await bigquery.query({
      query: attendanceFileQueries.getAttendanceFileById,
      params: { id }
    });

    const attendance = rows[0];

    if (!rows.length) {
      return { success: false, message: 'AttendanceFile not found.' };
    }

    const fileName = rows[0].teamsAttendanceFile?.split('/').pop();
    if (fileName) {
      console.log('Deleting TeamsAttendanceFile...');
      await deleteAttendanceForClassFromGCS(fileName);
    }

    await bigquery.query({
      query: attendanceFileQueries.deleteAttendanceFile,
      params: { id }
    });

    // Insert Audit Log
    const auditLogParams = {
      id: uuidv4(),
      entityType: "AttendanceFile",
      entityId: id,
      action: "DELETE",
      previousData: JSON.stringify(attendance),
      newData:null,
      performedBy: user?.id,
      createdAt: new Date().toISOString(),
    };

    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: auditLogParams,
      types: { previousData: "STRING", newData: "STRING", createdAt: "TIMESTAMP" },
    });

    console.log(`TeamsAttendanceFile with ID ${id} deleted successfully.`);

    return {
      success: true,
      message: `AttendanceFile with ID ${id} deleted successfully.`
    };
  } catch (error) {
    console.error(`Error deleting AttendanceFile with ID ${id}:`, error);
    return { success: false, errors: ['Internal server error occurred.'] };
  }
};

//Attendance

// ✅ Check if Attendance Table Exists
const checkAttendanceTableExists = async (): Promise<boolean> => {
  try {
    const [rows] = await bigquery.query({
      query: attendanceQueries.checkTableExists,
      params: { tableName: process.env.TABLE_ATTENDANCE }
    });

    return rows.length > 0;
  } catch (error) {
    console.error('Error checking attendance table existence:', error);
    throw new Error('Database error while checking table existence.');
  }
};

// ✅ Create Attendance Table If Not Exists
const createAttendanceTableIfNotExists = async (): Promise<void> => {
  if (!(await checkAttendanceTableExists())) {
    try {
      await bigquery.query({ query: attendanceQueries.createAttendanceTable });
      console.log('✅ Attendance table created successfully.');
    } catch (error) {
      console.error('❌ Error creating attendance table:', error);
      throw new Error('Failed to create attendance table.');
    }
  }
};

//Attendance - Create
export const createAttendanceHandler = async (req: Request, 
  res: Response) => {
  try {
    const { batchId, courseId, moduleId, classId, attendanceFileId } = req.body;
    const excelFile = req.file; 
    const { user } = req;

    if (!excelFile) {
      return res.status(400).json({ message: 'No file uploaded!' });
    }

    await createAttendanceTableIfNotExists(); // Ensure table exists before inserting data

    // Read the uploaded Excel file
    const fileBuffer = excelFile.buffer;
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    if (!workbook.SheetNames.length) {
      return res
        .status(400)
        .json({ message: 'Uploaded file is invalid or empty' });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet || Object.keys(worksheet).length === 0) {
      return res
        .status(400)
        .json({ message: 'No valid data found in the Excel file' });
    }

    const excelData: Record<string, any>[] =
      XLSX.utils.sheet_to_json(worksheet);
    if (excelData.length === 0) {
      return res
        .status(400)
        .json({ message: 'Excel file is empty or improperly formatted' });
    }

    // Validate batch, module, class, and attendanceFileId exist in the database
    const [batchExists] = await bigquery.query({
      query: attendanceQueries.validateBatchId,
      params: { batchId }
    });
    if (!batchExists.length)
      return res.status(400).json({ message: 'Invalid batchId' });

    const [moduleExists] = await bigquery.query({
      query: attendanceQueries.validateModuleId,
      params: { moduleId }
    });

    if (!moduleExists.length)
      return res.status(400).json({ message: 'Invalid moduleId' });

    const [classExists] = await bigquery.query({
      query: attendanceQueries.validateClassId,
      params: { classId }
    });

    if (!classExists.length)
      return res.status(400).json({ message: 'Invalid classId' });

    const [fileExists] = await bigquery.query({
      query: attendanceQueries.validateAttendanceFileId,
      params: { attendanceFileId }
    });

    if (!fileExists.length)
      return res.status(400).json({ message: 'Invalid attendanceFileId' });

    const missingUsers: string[] = [];
    const attendancePromises: Promise<any>[] = [];

    // Iterate through each row in the parsed Excel data
    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];

      const name = row['Name']?.trim();
      const firstJoin = row['First Join']?.trim();
      const lastLeave = row['Last Leave']?.trim();
      const email = row['Email']?.trim();
      const percentage = row['Participation Rate']?.trim();
      const duration = row['In-Meeting Duration']?.trim();
      const role = row['Role']?.trim();
      const attendanceValue = row['Attendance']?.trim();

      if (!email || !duration || !role || attendanceValue === undefined) {
        console.warn(`⚠ Missing required data in row ${i + 1}`);
        continue;
      }

      // Validate user by email
      const [userExists] = await bigquery.query({
        query: `SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` WHERE email = @email`,
        params: { email }
      });

      if (!userExists.length) {
        console.warn(`⚠ User with email ${email} not found in row ${i + 1}`);
        missingUsers.push(email);
        continue;
      }

      const userId = userExists[0].id;
      const attendanceId = uuidv4();
      const createdAt = new Date().toISOString();

      // ✅ Convert percentage from "XX.XX%" to FLOAT64
      const percentageValue = percentage
        ? parseFloat(percentage.replace('%', ''))
        : null;

      // ✅ Convert duration from "XXm YYs" to total seconds (INT64)
      const durationValue = duration
        ? duration.split(' ').reduce((acc: number, val: string) => {
            if (val.includes('m')) return acc + parseInt(val) * 60;
            if (val.includes('s')) return acc + parseInt(val);
            return acc;
          }, 0)
        : null;

      // ✅ Convert attendance from "Present"/"Absent" to BOOL
      const attendanceValueBool = attendanceValue.toLowerCase() === 'present';

      // ✅ Convert "MM/DD/YY, HH:mm:ss AM/PM" to "YYYY-MM-DD HH:MM:SS"
      const convertToBigQueryTimestamp = (dateString: string | null) => {
        if (!dateString) return null;
        const dateObj = new Date(dateString);
        return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')}`;
      };

      const firstJoinFormatted = convertToBigQueryTimestamp(firstJoin);
      const lastLeaveFormatted = convertToBigQueryTimestamp(lastLeave);

      console.log('📌 Creating attendance with data:', {
        attendanceId,
        userId,
        batchId,
        courseId,
        moduleId,
        classId,
        firstJoin: firstJoinFormatted,
        lastLeave: lastLeaveFormatted,
        email,
        percentage: percentageValue,
        duration: durationValue,
        teamsRole: role,
        attendance: attendanceValueBool,
        attendanceFileId
      });

      // Insert Attendance Record
      const attendancePromise = bigquery
        .query({
          query: attendanceQueries.insertAttendance,
          params: {
            id: attendanceId,
            userId,
            batchId,
            courseId,
            moduleId,
            classId,
            firstJoin: firstJoinFormatted,
            lastLeave: lastLeaveFormatted,
            email,
            percentage: percentageValue,
            duration: durationValue,
            teamsRole: role,
            attendance: attendanceValueBool,
            attendanceFileId,
            createdBy: user?.id,
            createdAt: createdAt
          }
        })
        .catch((error) => {
          console.error(
            `❌ Error creating attendance for row ${i + 1}:`,
            error
          );
        });

      attendancePromises.push(attendancePromise);
    }

    // Wait for all attendance creation promises to resolve
    await Promise.all(attendancePromises);

    // Return missing users if any
    if (missingUsers.length > 0) {
      return res.status(400).json({
        message: 'Some users were not found in the system.',
        missingUsers
      });
    };

    const auditLogParams = {
      id: uuidv4(),
      entityType: "Attendance",
      entityId: batchId,
      action: "CREATE",
      previousData: null,
      newData: JSON.stringify(attendancePromises),
      performedBy: user?.id,
      createdAt: new Date().toISOString(),
    };

    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: auditLogParams,
      types: { previousData: "STRING", newData: "STRING", createdAt: "TIMESTAMP" },
    });
    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: auditLogParams,
      types: { previousData: "STRING", newData: "STRING", createdAt: "TIMESTAMP" },
    });

    res.status(201).json({ message: '✅ Attendances created successfully' });
  } catch (error) {
    console.error('❌ Error during attendance creation:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// ✅ Update Attendance
export const updateAttendanceByClassIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { classId } = req.query; // Get classId from query params
    const updateData = req.body; // Expect bulk update data in the request body
    const { user } = req;

    if (!classId) {
      return res.status(400).json({ message: 'classId is required!' });
    }

    // Ensure the classId exists before updating
    const [classExists] = await bigquery.query({
      query: `SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASSES}\` WHERE id = @classId`,
      params: { classId }
    });

    if (!classExists.length) {
      return res.status(404).json({ message: 'Class not found!' });
    }

    console.log(`Updating attendance records for classId: ${classId}`);

    // Perform the bulk update
    await bigquery.query({
      query: attendanceQueries.updateAttendance,
      params: {
        classId,
        batchId: updateData.batchId || null,
        courseId: updateData.courseId || null,
        moduleId: updateData.moduleId || null,
        firstJoin: updateData.firstJoin || null,
        lastLeave: updateData.lastLeave || null,
        duration: updateData.duration || null,
        email: updateData.email || null,
        teamsRole: updateData.teamsRole || null,
        attendance: updateData.attendance || null,
        attendanceFileId: updateData.attendanceFileId || null
      }
    });

     // Insert Audit Log
     const auditLogParams = {
      id: uuidv4(),
      entityType: "Attendance",
      entityId: classId,
      action: "UPDATE",
      previousData: null,
      newData: JSON.stringify({
        classId: updateData.classId,
        teamsAttendanceFile: updateData.teamsAttendanceFile,
        attendanceDate: updateData.attendanceDate,
      }),
      performedBy: user?.id,
      createdAt: new Date().toISOString(),
    };

    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: auditLogParams,
      types: { previousData: "STRING", newData: "STRING", createdAt: "TIMESTAMP" },
    });


    console.log(
      `✅ Attendance records updated successfully for classId: ${classId}`
    );

    return res.status(200).json({
      success: true,
      message: 'Attendance records updated successfully.'
    });
  } catch (error) {
    console.error('❌ Error updating attendance:', error);
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// ✅ Delete Attendance
export const deleteAttendanceByClassIdHandler = async (req:any, classId: string) => {
  try {

    const { user } = req;
    console.log(`Deleting attendance records for classId: ${classId}`);

    // Execute the DELETE query
    const [result] = await bigquery.query({
      query: attendanceQueries.deleteAttendance,
      params: { classId }
    });

    const deleteAttendance = result[0];
    console.log(`Deleted records for classId: ${classId}`);

      // Insert Audit Log
      const auditLogParams = {
        id: uuidv4(),
        entityType: "Attendance",
        entityId: classId,
        action: "DELETE",
        previousData: JSON.stringify(deleteAttendance),
        newData:null,
        performedBy: user?.id,
        createdAt: new Date().toISOString(),
      };
  
      await bigquery.query({
        query: auditQueries.insertAuditLog,
        params: auditLogParams,
        types: { previousData: "STRING", newData: "STRING", createdAt: "TIMESTAMP" },
      });
  

    return {
      success: true,
      message: `Attendance records for classId: ${classId} deleted successfully.`
    };
  } catch (error) {
    console.error('Error deleting attendance records:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred.'
    };
  }
};

export const getAllAttendanceHandler = async () => {
  try {
    console.log('Fetching all attendance...');
    const [rows] = await bigquery.query({
      query: attendanceQueries.getAllAttendance
    });
    console.log(` attendance found: ${rows.length}`);
    return rows;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};

export const getAttendanceHandler = async (req: Request): Promise<any> => {
  try {
    const { id } = req.params;
    const { userId, batchId, courseId, classId } = req.query;

    let query: string;
    let params: Record<string, any> = {};

    if (id) {
      // Fetch attendance by specific ID
      query = `
        SELECT * 
        FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE}\`
        WHERE id = @id
      `;
      params = { id };
    } else {
      // Build dynamic query based on provided filters
      const conditions: string[] = [];
      if (userId) {
        conditions.push('att.userId = @userId');
        params.userId = userId;
      }
      if (batchId) {
        conditions.push('att.batchId = @batchId');
        params.batchId = batchId;
      }
      if (courseId) {
        conditions.push('att.courseId = @courseId');
        params.courseId = courseId;
      }
      if (classId) {
        conditions.push('att.classId = @classId');
        params.classId = classId;
      }

      // Ensure at least one condition is provided
      if (conditions.length === 0) {
        return {
          error: true,
          message:
            'At least one filter parameter (userId, batchId, courseId, classId) is required'
        };
      }

      // Construct the query dynamically
      query = `
       SELECT 
          att.id AS attendanceId, att.userId, att.batchId, att.courseId, att.moduleId, att.classId,
          att.firstJoin, att.lastLeave, att.duration, att.email, att.teamsRole, att.attendance,
          att.attendanceFileId, att.createdAt AS attendanceCreatedAt, att.updatedAt AS attendanceUpdatedAt,
          
          -- User Information
          u.firstName, u.lastName,
          
          -- Batch, Module, Course, and Class Information
          b.batchName, 
          m.moduleName, 
          c.courseName, 
          cls.classTitle,
          
          -- Assignment Completion Information
          ac.courseAssignId, ac.obtainedPercentage, ac.obtainedMarks, 
          ac.createdAt AS assignmentCreatedAt, ac.classId AS assignmentClassId, 
          ac.id AS assignCompletionId, ac.traineeId AS assignmentTraineeId

        FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE}\` att

        -- Joins
        LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u 
          ON att.userId = u.id

        LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\` b 
          ON att.batchId = b.id

        LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\` m 
          ON att.moduleId = m.id

        LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\` c 
          ON att.courseId = c.id

        LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` cls 
          ON att.classId = cls.id

        LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENTCOMPLETION}\` ac 
          ON att.userId = ac.traineeId 
          AND att.classId = ac.classId

        WHERE ${conditions.join(' AND ')}

      `;
    }

    console.log('🚀 Executing query:', query);
    console.log('🔍 Query parameters:', params);

    const [attendanceRecords] = await bigquery.query({ query, params });

    if (!attendanceRecords.length) {
      return { error: true, message: 'No attendance records found' };
    }

    return { error: false, attendanceRecords };
  } catch (error) {
    console.error('❌ Error fetching attendance:', error);
    return {
      error: true,
      message: 'Error fetching attendance records',
      details: error
    };
  }
};
