"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attendanceQueries = void 0;
const attendanceQueries = exports.attendanceQueries = {
  // Check if a table exists in BigQuery
  checkTableExists: `
    SELECT table_name 
    FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.INFORMATION_SCHEMA.TABLES\` 
    WHERE table_name = @tableName
  `,
  // Create Attendance Table
  createAttendanceTable: `
    CREATE TABLE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE}\` (
      id STRING NOT NULL,
      userId STRING NOT NULL,
      batchId STRING NOT NULL,
      courseId STRING NOT NULL,
      moduleId STRING NOT NULL,
      classId STRING NOT NULL,
      firstJoin TIMESTAMP,
      lastLeave TIMESTAMP,
      email STRING NOT NULL,
      percentage FLOAT64,
      duration INT64,
      teamsRole STRING,
      attendance BOOL,
      attendanceFileId STRING,
      createdBy STRING, 
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  // ✅ Validate if batchId exists
  validateBatchId: `
    SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\` WHERE id = @batchId
  `,
  // ✅ Validate if moduleId exists
  validateModuleId: `
    SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\` WHERE id = @moduleId
  `,
  // ✅ Validate if classId exists
  validateClassId: `
    SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` WHERE id = @classId
  `,
  // ✅ Validate if attendanceFileId exists
  validateAttendanceFileId: `
    SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE_FILE}\` WHERE id = @attendanceFileId
  `,
  // ✅ Validate if user exists by email
  findUserByEmail: `
    SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` WHERE email = @email
  `,
  // ✅ Validate if attendanceFileId exists in attendanceFiles table
  validateAttendanceFile: `
    SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE_FILE}\` WHERE id = @attendanceFileId
  `,
  // ✅ Insert Attendance Record
  insertAttendance: `
    INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE}\` (
      id, userId, batchId, courseId, moduleId, classId, firstJoin, lastLeave, email, 
      percentage, duration, teamsRole, attendance, attendanceFileId, createdAt, updatedAt
    ) VALUES (
      @id, @userId, @batchId, @courseId, @moduleId, @classId, @firstJoin, @lastLeave, @email, 
      @percentage, @duration, @teamsRole, @attendance, @attendanceFileId, @createdAt, @updatedAt
    )
  `,
  // ✅ Get all attendance records
  getAllAttendance: `
  SELECT 
    att.id AS attendanceId,
    
    -- User Details
    att.userId AS userId,
    CONCAT(u.firstName, ' ', u.lastName) AS userName,

    -- role Details
    role.id AS roleId,
    role.name AS roleName,

    -- Batch Details
    att.batchId AS batchId,
    b.batchName AS batchName,

    -- Course Details
    att.courseId AS courseId,
    c.courseName AS courseName,

    -- Module Details
    att.moduleId AS moduleId,
    m.moduleName AS moduleName,

    -- Class Details
    att.classId AS classId,
    cls.classTitle AS classTitle,

    -- Attendance Data
    att.firstJoin AS firstJoin,
    att.lastLeave AS lastLeave,
    att.duration AS duration,
    att.email AS email,
    att.teamsRole AS teamsRole,
    att.attendance AS attendance,
    att.percentage AS percentage,

  FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE}\` att
  
  -- Joining User Table
  LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u 
    ON att.userId = u.id

    LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ROLE}\` role 
    ON u.roleId = role.id

  -- Joining Batch Table
  LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\` b 
    ON att.batchId = b.id

  -- Joining Course Table
  LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\` c 
    ON att.courseId = c.id

  -- Joining Module Table
  LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\` m 
    ON att.moduleId = m.id

  -- Joining Class Table
  LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` cls 
    ON att.classId = cls.id
`,
  // ✅ Get attendance by ID
  getAttendanceById: `
    SELECT * FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE}\`
    WHERE id = @id
  `,
  // ✅ Update Attendance
  updateAttendance: `
UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE}\`
SET 
  batchId = @batchId,
  courseId = @courseId,
  moduleId = @moduleId,
  firstJoin = @firstJoin,
  lastLeave = @lastLeave,
  duration = @duration,
  email = @email,
  teamsRole = @teamsRole,
  attendance = @attendance,
  attendanceFileId = @attendanceFileId,
  updatedAt = CURRENT_TIMESTAMP()
WHERE classId = @classId;

  `,
  // ✅ Delete Attendance
  deleteAttendance: `
    DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE}\`
    WHERE classId = @classId
  `
};
//# sourceMappingURL=attendanceQueries.js.map