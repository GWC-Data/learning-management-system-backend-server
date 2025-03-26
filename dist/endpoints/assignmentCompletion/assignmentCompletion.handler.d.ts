import { Request } from 'express';
import { AssignmentCompletion } from '../../db';
export declare const createAssignmentCompletionHandler: (req: Request, assignmentCompletionData: AssignmentCompletion, file?: Express.Multer.File) => Promise<{
    success: boolean;
    message: string;
    assignmentCompletionData?: undefined;
    errors?: undefined;
} | {
    success: boolean;
    assignmentCompletionData: AssignmentCompletion;
    message?: undefined;
    errors?: undefined;
} | {
    success: boolean;
    errors: string[];
    message?: undefined;
    assignmentCompletionData?: undefined;
}>;
export declare const getAllAssignmentCompletionsHandler: () => Promise<any[]>;
export declare const getAssignmentCompletionByIdHandler: (id: string) => Promise<any>;
export declare const updateAssignmentCompletionHandler: (req: any, id: string, updatedData: AssignmentCompletion, file?: Express.Multer.File) => Promise<{
    success: boolean;
    message: string;
    errors?: undefined;
    updatedData?: undefined;
} | {
    success: boolean;
    errors: string[];
    message?: undefined;
    updatedData?: undefined;
} | {
    success: boolean;
    message: string;
    updatedData: any;
    errors?: undefined;
}>;
export declare const deleteAssignmentCompletionHandler: (req: any, id: string) => Promise<{
    success: boolean;
    message: string;
    errors?: undefined;
} | {
    success: boolean;
    errors: string[];
    message?: undefined;
}>;
