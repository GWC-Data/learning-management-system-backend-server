"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.batchTrainerQueries = void 0;
const batchTrainerQueries = exports.batchTrainerQueries = {
  getBatchTrainerIds: `
    SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\`
    WHERE id IN UNNEST(@trainerIds)
  `,
  insertBatchTrainer: `
    INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINER}\`
    (batchModuleScheduleId, trainerId, createdAt, updatedAt)
    VALUES (@batchClassScheduleId, @trainerId, @createdAt, @updatedAt)
  `,
  deleteBatchTrainer: `
    DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINER}\`
    WHERE batchClassScheduleId = @batchClassScheduleId
  `
};
//# sourceMappingURL=batchTrainer.queries.js.map