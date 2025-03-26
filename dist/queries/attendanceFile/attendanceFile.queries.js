"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attendanceFileQueries = void 0;
const attendanceFileQueries = exports.attendanceFileQueries = {
  // Validate if classId exists in the classes table before any operation
  validateClassId: `
      SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\`
      WHERE id = @classId
    `,
  createAttendanceFile: `
      INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE_FILE}\`
      (id, classId, teamsAttendanceFile, attendanceDate, createdBy, createdAt)
      VALUES (@id, @classId, @teamsAttendanceFile, @attendanceDate, @createdBy, @createdAt)
    `,
  updateAttendanceFile: `
      UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE_FILE}\`
      SET classId = @classId,
          teamsAttendanceFile = @teamsAttendanceFile, 
          attendanceDate = @attendanceDate, 
          updatedBy = @updatedBy,
          updatedAt = @updatedAt 
      WHERE id = @id
    `,
  getAllAttendanceFiles: `
      SELECT af.*, c.classTitle
      FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE_FILE}\` af
      JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` c
      ON af.classId = c.id
    `,
  getAttendanceFileById: `
      SELECT af.*, c.classTitle
      FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE_FILE}\` af
      JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` c
      ON af.classId = c.id
      WHERE af.id = @id
    `,
  getAttendanceFilesByClassId: `
      SELECT af.*, c.classTitle
      FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE_FILE}\` af
      JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` c
      ON af.classId = c.id
      WHERE af.classId = @classId
    `,
  deleteAttendanceFile: `
      DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ATTENDANCE_FILE}\`
      WHERE id = @id
    `
};
//# sourceMappingURL=attendanceFile.queries.js.map