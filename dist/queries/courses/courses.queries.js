"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.courseQueries = void 0;
const courseQueries = exports.courseQueries = {
  createCourse: `
        INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\`
         (id, courseName, courseDesc, courseCategoryId,courseImg,courseLink, createdBy, createdAt)
    VALUES (@id, @courseName, @courseDesc, @courseCategoryId, @courseImg, @courseLink, @createdBy, @createdAt)
`,
  getAllCourses: `
    SELECT 
      c.id AS courseId, 
      c.courseName AS courseName, 
      c.courseDesc AS courseDesc, 
      c.courseCategoryId AS courseCategoryId,
      c.courseImg AS courseImg,
      c.courseLink AS courseLink,
      cc.coursecategoryName AS courseCategoryName,
      cc.description AS courseCategoryDescription,
      cc.coursecategoryImg AS courseCategoryImg,
      c.createdBy AS createdBy,
      CONCAT(u.firstName, ' ', u.lastName) AS createdByUserName
    FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\` c
    LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE_CATEGORY}\` cc 
      ON c.courseCategoryId = cc.id
    LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u
        ON c.createdBy = u.id;
`,
  getCourse: `
    SELECT 
      c.id AS courseId, 
      c.courseName AS courseName, 
      c.courseDesc AS courseDesc, 
      c.courseCategoryId AS courseCategoryId,
      c.courseImg AS courseImg,
      c.courseLink AS courseLink,
      cc.coursecategoryName AS courseCategoryName,
      cc.description AS courseCategoryDescription,
      cc.coursecategoryImg AS courseCategoryImg,
      c.createdBy AS createdBy,
      CONCAT(u.firstName, ' ', u.lastName) AS createdByUserName
    FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\` c
    LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE_CATEGORY}\` cc 
      ON c.courseCategoryId = cc.id
    LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u
      ON c.createdBy = u.id
    WHERE c.id = @courseId
    ORDER BY c.id;
`,
  updateCourse: `
        UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\`
            SET courseName = @courseName, courseDesc = @courseDesc, courseCategoryId = @courseCategoryId, courseImg = @courseImg, courseLink = @courseLink, 
            updatedBy = @updatedBy, updatedAt = @updatedAt
            WHERE id = @courseId`,
  deleteCourse: `
        DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\`
            WHERE id = @id`
};
//# sourceMappingURL=courses.queries.js.map