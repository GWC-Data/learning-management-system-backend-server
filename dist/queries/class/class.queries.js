"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.classQueries = void 0;
const classQueries = exports.classQueries = {
  createClass: `
      INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\`
        (id, classTitle, classDescription, moduleId, assignmentName, assignmentFile, materialForClass, totalMarks, createdBy, createdAt)
        VALUES (@id, @classTitle, @classDescription, @moduleId, @assignmentName, @assignmentFile, @materialForClass, @totalMarks, @createdBy, @createdAt)
    `,
  getAllClasses: `
      SELECT
        c.id AS classId,
        c.classTitle AS classTitle,
        c.classDescription AS classDescription,
        c.classRecordedLink AS classRecordedLink,
        c.moduleId AS moduleId,
        c.materialForClass AS materialForClass,
        c.createdAt AS createdAt,
        c.updatedAt AS updatedAt,
        m.moduleName AS moduleName,
        c.assignmentName AS assignmentName,
        c.assignmentFile AS assignmentFile,
        c.totalMarks AS totalMarks,
        c.createdBy AS createdBy
        FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` c
        LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\` m
          ON c.moduleId = m.id
    `,
  getClass: `
      SELECT
        c.id AS classId,
        c.classTitle AS classTitle,
        c.classDescription AS classDescription,
        c.classRecordedLink AS classRecordedLink,
        c.moduleId AS moduleId,
        c.materialForClass AS materialForClass,
        c.createdAt AS createdAt,
        c.updatedAt AS updatedAt,
        m.moduleName AS moduleName,
        c.assignmentName AS assignmentName,
        c.assignmentFile AS assignmentFile,
        c.totalMarks AS totalMarks,
        c.createdBy AS createdBy
        FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` c
        LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\` m
          ON c.moduleId = m.id
        WHERE c.id = @classId
        ORDER BY c.id;
    `,
  getClassByModuleId: `
      SELECT
        c.id AS classId,
        c.classTitle AS classTitle,
        c.classDescription AS classDescription,
        c.classRecordedLink AS classRecordedLink,
        c.moduleId AS moduleId,
        c.materialForClass AS materialForClass,
        c.createdAt AS createdAt,
        c.updatedAt AS updatedAt,
        m.moduleName AS moduleName,
        c.assignmentName AS assignmentName,
        c.assignmentFile AS assignmentFile,
        c.totalMarks AS totalMarks,
        c.createdBy AS createdBy
        FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` c
        LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\` m
          ON c.moduleId = m.id
      WHERE c.moduleId = @moduleId
      ORDER BY c.totalMarks
  `,
  updateClass: `
          UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\`
              SET classTitle = @classTitle, classDescription = @classDescription, classRecordedLink = @classRecordedLink, assignmentName = @assignmentName,
              assignmentFile = @assignmentFile, materialForClass = @materialForClass, totalMarks = @totalMarks,
              updatedBy = @updatedBy, updatedAt = @updatedAt
              WHERE id = @classId`,
  deleteClass: `
          DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\`
                WHERE id = @id`
};
//# sourceMappingURL=class.queries.js.map