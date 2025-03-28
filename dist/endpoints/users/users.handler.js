"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateUserForTraineeHandler = exports.updateUserForAdminHandler = exports.getUserByIdHandler = exports.getAllUsersHandler = exports.deleteUserHandler = exports.createUserHandler = void 0;
var _bigquery = require("../../config/bigquery");
var _user = require("../../queries/users/user.queries");
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
var _uuid = require("uuid");
var _userProfilePicStorage = require("../../config/userProfilePicStorage");
var _audit = require("../../queries/audit/audit.queries");
const TABLE_USER = process.env.TABLE_USER || 'users';

// Function to check if the users table exists
const checkUserTableExists = async () => {
  try {
    const [rows] = await _bigquery.bigquery.query({
      query: `SELECT table_name FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` WHERE table_name = '${TABLE_USER}'`
    });
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking table existence:', error);
    throw new Error('Database error while checking table existence.');
  }
};

// Function to create the users table if it does not exist
const createUserTableIfNotExists = async () => {
  if (!(await checkUserTableExists())) {
    try {
      await _bigquery.bigquery.query({
        query: `
          CREATE TABLE \`teqcertify.lms.users\` (
            id STRING NOT NULL,
            firstName STRING,
            lastName STRING,
            email STRING NOT NULL,
            dateOfBirth STRING,
            phoneNumber STRING,
            password STRING NOT NULL,
            dateOfJoining DATE,
            address STRING,
            qualification STRING,
            profilePic STRING,
            roleId STRING,
            accountStatus STRING,
            jobBoardAccess STRING,
            createdBy STRING NOT NULL,
            updatedBy STRING,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      });
      console.log('Users table created successfully.');
    } catch (error) {
      console.error('Error creating users table:', error);
      throw new Error('Failed to create users table.');
    }
  }
};
const createUserHandler = async (req, userData) => {
  try {
    console.log("Incoming Request Body:", JSON.stringify(req.body, null, 2));

    // Ensure required tables exist before inserting data
    await createUserTableIfNotExists();
    const {
      user
    } = req;
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      dateOfJoining,
      roleId,
      jobBoardAccess
    } = userData;
    if (!firstName || !lastName || !email || !password || !roleId || !jobBoardAccess) {
      return {
        success: false,
        errors: ["Missing required fields: firstName, lastName, email, password, roleId or jobBoardAccess."]
      };
    }

    // **Check for duplicate email or phone**
    const [duplicateUsers] = await _bigquery.bigquery.query({
      query: `SELECT id FROM \`teqcertify.lms.users\` WHERE email = @email OR phoneNumber = @phoneNumber`,
      params: {
        email,
        phoneNumber
      }
    });
    if (duplicateUsers.length > 0) {
      return {
        success: false,
        errors: ['Email or phone number already exists.']
      };
    }

    // **Hash the password**
    const hashedPassword = await _bcryptjs.default.hash(password, 10);
    const userId = (0, _uuid.v4)();
    const createdAt = new Date().toISOString();
    const createdBy = user?.id || null;

    // **Insert user into `users` table with NULL for empty values**
    await _bigquery.bigquery.query({
      query: _user.userQueries.createUser,
      params: {
        id: userId,
        firstName,
        lastName,
        email,
        dateOfBirth: null,
        // 🔹 Set to NULL
        phoneNumber,
        password: hashedPassword,
        dateOfJoining: dateOfJoining || null,
        address: null,
        // 🔹 NULL instead of empty string
        qualification: null,
        // 🔹 NULL instead of empty string
        profilePic: null,
        // 🔹 NULL instead of empty string
        roleId,
        accountStatus: "active",
        // 🔹 Default to "active"
        jobBoardAccess,
        createdBy,
        createdAt
      },
      types: {
        dateOfBirth: "STRING",
        address: "STRING",
        qualification: "STRING",
        profilePic: "STRING",
        updatedBy: "STRING"
      }
    });
    console.log('User created successfully:', userId);

    // 🔹 **Insert Audit Log**
    const auditLogParams = {
      id: (0, _uuid.v4)(),
      entityType: "User",
      entityId: userId,
      action: "CREATE",
      previousData: null,
      newData: JSON.stringify({
        firstName,
        lastName,
        email,
        phoneNumber,
        roleId,
        accountStatus: "active",
        jobBoardAccess,
        createdAt
      }),
      performedBy: createdBy,
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
    return {
      message: 'User created successfully.',
      userId,
      userData
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      errors: ['Internal server error occurred.']
    };
  }
};
exports.createUserHandler = createUserHandler;
const getAllUsersHandler = async () => {
  try {
    if (!(await checkUserTableExists())) throw new Error("Table 'users' does not exist.");
    const [rows] = await _bigquery.bigquery.query({
      query: _user.userQueries.getAllUsers
    });

    // Map user data
    const users = rows.map(row => ({
      id: row.userId,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phoneNumber: row.phoneNumber,
      dateOfBirth: row.dateOfBirth,
      dateOfJoining: row.dateOfJoining,
      address: row.address,
      qualification: row.qualification,
      profilePic: row.profilePic,
      roleId: row.roleId,
      roleName: row.roleName ?? "No Role Assigned",
      // ✅ Ensures roleName is included
      accountStatus: row.accountStatus,
      jobBoardAccess: row.jobBoardAccess
    }));
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};
exports.getAllUsersHandler = getAllUsersHandler;
const getUserByIdHandler = async id => {
  try {
    if (!(await checkUserTableExists())) {
      throw new Error("Table 'users' does not exist.");
    }
    const options = {
      query: _user.userQueries.getUserById,
      params: {
        id
      } // ✅ Fixed incorrect reference to userId
    };
    const [rows] = await _bigquery.bigquery.query(options);
    if (!rows || rows.length === 0) {
      throw new Error(`User with ID ${id} not found.`);
    }

    // ✅ Define the user structure
    const userData = {
      id: rows[0].userId,
      firstName: rows[0].firstName,
      lastName: rows[0].lastName,
      email: rows[0].email,
      phoneNumber: rows[0].phoneNumber,
      dateOfBirth: rows[0].dateOfBirth,
      dateOfJoining: rows[0].dateOfJoining,
      address: rows[0].address,
      qualification: rows[0].qualification,
      profilePic: rows[0].profilePic,
      roleId: rows[0].roleId,
      roleName: rows[0].roleName,
      accountStatus: rows[0].accountStatus,
      jobBoardAccess: rows[0].jobBoardAccess
    };
    return userData;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw new Error(`Failed to fetch user data: ${error}`);
  }
};

// export const updateUserForAdminHandler = async (
//   req: any,
//   userId: string,
//   updatedData: Partial<User>
// ) => {
//   const { user } = req;
//   try {
//     // Fetch existing user data
//     const userQueryOptions = {
//       query: userQueries.getUserById,
//       params: { id: userId }
//     };

//     const [existingRows] = await bigquery.query(userQueryOptions);

//     if (existingRows.length === 0) {
//       throw new Error(`User with ID ${userId} not found.`);
//     }

//     const existingUser = existingRows[0];

//     // Prepare update values
//     const updateParams: Record<string, any> = {
//       id: userId,
//       firstName: updatedData.firstName || null,
//       lastName: updatedData.lastName || null,
//       email: updatedData.email || null,
//       phoneNumber: updatedData.phoneNumber || null,
//       dateOfBirth: updatedData.dateOfBirth || null,
//       // password: updatedData.password || null,
//       // dateOfJoining: updatedData.dateOfJoining || null,
//       qualification: updatedData.qualification || null,
//       address: updatedData.address || null,
//       roleId: updatedData.roleId || null,
//       accountStatus: updatedData.accountStatus || null,
//       updatedBy: user?.id,
//       updatedAt: new Date().toISOString()
//     };

//     console.log('Update User Params:', updateParams);

//     // Update user details
//     await bigquery.query({
//       query: userQueries.updateUserForAdmin,
//       params: updateParams
//     });

//     // Insert audit log
//     const auditLogParams = {
//       id: uuidv4(),
//       entityType: 'User',
//       entityId: userId,
//       action: 'UPDATE',
//       previousData: JSON.stringify(existingUser),
//       newData: JSON.stringify(updateParams),
//       performedBy: user?.id || null,
//       createdAt: new Date().toISOString()
//     };

//     await bigquery.query({
//       query: auditQueries.insertAuditLog,
//       params: auditLogParams,
//       types: { previousData: 'STRING', newData: 'STRING' }
//     });

//     console.log('Audit log inserted successfully.');
//     console.log(`User ${userId} updated successfully.`);

//     return {
//       id: userId,
//       ...updatedData
//     };
//   } catch (error) {
//     console.error(`Error updating user ${userId}:`, error);
//     throw error;
//   }
// };

// UPDATE user for trainee

// export const updateUserForAdminHandler = async (
//   req: any,
//   userId: string,
//   updatedData: Partial<User>
// ) => {
//   const { user } = req;
//   try {
//     // Fetch existing user data
//     const userQueryOptions = {
//       query: userQueries.getUserById,
//       params: { id: userId }
//     };

//     const [existingRows] = await bigquery.query(userQueryOptions);

//     if (existingRows.length === 0) {
//       throw new Error(`User with ID ${userId} not found.`);
//     }

//     const existingUser = existingRows[0];

//     // Prepare update values with explicit types for null values
//     const updateParams: Record<string, any> = {
//       id: userId,
//       firstName: updatedData.firstName || null,
//       lastName: updatedData.lastName || null,
//       email: updatedData.email || null,
//       phoneNumber: updatedData.phoneNumber || null,
//       dateOfBirth: updatedData.dateOfBirth || null,
//       qualification: updatedData.qualification || null,
//       address: updatedData.address || null,
//       roleId: updatedData.roleId || null,
//       accountStatus: updatedData.accountStatus || null,
//       updatedBy: user?.id,
//       updatedAt: new Date().toISOString()
//     };

//     // Enhanced logging for debugging
//     console.log('Existing User:', existingUser);
//     console.log('Update Params:', JSON.stringify(updateParams, null, 2));

//     // Specify types for all parameters, especially null values
//     const updateQueryOptions = {
//       query: userQueries.updateUserForAdmin,
//       params: updateParams,
//       types: {
//         id: 'STRING',
//         firstName: 'STRING',
//         lastName: 'STRING',
//         email: 'STRING',
//         phoneNumber: 'STRING',
//         dateOfBirth: 'DATE',
//         qualification: 'STRING',
//         address: 'STRING',
//         roleId: 'STRING',
//         accountStatus: 'STRING',
//         updatedBy: 'STRING',
//         updatedAt: 'TIMESTAMP'
//       }
//     };

//     // Validate parameters before query
//     Object.entries(updateParams).forEach(([key, value]) => {
//       if (value !== null && value !== undefined) {
//         console.log(`Updating ${key}: ${value}`);
//       }
//     });

//     // Perform the update query
//     const [updateResult] = await bigquery.query(updateQueryOptions);
//     console.log('Update Query Result:', updateResult);

//     // Check affected rows
//     const checkQueryOptions = {
//       query: `
//         SELECT * FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\`
//         WHERE id = @id
//       `,
//       params: { id: userId }
//     };

//     const [checkRows] = await bigquery.query(checkQueryOptions);
//     console.log('Updated User Check:', checkRows[0]);

//     // Rest of the code remains the same...
//     const auditLogParams = {
//       id: uuidv4(),
//       entityType: 'User',
//       entityId: userId,
//       action: 'UPDATE',
//       previousData: JSON.stringify(existingUser),
//       newData: JSON.stringify(updateParams),
//       performedBy: user?.id || null,
//       createdAt: new Date().toISOString()
//     };

//     await bigquery.query({
//       query: auditQueries.insertAuditLog,
//       params: auditLogParams,
//       types: { 
//         id: 'STRING',
//         entityType: 'STRING',
//         entityId: 'STRING',
//         action: 'STRING',
//         previousData: 'STRING', 
//         newData: 'STRING',
//         performedBy: 'STRING',
//         createdAt: 'TIMESTAMP'
//       }
//     });

//     console.log('Audit log inserted successfully.');
//     console.log(`User ${userId} updated successfully.`);

//     return {
//       id: userId,
//       ...updatedData
//     };
//   } catch (error) {
//     console.error(`Error updating user ${userId}:`, error);
//     throw error;
//   }
// };
exports.getUserByIdHandler = getUserByIdHandler;
const updateUserForAdminHandler = async (req, userId, updatedData) => {
  const {
    user
  } = req;
  try {
    // Fetch existing user data
    const userQueryOptions = {
      query: _user.userQueries.getUserById,
      params: {
        id: userId
      }
    };
    const [existingRows] = await _bigquery.bigquery.query(userQueryOptions);
    if (existingRows.length === 0) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    const existingUser = existingRows[0];

    // Prepare update values with explicit types for null values
    const updateParams = {
      id: userId,
      firstName: updatedData.firstName || null,
      lastName: updatedData.lastName || null,
      email: updatedData.email || null,
      phoneNumber: updatedData.phoneNumber || null,
      dateOfBirth: updatedData.dateOfBirth ? new Date(updatedData.dateOfBirth).toISOString().split('T')[0] : null,
      qualification: updatedData.qualification || null,
      address: updatedData.address || null,
      roleId: updatedData.roleId || null,
      accountStatus: updatedData.accountStatus || null,
      jobBoardAccess: updatedData.jobBoardAccess ? updatedData.jobBoardAccess : null,
      updatedBy: user?.id,
      updatedAt: new Date().toISOString()
    };
    console.log('Update Params:', JSON.stringify(updateParams, null, 2));

    // Specify types for all parameters, especially null values
    const updateQueryOptions = {
      query: `
        UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\`
        SET
          firstName = COALESCE(@firstName, firstName),
          lastName = COALESCE(@lastName, lastName),
          email = COALESCE(@email, email),
          phoneNumber = COALESCE(@phoneNumber, phoneNumber),
          dateOfBirth = COALESCE(@dateOfBirth, dateOfBirth),
          qualification = COALESCE(@qualification, qualification),
          address = COALESCE(@address, address),
          roleId = COALESCE(@roleId, roleId),
          accountStatus = COALESCE(@accountStatus, accountStatus),
          jobBoardAccess = IFNULL(@jobBoardAccess, jobBoardAccess),
          updatedBy = @updatedBy,
          updatedAt = @updatedAt
        WHERE id = @id;
        `,
      params: updateParams,
      types: {
        id: 'STRING',
        firstName: 'STRING',
        lastName: 'STRING',
        email: 'STRING',
        phoneNumber: 'STRING',
        dateOfBirth: 'STRING',
        qualification: 'STRING',
        address: 'STRING',
        roleId: 'STRING',
        accountStatus: 'STRING',
        jobBoardAccess: 'STRING',
        updatedBy: 'STRING',
        updatedAt: 'TIMESTAMP'
      }
    };

    // Perform the update query and get affected rows
    const [updateResult] = await _bigquery.bigquery.query(updateQueryOptions);
    console.log('Update Query Result:', updateResult);

    // Verify the update by fetching the updated user
    const checkQueryOptions = {
      query: `
        SELECT * FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\`
        WHERE id = @id
      `,
      params: {
        id: userId
      }
    };
    const [checkRows] = await _bigquery.bigquery.query(checkQueryOptions);
    console.log('Updated User Check:', checkRows[0]);

    // Rest of the audit log insertion remains the same
    const auditLogParams = {
      id: (0, _uuid.v4)(),
      entityType: 'User',
      entityId: userId,
      action: 'UPDATE',
      previousData: JSON.stringify(existingUser),
      newData: JSON.stringify(updateParams),
      performedBy: user?.id || null,
      createdAt: new Date().toISOString()
    };
    await _bigquery.bigquery.query({
      query: _audit.auditQueries.insertAuditLog,
      params: auditLogParams,
      types: {
        id: 'STRING',
        entityType: 'STRING',
        entityId: 'STRING',
        action: 'STRING',
        previousData: 'STRING',
        newData: 'STRING',
        performedBy: 'STRING',
        createdAt: 'TIMESTAMP'
      }
    });
    console.log('Audit log inserted successfully.');
    console.log(`User ${userId} updated successfully.`);
    return {
      id: userId,
      ...updatedData
    };
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};
exports.updateUserForAdminHandler = updateUserForAdminHandler;
const updateUserForTraineeHandler = async (req, userId, updatedData, file) => {
  const {
    user
  } = req;
  try {
    // Fetch existing user data
    const userQueryOptions = {
      query: _user.userQueries.getUserById,
      params: {
        id: userId
      }
    };
    const [existingRows] = await _bigquery.bigquery.query(userQueryOptions);
    if (existingRows.length === 0) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    const existingUser = existingRows[0];
    let newProfilePicUrl = existingUser.profilePic;

    // Handle Profile Picture Update
    if (file) {
      try {
        const oldFileName = existingUser.profilePic?.split('/').pop();
        if (oldFileName) {
          await (0, _userProfilePicStorage.deleteUserProfilePicFromGCS)(oldFileName);
        }
        const fileName = `${userId}.${file.mimetype.split('/')[1]}`;
        newProfilePicUrl = await (0, _userProfilePicStorage.uploadUserProfilePicToGCS)(file.buffer, fileName, file.mimetype);
      } catch (uploadError) {
        console.error('Error uploading profile picture:', uploadError);
        throw new Error('Failed to upload profile picture.');
      }
    }

    // Prepare update values
    const updateParams = {
      id: userId,
      firstName: updatedData.firstName || existingUser.firstName,
      lastName: updatedData.lastName || existingUser.lastName,
      dateOfBirth: updatedData.dateOfBirth || existingUser.dateOfBirth,
      phoneNumber: updatedData.phoneNumber || existingUser.phoneNumber,
      address: updatedData.address || existingUser.address,
      qualification: updatedData.qualification || existingUser.qualification,
      profilePic: newProfilePicUrl || existingUser.profilePic,
      updatedBy: user?.id,
      updatedAt: new Date().toISOString()
    };
    console.log('Update User Query:', _user.userQueries.updateTraineeUser);
    console.log('Update User Params:', updateParams);

    // Update user details
    const updateUserOptions = {
      query: _user.userQueries.updateTraineeUser,
      // Use new query reference
      params: updateParams
    };
    await _bigquery.bigquery.query(updateUserOptions);

    // Insert audit log
    const auditLogParams = {
      id: (0, _uuid.v4)(),
      entityType: 'User',
      entityId: userId,
      action: 'UPDATE',
      previousData: JSON.stringify(existingUser),
      newData: JSON.stringify(updateParams),
      performedBy: user?.id || null,
      createdAt: new Date().toISOString()
    };
    await _bigquery.bigquery.query({
      query: _audit.auditQueries.insertAuditLog,
      params: auditLogParams,
      types: {
        previousData: 'STRING',
        newData: 'STRING'
      }
    });
    console.log('Audit log inserted successfully.');
    console.log(`User ${userId} updated successfully.`);
    return {
      id: userId,
      ...updatedData,
      profilePic: newProfilePicUrl || existingUser.profilePic
    };
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};
exports.updateUserForTraineeHandler = updateUserForTraineeHandler;
const deleteUserHandler = async (req, id) => {
  const {
    user
  } = req;
  try {
    // Check if 'users' table exists
    if (!(await checkUserTableExists())) {
      throw new Error("Table 'users' does not exist.");
    }

    // Fetch user details to check existence and get profilePic URL
    const [rows] = await _bigquery.bigquery.query({
      query: _user.userQueries.getUserById,
      params: {
        id
      }
    });
    if (!rows.length) {
      return {
        success: false,
        message: 'User not found.'
      };
    }
    const userToDelete = rows[0];
    const profilePicUrl = userToDelete.profilePic;

    // Extract the filename from the profilePic URL if available
    let fileName = null;
    if (profilePicUrl) {
      fileName = profilePicUrl.split('/').pop();
      console.log('Filename:', fileName);
    } else {
      console.log('Profile picture is not set for this user.');
    }
    console.log('Filename:', fileName);
    console.log(`User's saved jobs deleted successfully.`);

    // **Insert Audit Log Before Deletion**
    const auditLogParams = {
      id: (0, _uuid.v4)(),
      entityType: "User",
      // Correct entity type
      entityId: id,
      action: "DELETE",
      previousData: JSON.stringify(userToDelete),
      // Store full user data before deletion
      newData: null,
      // No new data after deletion
      performedBy: user?.id || null,
      // Who performed this action
      createdAt: new Date().toISOString()
    };
    await _bigquery.bigquery.query({
      query: _audit.auditQueries.insertAuditLog,
      params: auditLogParams,
      types: {
        previousData: "STRING",
        newData: "STRING",
        // Explicitly define null type
        performedBy: "STRING" // Ensure performedBy is treated as a string
      }
    });
    console.log(`Audit log recorded for user deletion.`);

    // **Delete user from database**
    await _bigquery.bigquery.query({
      query: _user.userQueries.deleteUser,
      params: {
        id
      }
    });
    console.log(`User record deleted.`);

    // **Delete image from GCS if exists**
    if (fileName) {
      try {
        await (0, _userProfilePicStorage.deleteUserProfilePicFromGCS)(fileName);
        console.log(`Profile picture ${fileName} deleted from GCS.`);
      } catch (imgError) {
        console.error(`Failed to delete profile picture ${fileName}:`, imgError);
      }
    }
    console.log(`User with ID ${id} deleted successfully.`);
    return {
      success: true,
      message: `User with ID ${id} deleted successfully.`
    };
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    return {
      success: false,
      errors: ['Internal server error occurred.']
    };
  }
};
exports.deleteUserHandler = deleteUserHandler;
//# sourceMappingURL=users.handler.js.map