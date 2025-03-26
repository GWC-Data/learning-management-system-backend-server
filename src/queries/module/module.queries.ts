export const moduleQueries = {
  createModule: `
            INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\`
             (id, courseId, moduleName, moduleDescription, sequence, materialForModule, createdBy, createdAt)
        VALUES (@id, @courseId, @moduleName, @moduleDescription, @sequence, @materialForModule, @createdBy, @createdAt)
  `,

  getAllModules: `
      SELECT
        m.id AS moduleId,
        m.courseId AS courseId,
        m.moduleName AS moduleName,
        m.moduleDescription AS moduleDescription,
        m.sequence AS sequence,
        m.materialForModule AS materialForModule,
        m.createdBy AS createdBy,
        CONCAT(u.firstName, ' ', u.lastName) AS createdByUserName,
        c.courseName AS courseName,
        c.courseDesc AS courseDesc,
        c.courseCategoryId AS courseCategoryId,
        c.courseImg AS courseImg,
        c.courseLink AS courseLink
        FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\` m
        LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\` c
            ON m.courseId = c.id
        LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u
        ON m.createdBy = u.id;
    `,

    getModule: `
    SELECT
      m.id AS moduleId,
      m.courseId AS courseId,
      m.moduleName AS moduleName,
      m.moduleDescription AS moduleDescription,
      m.sequence AS sequence,
      m.materialForModule AS materialForModule,
      m.createdBy AS createdBy,
      CONCAT(u.firstName, ' ', u.lastName) AS createdByUserName,
      c.courseName AS courseName,
      c.courseDesc AS courseDesc,
      c.courseCategoryId AS courseCategoryId,
      c.courseImg AS courseImg,
      c.courseLink AS courseLink
    FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\` m
    LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\` c
      ON m.courseId = c.id
    LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u
      ON m.createdBy = u.id
    WHERE m.id = @moduleId
    ORDER BY m.id;
  `,  

  updateModule: `
            UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\`
                SET courseId = @courseId, moduleName = @moduleName, moduleDescription = @moduleDescription, 
                sequence = @sequence, materialForModule = @materialForModule, updatedBy = @updatedBy, updatedAt = @updatedAt
                WHERE id = @moduleId`,
  deleteModule: `
            DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\`
              WHERE id = @id`
};
