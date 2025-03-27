export interface User {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    password: string;
    dateOfJoining?: string;
    address?: string;
    qualification?: string;
    profilePic?: string;
    roleId: string;
    accountStatus?: 'active' | 'suspended' | 'inactive';
    jobBoardAccess?: 'enabled' | 'disabled' | null;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
