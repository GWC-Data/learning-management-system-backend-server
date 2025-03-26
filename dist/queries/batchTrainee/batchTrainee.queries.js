"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.batchTraineeQueries = void 0;
const batchTraineeQueries = exports.batchTraineeQueries = {
  getBatchTraineeIds: `
    SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\`
    WHERE id IN UNNEST(@traineeIds)
  `,
  insertBatchTrainee: `
    INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINEE}\`
    (batchId, traineeId, createdAt, updatedAt)
    VALUES (@batchId, @traineeId, @createdAt, @updatedAt)
  `,
  deleteBatchTrainee: `
    DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINEE}\`
    WHERE batchId = @batchId
  `
};
//# sourceMappingURL=batchTrainee.queries.js.map