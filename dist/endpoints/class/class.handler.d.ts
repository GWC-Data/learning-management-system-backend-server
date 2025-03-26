import { Classes } from '../../db';
export declare const createClassHandler: (req: any, classData: Classes, files?: {
    materialForClass?: Express.Multer.File;
    assignmentFile?: Express.Multer.File;
}) => Promise<{
    success: boolean;
    message: string;
    classId?: undefined;
    classTitle?: undefined;
    classDescription?: undefined;
    moduleId?: undefined;
    assignmentName?: undefined;
    assignmentFile?: undefined;
    materialForClass?: undefined;
    totalMarks?: undefined;
    errors?: undefined;
} | {
    success: boolean;
    message: string;
    classId: string;
    classTitle: string;
    classDescription: string | undefined;
    moduleId: string | undefined;
    assignmentName: string | undefined;
    assignmentFile: string;
    materialForClass: string;
    totalMarks: string | undefined;
    errors?: undefined;
} | {
    success: boolean;
    errors: string[];
    message?: undefined;
    classId?: undefined;
    classTitle?: undefined;
    classDescription?: undefined;
    moduleId?: undefined;
    assignmentName?: undefined;
    assignmentFile?: undefined;
    materialForClass?: undefined;
    totalMarks?: undefined;
}>;
export declare const getAllClassesHandler: () => Promise<any[]>;
export declare const getClassByIdHandler: (classId: string) => Promise<any>;
export declare const getClassByModuleIdHandler: (moduleId: string) => Promise<any[]>;
export declare const updateClassHandler: (req: any, id: string, updatedData: Classes, files?: {
    materialForClass?: Express.Multer.File[];
    assignmentFile?: Express.Multer.File[];
}) => Promise<{
    success: boolean;
    message: string;
    status?: undefined;
    errors?: undefined;
    classData?: undefined;
} | {
    status: number;
    success: boolean;
    errors: string[];
    message?: undefined;
    classData?: undefined;
} | {
    success: boolean;
    message: string;
    classData: Classes;
    status?: undefined;
    errors?: undefined;
}>;
export declare const deleteClassHandler: (req: any, id: string) => Promise<{
    success: boolean;
    message: string;
    errors?: undefined;
} | {
    success: boolean;
    errors: string[];
    message?: undefined;
}>;
