"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateRolesHandler = exports.updatePermissionHandler = exports.getRoleDetailsHandler = exports.getAllRolesHandler = exports.getAllPermissionHandler = exports.deleteRoleHandler = exports.deletePermissionHandler = exports.createRoleTable = exports.createPermissionHandler = void 0;
var _role = require("../../queries/role/role.queries");
var _bigquery = require("../../config/bigquery");
var _permission = require("../../queries/permissions/permission.queries");
var _uuid = require("uuid");
var _audit = require("../../queries/audit/audit.queries");
var _rolePermission = require("../../queries/rolePermission/rolePermission.queries");
// Function to check if the audit table exists
const checkAuditTableExists = async () => {
  try {
    const [rows] = await _bigquery.bigquery.query({
      query: `
        SELECT table_name 
        FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` 
        WHERE table_name = 'audit'
      `
    });
    return rows.length > 0;
  } catch (error) {
    console.error("Error checking table existence:", error);
    throw error;
  }
};

// Function to create the audit table if it does not exist
const createAuditTableIfNotExists = async () => {
  try {
    const tableExists = await checkAuditTableExists();
    if (tableExists) {
      console.log("Audit table already exists.");
      return;
    }
    await _bigquery.bigquery.query({
      query: `
        CREATE TABLE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_AUDIT}\` (
          id STRING NOT NULL,
          entityType STRING NOT NULL,
          entityId STRING NOT NULL, 
          action STRING NOT NULL,
          previousData STRING, 
          newData STRING,
          performedBy STRING, 
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
          updateAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
        )
      `
    });
    console.log("Audit table created successfully.");
  } catch (error) {
    console.error("Error creating Audit table:", error);
    throw error;
  }
};

