import { User } from '../../db';
export declare const createUserHandler: (req: any, userData: any) => Promise<{
    success: boolean;
    errors: string[];
    message?: undefined;
    userId?: undefined;
    userData?: undefined;
} | {
    message: string;
    userId: string;
    userData: any;
    success?: undefined;
    errors?: undefined;
}>;
export declare const getAllUsersHandler: () => Promise<{
    id: any;
    firstName: any;
    lastName: any;
    email: any;
    phoneNumber: any;
    dateOfBirth: any;
    dateOfJoining: any;
    address: any;
    qualification: any;
    profilePic: any;
    roleId: any;
    roleName: any;
    accountStatus: any;
    jobRoles: any;
}[]>;
export declare const getUserByIdHandler: (id: string) => Promise<{
    id: any;
    firstName: any;
    lastName: any;
    email: any;
    phoneNumber: any;
    dateOfBirth: any;
    dateOfJoining: any;
    address: any;
    qualification: any;
    profilePic: any;
    roleId: any;
    roleName: any;
    accountStatus: any;
    savedJobs: {
        id: any;
        title: any;
    }[];
}>;
export declare const updateUserForAdminHandler: (req: any, userId: string, updatedData: Partial<User>) => Promise<{
    id: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    dateOfBirth?: string | undefined;
    phoneNumber?: string | undefined;
    password?: string | undefined;
    dateOfJoining?: string | undefined;
    address?: string | undefined;
    qualification?: string | undefined;
    profilePic?: string | undefined;
    roleId?: string | undefined;
    accountStatus?: ("active" | "suspended" | "inactive") | undefined;
    createdBy?: string | undefined;
    updatedBy?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    jobIds?: string[] | undefined;
}>;
export declare const updateUserForTraineeHandler: (req: any, userId: string, updatedData: Partial<User>, file?: Express.Multer.File) => Promise<{
    profilePic: any;
    id: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email?: string | undefined;
    dateOfBirth?: string | undefined;
    phoneNumber?: string | undefined;
    password?: string | undefined;
    dateOfJoining?: string | undefined;
    address?: string | undefined;
    qualification?: string | undefined;
    roleId?: string | undefined;
    accountStatus?: ("active" | "suspended" | "inactive") | undefined;
    createdBy?: string | undefined;
    updatedBy?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    jobIds?: string[] | undefined;
}>;
export declare const deleteUserHandler: (req: any, id: string) => Promise<{
    success: boolean;
    message: string;
    errors?: undefined;
} | {
    success: boolean;
    errors: string[];
    message?: undefined;
}>;
