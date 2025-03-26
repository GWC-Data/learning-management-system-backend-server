"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queries = void 0;
const queries = exports.queries = {
  createCourseCategory: `
            INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE_CATEGORY}\`
            (id, coursecategoryName, description, coursecategoryImg, createdBy, createdAt)
            VALUES (@id, @coursecategoryName, @description, @coursecategoryImg, @createdBy, @createdAt)
          `,
  getAllCourseCategories: `
            SELECT * 
            FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE_CATEGORY}\`
          `,
  getCourseCategoryById: `
            SELECT * FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE_CATEGORY}\`
            WHERE id = @id
          `,
  updateCourseCategory: `
            UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE_CATEGORY}\`
            SET coursecategory = @coursecategory, 
                description = @description, 
                coursecategoryImg = @coursecategoryImg, 
                updatedBy = @updatedBy,
                updatedAt = @updatedAt 
            WHERE id = @id
          `,
  deleteCourseCategory: `
            DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE_CATEGORY}\`
            WHERE id = @id
          `
};
//# sourceMappingURL=courseCategory.queries.js.map