// Function to check if the role table exists
const checkRoleTableExists = async () => {
  try {
    const [rows] = await _bigquery.bigquery.query({
      query: `
        SELECT table_name 
        FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` 
        WHERE table_name = 'roles'
      `
    });
    return rows.length > 0;
  } catch (error) {
    console.error("Error checking table existence:", error);
    throw error;
  }
};

// Function to create the role table if it does not exist
const createRoleTableIfNotExists = async () => {
  const exists = await checkRoleTableExists();
  if (!exists) {
    try {
      await _bigquery.bigquery.query({
        query: `
          CREATE TABLE \`teqcertify.lms.roles\` (
            id STRING NOT NULL, 
            name STRING NOT NULL,
            description STRING NOT NULL,
            createdBy STRING NOT NULL,
            updatedBy STRING,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      });
      console.log("Roles table created successfully.");
    } catch (error) {
      console.error("Error creating Roles table:", error);
      throw error;
    }
  }
};

// Function to check if the rolepermission table exists
const checkRolePermissionTableExists = async () => {
  try {
    const [rows] = await _bigquery.bigquery.query({
      query: `
        SELECT table_name 
        FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` 
        WHERE table_name = 'rolePermissions'
      `
    });
    return rows.length > 0;
  } catch (error) {
    console.error("Error checking table existence:", error);
    throw error;
  }
};
const createRolePermissionsTableIfNotExists = async () => {
  const exists = await checkRolePermissionTableExists(); // Function to check existence
  if (!exists) {
    try {
      await _bigquery.bigquery.query({
        query: `
          CREATE TABLE \`teqcertify.lms.rolePermissions\` ( 
            roleId STRING NOT NULL,
            permissionId STRING NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      });
      console.log("rolePermissions table created successfully.");
    } catch (error) {
      console.error("Error creating rolePermissions table:", error);
      throw error;
    }
  }
};

//create role table
const createRoleTable = async (req, role) => {
  await createRoleTableIfNotExists();
  await createRolePermissionsTableIfNotExists();
  const {
    name,
    description,
    permissions
  } = role;
  const id = (0, _uuid.v4)();
  const {
    user
  } = req;
  try {
    // Ensure createdBy is valid
    const createdBy = user?.id || null;
    const createdAt = new Date().toISOString();

    // Insert Role
    const roleInsertOptions = {
      query: _role.roleQueries.createRole,
      params: {
        id,
        name,
        description,
        createdBy,
        createdAt
      }
    };
    console.log("Inserting role:", roleInsertOptions);
    await _bigquery.bigquery.query(roleInsertOptions);
    console.log("Role inserted successfully:", id);

    // ✅ Fetch Permission IDs After Role Insertion
    if (permissions.length > 0) {
      const [result] = await _bigquery.bigquery.query({
        query: _rolePermission.rolePermissionQueries.getPermissionIds,
        params: {
          actions: permissions
        }
      });
      console.log("Fetched permission IDs:", result);
      if (!result || result.length === 0) {
        throw new Error("No matching permissions found in DB.");
      }
      const matchedPermissions = result.map(row => row.id);
      if (matchedPermissions.length !== permissions.length) {
        const missingPermissions = permissions.filter(action => !result.some(perm => perm.action === action));
        throw new Error(`Some permissions were not found: ${missingPermissions.join(", ")}`);
      }

      // ✅ Insert Role-Permission Mappings
      for (const permissionId of matchedPermissions) {
        await _bigquery.bigquery.query({
          query: _rolePermission.rolePermissionQueries.insertRolePermissions,
          params: {
            roleId: id,
            permissionId,
            createdAt,
            updatedAt: createdAt
          }
        });
      }
      console.log("Role-Permissions linked successfully.");
    }

    // ✅ Insert Audit Log with Explicit Type Handling
    await _bigquery.bigquery.query({
      query: _audit.auditQueries.insertAuditLog,
      params: {
        id: (0, _uuid.v4)(),
        entityType: "Role",
        entityId: id,
        action: "CREATE",
        previousData: null,
        // Ensure correct type handling below
        newData: JSON.stringify({
          id,
          name,
          description,
          permissions
        }),
        performedBy: createdBy,
        createdAt
      },
      types: {
        previousData: "STRING",
        // Explicitly define type for null
        newData: "STRING"
      }
    });
    return {
      id,
      name,
      description,
      permissions
    };
  } catch (error) {
    console.error("Error creating Role:", error);
    return {
      message: "Error creating Role",
      error
    };
  }
};
exports.createRoleTable = createRoleTable;
const getAllRolesHandler = async () => {
  try {
    const [rows] = await _bigquery.bigquery.query({
      query: _role.roleQueries.getRoles
    });

    // Transform data to group permissions under each role
    const roleMap = new Map();
    rows.forEach(row => {
      const {
        roleId,
        roleName,
        roleDescription,
        permissionAction,
        permissionGroupName
      } = row;
      if (!roleMap.has(roleId)) {
        roleMap.set(roleId, {
          id: roleId,
          name: roleName,
          description: roleDescription,
          permissions: []
        });
      }

      // Only add permissions if they exist
      if (permissionAction && permissionGroupName) {
        roleMap.get(roleId).permissions.push({
          action: permissionAction,
          groupName: permissionGroupName
        });
      }
    });
    return Array.from(roleMap.values());
  } catch (error) {
    console.error("Error fetching all roles:", error);
    throw error;
  }
};
exports.getAllRolesHandler = getAllRolesHandler;
const getRoleDetailsHandler = async roleId => {
  try {
    const options = {
      query: _role.roleQueries.getRoleDetails,
      params: {
        roleId
      }
    };
    const [rows] = await _bigquery.bigquery.query(options);
    if (rows.length === 0) {
      throw new Error("Role not found");
    }

    // Define the expected type for role data
    const roleData = {
      id: rows[0].roleId,
      name: rows[0].roleName,
      description: rows[0].roleDescription,
      permissions: []
    };
    rows.forEach(row => {
      if (row.permissionAction && row.permissionGroupName) {
        roleData.permissions.push({
          action: row.permissionAction,
          groupName: row.permissionGroupName
        });
      }
    });
    return roleData;
  } catch (error) {
    console.error("Error fetching role details:", error);
    throw error;
  }
};

//update role
exports.getRoleDetailsHandler = getRoleDetailsHandler;
const updateRolesHandler = async (req, id, updateRole) => {
  const {
    user
  } = req;
  try {
    // Fetch existing role data
    const roleOptions = {
      query: _role.roleQueries.getRoleDetails,
      params: {
        roleId: id
      }
    };
    const [existingRows] = await _bigquery.bigquery.query(roleOptions);
    if (!existingRows || existingRows.length === 0) {
      throw new Error("Role not found");
    }
    const existingRole = existingRows[0];
    console.log("exisiting role", existingRole);

    // Ensure updatedBy is valid
    const updatedBy = user?.id || null;
    const updatedAt = new Date().toISOString();

    // Ensure values are not undefined
    const name = updateRole.name ?? existingRole.roleName;
    const description = updateRole.description ?? existingRole.roleDescription;

    // Update role name & description
    const updateRoleOptions = {
      query: _role.roleQueries.updateRole,
      params: {
        roleId: id,
        name,
        description,
        updatedBy: updatedBy,
        updatedAt
      },
      types: {
        updatedBy: "STRING"
      } // Explicitly define the type
    };
    console.log("Executing updateRole query with params:", updateRoleOptions);
    await _bigquery.bigquery.query(updateRoleOptions);
    if (updateRole.permissions && updateRole.permissions.length > 0) {
      // Delete all existing permissions for this role
      const deletePermissionsOptions = {
        query: _rolePermission.rolePermissionQueries.deleteRolePermissions,
        params: {
          roleId: id
        }
      };
      console.log("Deleting existing permissions:", deletePermissionsOptions);
      await _bigquery.bigquery.query(deletePermissionsOptions);

      // Fetch correct permission IDs from database
      const [result] = await _bigquery.bigquery.query({
        query: _rolePermission.rolePermissionQueries.getPermissionIds,
        params: {
          actions: updateRole.permissions
        }
      });
      console.log("Fetched permission IDs:", result);
      const matchedPermissions = result.map(row => row.id);
      if (matchedPermissions.length !== updateRole.permissions.length) {
        throw new Error("Some permissions were not found.");
      }

      // Insert new permissions
      for (const permissionId of matchedPermissions) {
        const insertQuery = {
          query: _rolePermission.rolePermissionQueries.insertRolePermissions,
          params: {
            roleId: id,
            permissionId,
            createdAt: updatedAt,
            updatedAt
          }
        };
        console.log("Inserting new permission:", insertQuery);
        await _bigquery.bigquery.query(insertQuery);
      }
    }

    // Prepare audit log entry
    const auditLogParams = {
      id: (0, _uuid.v4)(),
      entityType: "Role",
      entityId: id,
      action: "UPDATE",
      previousData: JSON.stringify(existingRole) || '',
      // Ensure not undefined
      newData: JSON.stringify(updateRole) || '',
      // Ensure not undefined
      performedBy: updatedBy,
      createdAt: updatedAt
    };
    console.log("Audit Log Params:", auditLogParams);

    // Insert Audit Log
    await _bigquery.bigquery.query({
      query: _audit.auditQueries.insertAuditLog,
      params: auditLogParams,
      types: {
        id: "STRING",
        entityType: "STRING",
        entityId: "STRING",
        action: "STRING",
        previousData: "STRING",
        newData: "STRING",
        performedBy: "STRING",
        createdAt: "TIMESTAMP"
      }
    });
    console.log("Audit log created successfully.");
    console.log(`Role updated successfully.`);
    return {
      id,
      ...updateRole
    };
  } catch (error) {
    console.error(`Error updating role ${id}:`, error);
    throw error;
  }
};

//delete role
exports.updateRolesHandler = updateRolesHandler;
const deleteRoleHandler = async (req, id) => {
  try {
    // 🔹 Check if Role table exists
    const exist = await checkRoleTableExists();
    if (!exist) {
      console.error("Role table does not exist");
      return {
        message: "Role table does not exist",
        status: 400
      };
    }
    const {
      user
    } = req;

    // 🔹 Fetch existing role details before deletion
    const [existingRole] = await _bigquery.bigquery.query({
      query: _role.roleQueries.getRoleDetails,
      // Ensure this query fetches the role correctly
      params: {
        roleId: id
      }
    });
    if (!existingRole || existingRole.length === 0) {
      console.error(`Role with ID ${id} not found`);
      return {
        message: "Role not found",
        status: 404
      };
    }

    // 🔹 First, delete associated role-permission mappings
    await _bigquery.bigquery.query({
      query: _rolePermission.rolePermissionQueries.deleteRolePermissions,
      params: {
        roleId: id
      }
    });
    console.log(`Deleted permissions linked to role ${id}`);

    // 🔹 Then, delete the role itself
    await _bigquery.bigquery.query({
      query: _role.roleQueries.deleteRole,
      params: {
        roleId: id
      } // 🔥 Corrected parameter name
    });
    console.log(`Role ${id} deleted successfully`);

    // 🔹 Insert Audit Log Entry for Role Deletion
    const auditLogParams = {
      id: (0, _uuid.v4)(),
      entityType: "Role",
      entityId: id,
      action: "DELETE",
      previousData: JSON.stringify(existingRole[0]),
      // Store deleted role data
      newData: null,
      performedBy: user?.id || null,
      createdAt: new Date().toISOString()
    };
    await _bigquery.bigquery.query({
      query: _audit.auditQueries.insertAuditLog,
      params: auditLogParams,
      types: {
        previousData: "STRING",
        newData: "STRING"
      }
    });
    console.log("Audit log inserted successfully");
    return {
      message: "Role and related audit logs deleted successfully",
      status: 200
    };
  } catch (error) {
    console.error(`Error deleting role ${id}:`, error);
    return {
      message: "Error deleting role",
      error
    };
  }
};

// Function to check if the permission table exists
exports.deleteRoleHandler = deleteRoleHandler;
const checkPermissionTableExists = async () => {
  try {
    const [rows] = await _bigquery.bigquery.query({
      query: `
        SELECT table_name 
        FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` 
        WHERE table_name = 'permissions'
      `
    });
    return rows.length > 0;
  } catch (error) {
    console.error("Error checking table existence:", error);
    throw error;
  }
};

// Function to create the permission table if it does not exist
const createPermissionTableIfNotExists = async () => {
  const exists = await checkPermissionTableExists();
  if (!exists) {
    try {
      await _bigquery.bigquery.query({
        query: `
          CREATE TABLE \`teqcertify.lms.permissions\` (
            id STRING NOT NULL, 
            action STRING NOT NULL,
            groupName STRING NOT NULL,
            description STRING NOT NULL,
            createdBy STRING NOT NULL,
            updatedBy STRING,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      });
      console.log("Permissions table created successfully.");
    } catch (error) {
      console.error("Error creating permissions table:", error);
      throw error;
    }
  }
};

//create Permission table Handler
const createPermissionHandler = async (req, permission) => {
  try {
    console.log("Checking if tables exist...");
    await createPermissionTableIfNotExists();
    await createAuditTableIfNotExists();
    const id = (0, _uuid.v4)();
    const {
      user
    } = req;
    const {
      action,
      groupName,
      description
    } = permission;

    // Ensure createdBy is valid
    const createdBy = user?.id || null;
    const createdAt = new Date().toISOString();

    // Insert Permission Query
    const options = {
      query: _permission.permissionQueries.createPermission,
      params: {
        id,
        action,
        groupName,
        description,
        createdBy,
        createdAt
      }
    };
    console.log("Executing Permission Insert Query:", options);
    await _bigquery.bigquery.query(options);
    console.log("Permission created successfully:", id);

    // **Log in the Audit Table**
    await _bigquery.bigquery.query({
      query: _audit.auditQueries.insertAuditLog,
      params: {
        id: (0, _uuid.v4)(),
        entityType: "Permission",
        entityId: id,
        action: "CREATE",
        previousData: null,
        newData: JSON.stringify({
          id,
          action,
          description,
          groupName
        }),
        performedBy: createdBy,
        createdAt
      },
      types: {
        previousData: "STRING",
        newData: "STRING"
      }
    });
    console.log("Audit log inserted successfully.");
    return {
      id,
      ...permission
    };
  } catch (error) {
    console.error("Error creating Permission:", error);
    throw error;
  }
};

// Get All Permission
exports.createPermissionHandler = createPermissionHandler;
const getAllPermissionHandler = async () => {
  try {
    const [rows] = await _bigquery.bigquery.query({
      query: _permission.permissionQueries.getAllPermission
    });
    return rows;
  } catch (error) {
    console.error("Error fetching all permissions:", error);
    throw error;
  }
};

//update permission
exports.getAllPermissionHandler = getAllPermissionHandler;
const updatePermissionHandler = async (req, action, updatedPermission) => {
  try {
    const {
      user
    } = req;
    console.log(`Fetching existing permission for action: ${action}...`);

    // Fetch existing permission data
    const fetchOptions = {
      query: _permission.permissionQueries.getAllPermission,
      params: {
        action
      }
    };
    const [existingRows] = await _bigquery.bigquery.query(fetchOptions);
    if (existingRows.length === 0) {
      throw new Error("Permission not found.");
    }
    const existingPermission = existingRows[0];

    // Ensure updatedBy is valid
    const updatedBy = user?.id || null;
    const updatedAt = new Date().toISOString();

    // Final updated data
    const finalUpdatedPermission = {
      action,
      groupName: updatedPermission.groupName || existingPermission.groupName,
      description: updatedPermission.description || existingPermission.description,
      updatedBy,
      updatedAt
    };

    // Prepare update query
    const updateOptions = {
      query: _permission.permissionQueries.updatePermission,
      params: finalUpdatedPermission
    };

    // Execute update query
    await _bigquery.bigquery.query(updateOptions);
    console.log(`Permission updated successfully.`);

    // **Log in the Audit Table**
    const auditLogParams = {
      id: (0, _uuid.v4)(),
      entityType: "Permission",
      entityId: existingPermission.id,
      // Use the actual permission ID
      action: "UPDATE",
      previousData: JSON.stringify(existingPermission),
      newData: JSON.stringify(finalUpdatedPermission),
      performedBy: updatedBy,
      createdAt: updatedAt
    };
    await _bigquery.bigquery.query({
      query: _audit.auditQueries.insertAuditLog,
      params: auditLogParams,
      types: {
        previousData: "STRING",
        newData: "STRING"
      } // Explicit null handling
    });
    console.log("Audit log inserted successfully.");
    return finalUpdatedPermission;
  } catch (error) {
    console.error(`Error updating ${action} permission:`, error);
    throw error;
  }
};

//Delete permission
exports.updatePermissionHandler = updatePermissionHandler;
const deletePermissionHandler = async (req, action) => {
  try {
    console.log(`Deleting permission with action: ${action}`);

    // Check if permission exists before deleting
    const fetchOptions = {
      query: _permission.permissionQueries.getAllPermission,
      params: {
        action
      }
    };
    const [existingRows] = await _bigquery.bigquery.query(fetchOptions);
    if (existingRows.length === 0) {
      return {
        message: "Permission not found",
        status: 404
      };
    }
    const existingPermission = existingRows[0];

    // Delete permission
    const deleteOptions = {
      query: _permission.permissionQueries.deletePermission,
      params: {
        action
      }
    };
    await _bigquery.bigquery.query(deleteOptions);
    console.log(`Permission deleted successfully: ${action}`);

    // **Insert Audit Log**
    await _bigquery.bigquery.query({
      query: _audit.auditQueries.insertAuditLog,
      params: {
        id: (0, _uuid.v4)(),
        entityType: "Permission",
        entityId: action,
        action: "DELETE",
        previousData: JSON.stringify(existingPermission),
        newData: null,
        performedBy: req?.user?.id || null,
        createdAt: new Date().toISOString()
      },
      types: {
        previousData: "STRING",
        newData: "STRING"
      } // Handling null values
    });
    console.log("Audit log inserted successfully.");

    // **Return success response**
    return {
      message: "Permission deleted successfully",
      status: 200
    };
  } catch (error) {
    console.error("Error deleting permission:", error);
    return {
      message: "Error deleting permission",
      error
    };
  }
};
exports.deletePermissionHandler = deletePermissionHandler;
//# sourceMappingURL=role.handler.js.map