import { Modules } from '../../db';
export declare const createModuleHandler: (req: any, moduleData: Modules, file?: Express.Multer.File) => Promise<{
    success: boolean;
    message: string;
    moduleId?: undefined;
    materialForModule?: undefined;
    moduleData?: undefined;
    errors?: undefined;
} | {
    success: boolean;
    message: string;
    moduleId: string;
    materialForModule: string;
    moduleData: {
        sequence: any;
        id?: string;
        courseId: string;
        moduleName?: string;
        moduleDescription?: string;
        materialForModule?: string;
        createdBy?: string;
        updatedBy?: string;
        createdAt?: string;
        updatedAt?: string;
    };
    errors?: undefined;
} | {
    success: boolean;
    errors: string[];
    message?: undefined;
    moduleId?: undefined;
    materialForModule?: undefined;
    moduleData?: undefined;
}>;
export declare const getAllModulesHandler: () => Promise<any[]>;
export declare const getModuleByIdHandler: (moduleId: string) => Promise<any>;
export declare const updateModuleHandler: (req: any, id: string, updatedData: Modules, file?: Express.Multer.File) => Promise<{
    success: boolean;
    message: string;
    status?: undefined;
    errors?: undefined;
    courseData?: undefined;
} | {
    status: number;
    success: boolean;
    errors: string[];
    message?: undefined;
    courseData?: undefined;
} | {
    success: boolean;
    message: string;
    courseData: Modules;
    status?: undefined;
    errors?: undefined;
}>;
export declare const deleteModuleHandler: (req: any, id: string) => Promise<void>;
