import { bigquery } from '../../config/bigquery';
import bcrypt from 'bcryptjs';
import { authQueries } from '../../queries/auth/auth.queries';
import { generateJwtToken } from 'node-server-engine';

export const loginHandler = async (email: string, password: string) => {
  try {
    // Fetch user by email
    const userQuery = {
      query: authQueries.loginbyEmail,
      params: { email }
    };
    const [userRows] = await bigquery.query(userQuery);

    if (userRows.length === 0) {
      throw new Error('User not found');
    }

    const user = userRows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Fetch user details, role, and permissions
    const userDetailsQuery = {
      query: authQueries.getUserDetailsWithRole,
      params: { userId: user.id }
    };

    const [userDetailsRows] = await bigquery.query(userDetailsQuery);

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
    const tokenExpiry = Math.floor(Date.now() / 1000) + 1 * 60 * 60;  //1 hr

    const accessToken = generateJwtToken(transformedUser);

    return { accessToken, tokenExpiry, user: transformedUser };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

