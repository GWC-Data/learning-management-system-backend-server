export const permissionQueries = {
    createPermission: `
    INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_PERMISSION}\`
    (id, action, groupName, description, createdBy, createdAt)
    VALUES (@id, @action, @groupName, @description, @createdBy, @createdAt)
`,

    getAllPermission: `
        SELECT * FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_PERMISSION}\`
    `,

    updatePermission: `
    UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_PERMISSION}\`
        SET groupName = @groupName, description = @description, updatedBy = @updatedBy, updatedAt = @updatedAt
        WHERE action = @action`,

    deletePermission: `
        DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_PERMISSION}\`
        WHERE action = @action`
};