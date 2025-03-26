"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.batchQueries = void 0;
const batchQueries = exports.batchQueries = {
  createBatch: `
        INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\`
         (id, courseId, batchName, startDate, endDate, createdBy, createdAt)
    VALUES (@id, @courseId, @batchName, @startDate, @endDate, @createdBy, @createdAt)
`,
  getBatchDetails: `
   SELECT 
      b.id AS batchId, 
      b.courseId AS batchCourseId, 
      b.batchName AS batchName,
      b.startDate AS batchStartDate, 
      b.endDate AS batchEndDate,
      c.courseName AS courseName,
      c.courseImg AS courseImg,
      c.courseLink AS courseLink,
      ARRAY_AGG(
        STRUCT(
          t.id AS traineeId,
          t.firstName AS firstName,
          t.lastName AS lastName
        )
      ) AS trainees
  FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\` b
  LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINEE}\` bt 
      ON b.id = bt.batchId
  LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` t 
      ON bt.traineeId = t.id
  LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\` c
      ON b.courseId = c.id
  WHERE b.id = @batchId
  GROUP BY b.id, b.courseId, b.batchName, b.startDate, b.endDate, c.courseName, c.courseImg, c.courseLink;
`,
  getBatches: `
  SELECT 
    b.id AS batchId, 
    b.courseId AS batchCourseId, 
    b.batchName AS batchName,
    b.startDate AS batchStartDate, 
    b.endDate AS batchEndDate,
    t.id AS traineeId, 
    t.firstName AS traineeFirstName,
    t.lastName AS traineeLastName,
    c.courseName AS courseName,
    c.courseImg AS courseImg,
    c.courseLink AS courseLink
  FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\` b
  LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINEE}\` bt 
    ON b.id = bt.batchId
  LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` t 
    ON bt.traineeId = t.id
  LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\` c
    ON b.courseId = c.id
    ORDER BY b.id;
`,
  getBatchByBatchName: `
SELECT 
  b.id AS batchId, 
  b.batchName, 
  b.startDate, 
  b.endDate,
  c.id AS courseId, 
  c.courseName, 
  c.courseImg, 
  c.courseLink,
  u.id AS traineeId, 
  u.firstName, 
  u.lastName
FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\` b
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\` c 
  ON b.courseId = c.id
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINEE}\` bt 
  ON b.id = bt.batchId
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u 
  ON bt.traineeId = u.id
WHERE b.batchName = @batchName;
`,
  getBatchIdsByTraineeId: `
     SELECT DISTINCT bt.batchId
    FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINEE}\` bt
    WHERE bt.traineeId = @traineeId;`,
  updateBatch: `
      UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\`
          SET courseId = @courseId, batchName = @batchName, startDate = @startDate, endDate = @endDate,
          updatedBy = @updatedBy, updatedAt = @updatedAt
          WHERE id = @batchId`,
  deleteBatch: `
       DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\`
          WHERE id = @id`
};
//# sourceMappingURL=batch.queries.js.map