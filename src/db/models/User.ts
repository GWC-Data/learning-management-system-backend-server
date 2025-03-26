export interface User {
  id?: string; // UUID (auto-generated)
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string; // Format: YYYY-MM-DD
  phoneNumber?: string;
  password: string; // Should be hashed before storing
  dateOfJoining?: string; // Format: YYYY-MM-DD
  address?: string;
  qualification?: string;
  profilePic?: string;
  roleId: string;
  accountStatus?: 'active' | 'suspended' | 'inactive';
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  jobIds?: string[]; 
}
