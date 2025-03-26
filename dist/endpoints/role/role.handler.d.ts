import { Permission } from '../../db';
import { Role } from '../../db';
export declare const createRoleTable: (req: any, role: Role) => Promise<{
    id: string;
    name: string;
    description: string;
    permissions: string[];
    message?: undefined;
    error?: undefined;
} | {
    message: string;
    error: unknown;
    id?: undefined;
    name?: undefined;
    description?: undefined;
    permissions?: undefined;
}>;
export declare const getAllRolesHandler: () => Promise<any[]>;
export declare const getRoleDetailsHandler: (roleId: string) => Promise<{
    id: string;
    name: string;
    description: string;
    permissions: {
        action: string;
        groupName: string;
    }[];
}>;
export declare const updateRolesHandler: (req: any, id: string, updateRole: Partial<Role>) => Promise<{
    id: string;
    name?: string | undefined;
    description?: string | undefined;
    permissions?: string[] | undefined;
    createdBy?: string | undefined;
    updatedBy?: string | undefined;
    createdAt?: string | undefined;
    updateAt?: string | undefined;
}>;
export declare const deleteRoleHandler: (req: any, id: string) => Promise<{
    message: string;
    status: number;
    error?: undefined;
} | {
    message: string;
    error: unknown;
    status?: undefined;
}>;
export declare const createPermissionHandler: (req: any, permission: Permission) => Promise<{
    id: string;
    action: string;
    groupName: string;
    description: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updateAt?: string;
}>;
export declare const getAllPermissionHandler: () => Promise<any[]>;
export declare const updatePermissionHandler: (req: any, action: string, updatedPermission: Partial<Permission>) => Promise<{
    action: string;
    groupName: any;
    description: any;
    updatedBy: any;
    updatedAt: string;
}>;
export declare const deletePermissionHandler: (req: any, action: string) => Promise<{
    message: string;
    status: number;
    error?: undefined;
} | {
    message: string;
    error: unknown;
    status?: undefined;
}>;
