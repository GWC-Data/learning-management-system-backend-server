"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authQueries = void 0;
const authQueries = exports.authQueries = {
  loginbyEmail: `
      SELECT id, email, password 
      FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` 
      WHERE email = @email
    `,
  // Fetch user details, role, and permissions
  getUserDetailsWithRole: `
      SELECT 
        u.id, u.firstName, u.lastName, u.email, 
        r.id as roleId, r.name as roleName, 
        ARRAY_AGG(p.action) as permissions
      FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u
      JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ROLE}\` r 
        ON u.roleId = r.id
      LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ROLE_PERMISSION}\` rp
        ON r.id = rp.roleId
      LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_PERMISSION}\` p
        ON rp.permissionId = p.id
      WHERE u.id = @userId
      GROUP BY u.id, u.firstName, u.lastName, u.email, r.id, r.name
    `
};
//# sourceMappingURL=auth.queries.js.map