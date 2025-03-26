export const assignmentCompletionQueries = {
  createAssignmentCompletion: `
      INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENTCOMPLETION}\`
      (id, classId, traineeId, obtainedMarks, courseAssignmentAnswerFile, obtainedPercentage, createdAt)
      VALUES (@id, @classId, @traineeId, @obtainedMarks, @courseAssignmentAnswerFile, @obtainedPercentage, @createdAt)
    `,

  getAllAssignmentCompletions: `
      SELECT * 
      FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENTCOMPLETION}\`
    `,

  getAssignmentCompletionById: `
      SELECT * 
      FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENTCOMPLETION}\`
      WHERE id = @id
    `,

  updateAssignmentCompletion: `
      UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENTCOMPLETION}\`
      SET classId = @classId, 
          traineeId = @traineeId, 
          obtainedMarks = @obtainedMarks, 
          obtainedPercentage = @obtainedPercentage,
          courseAssignmentAnswerFile = @courseAssignmentAnswerFile, 
          updatedBy = @updatedBy,
          updatedAt = @updatedAt 
      WHERE id = @id
    `,

  deleteAssignmentCompletion: `
      DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENTCOMPLETION}\`
      WHERE id = @id
    `
};