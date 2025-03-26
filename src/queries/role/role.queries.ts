export const roleQueries = {
    createRole: `
        INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ROLE}\`
         (id, name, description, createdBy, createdAt)
    VALUES (@id, @name, @description, @createdBy, @createdAt)
`,

    getRoleDetails: `
        SELECT 
          r.id AS roleId, 
          r.name AS roleName, 
          r.description AS roleDescription, 
          p.action AS permissionAction, 
          p.groupName AS permissionGroupName
        FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ROLE}\` r
        LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ROLE_PERMISSION}\` rp 
          ON r.id = rp.roleId
        LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_PERMISSION}\` p 
          ON rp.permissionId = p.id
        WHERE r.id = @roleId;`,

    getRoles: `
          SELECT 
            r.id AS roleId, 
            r.name AS roleName, 
            r.description AS roleDescription,
            p.action AS permissionAction, 
            p.groupName AS permissionGroupName
          FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ROLE}\` r
          LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ROLE_PERMISSION}\` rp 
            ON r.id = rp.roleId
          LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_PERMISSION}\` p 
            ON rp.permissionId = p.id
          ORDER BY r.id;
        `,


    updateRole: `
    UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ROLE}\`
        SET name = @name, description = @description, updatedBy = @updatedBy, updatedAt = @updatedAt
        WHERE id = @roleId`,

    deleteRole: `
     DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ROLE}\`
        WHERE id = @roleId`,
};