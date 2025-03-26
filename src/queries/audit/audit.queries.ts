export const auditQueries = {
  insertAuditLog: `
    INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_AUDIT}\`
    (id, entityType, entityId, action, previousData, newData, performedBy, createdAt)
    VALUES (@id, @entityType, @entityId, @action, @previousData, @newData, @performedBy, @createdAt)
  `,
};
