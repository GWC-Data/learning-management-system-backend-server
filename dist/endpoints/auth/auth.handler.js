"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loginHandler = void 0;
var _bigquery = require("../../config/bigquery");
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
var _auth = require("../../queries/auth/auth.queries");
var _nodeServerEngine = require("node-server-engine");
const loginHandler = async (email, password) => {
  try {
    // Fetch user by email
    const userQuery = {
      query: _auth.authQueries.loginbyEmail,
      params: {
        email
      }
    };
    const [userRows] = await _bigquery.bigquery.query(userQuery);
    if (userRows.length === 0) {
      throw new Error('User not found');
    }
    const user = userRows[0];

    // Compare password
    const isMatch = await _bcryptjs.default.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Fetch user details, role, and permissions
    const userDetailsQuery = {
      query: _auth.authQueries.getUserDetailsWithRole,
      params: {
        userId: user.id
      }
    };
    const [userDetailsRows] = await _bigquery.bigquery.query(userDetailsQuery);
    if (userDetailsRows.length === 0) {
      throw new Error('User role or permissions not found');
    }
    const userDetails = userDetailsRows[0];

    // Transform user object
    const transformedUser = {
      id: userDetails.id,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      email: userDetails.email,
      roleId: userDetails.roleId,
      role: userDetails.roleName,
      permissions: userDetails.permissions || []
    };

    // Generate JWT Token
    const tokenExpiry = Math.floor(Date.now() / 1000) + 1 * 60 * 60; //1 hr

    const accessToken = (0, _nodeServerEngine.generateJwtToken)(transformedUser);
    return {
      accessToken,
      tokenExpiry,
      user: transformedUser
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
exports.loginHandler = loginHandler;
//# sourceMappingURL=auth.handler.js.map