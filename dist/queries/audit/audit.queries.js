"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.auditQueries = void 0;
const auditQueries = exports.auditQueries = {
  insertAuditLog: `
    INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_AUDIT}\`
    (id, entityType, entityId, action, previousData, newData, performedBy, createdAt)
    VALUES (@id, @entityType, @entityId, @action, @previousData, @newData, @performedBy, @createdAt)
  `
};
//# sourceMappingURL=audit.queries.js.map