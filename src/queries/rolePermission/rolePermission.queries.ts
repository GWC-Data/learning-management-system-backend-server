export const rolePermissionQueries = {
    getPermissionIds: `
      SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_PERMISSION}\`
      WHERE action IN UNNEST(@actions)
    `,
  
    insertRolePermissions: `
    INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ROLE_PERMISSION}\`
    (roleId, permissionId, createdAt, updatedAt)
    VALUES (@roleId, @permissionId, @createdAt, @updatedAt)
  `,

   deleteRolePermissions: `
    DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ROLE_PERMISSION}\`
    WHERE roleId = @roleId;
  `,
  };
  