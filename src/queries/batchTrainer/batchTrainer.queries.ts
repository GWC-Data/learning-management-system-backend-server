export const batchTrainerQueries = {
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
  `,
};