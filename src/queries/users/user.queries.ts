export const userQueries = {
  createUser: `
  INSERT INTO  \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\`
(id, firstName, lastName, email, dateOfBirth, phoneNumber, password, dateOfJoining, address, qualification, profilePic, roleId, accountStatus, createdBy, createdAt)
VALUES
(@id, @firstName, @lastName, @email, @dateOfBirth, @phoneNumber, @password, @dateOfJoining, @address, @qualification, @profilePic, @roleId, @accountStatus, @createdBy, @createdAt)
`,

    getAllUsers: `
    SELECT
      u.id AS userId,
      u.firstName,
      u.lastName,
      u.email,
      u.phoneNumber,
      u.dateOfBirth,
      u.dateOfJoining,
      u.address,
      u.qualification,
      u.profilePic,
      u.roleId,
      r.id,
      r.name AS roleName, 
      u.accountStatus
    FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u
    LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ROLE}\` r
      ON u.roleId = r.id
    ORDER BY u.id;
  `,

  getUserById: `
  SELECT
    u.id AS userId,
    u.firstName,
    u.lastName,
    u.email,
    u.phoneNumber,
    u.dateOfBirth,
    u.dateOfJoining,
    u.address,
    u.qualification,
    u.profilePic,
    u.roleId,
    r.name AS roleName, 
    u.accountStatus,
  FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u
  LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ROLE}\` r
    ON u.roleId = r.id
  WHERE u.id = @id
  GROUP BY u.id, u.firstName, u.lastName, u.email, u.phoneNumber,
           u.dateOfBirth, u.dateOfJoining, u.address,
           u.qualification, u.profilePic, u.roleId, u.accountStatus, r.name;
`,

//   updateUser: `
//   UPDATE \`teqcertify.lms.users\`
//   SET firstName = @firstName, 
//       lastName = @lastName, 
//       email = @email, 
//       dateOfBirth = @dateOfBirth, 
//       phoneNumber = @phoneNumber, 
//       password = @password, 
//       dateOfJoining = @dateOfJoining, 
//       address = @address, 
//       qualification = @qualification, 
//       profilePic = @profilePic, 
//       roleId = @roleId, 
//       accountStatus = @accountStatus,
//       updatedBy = @updatedBy,
//       updatedAt = @updatedAt 
//   WHERE id = @id
// `,


updateUserForAdmin: `
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
      updatedBy = @updatedBy,
      updatedAt = @updatedAt
    WHERE id = @id;
    `,


    updateTraineeUser:
    `
    UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\`
SET
    firstName = COALESCE(@firstName, firstName),
    lastName = COALESCE(@lastName, lastName),
    dateOfBirth = COALESCE(@dateOfBirth, dateOfBirth),
    phoneNumber = COALESCE(@phoneNumber, phoneNumber),
    address = COALESCE(@address, address),
    qualification = COALESCE(@qualification, qualification),
    profilePic = COALESCE(@profilePic, profilePic),
    updatedBy = @updatedBy,
    updatedAt = @updatedAt
WHERE id = @id;
 
    `,

  deleteUser: `
      DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\`
      WHERE id = @id
    `
};
