import { Request, Response } from 'express';
import { AttendanceFile } from '../../db';
export declare const createAttendanceFileHandler: (req: any, AttendanceFileData: AttendanceFile, file?: Express.Multer.File) => Promise<{
    success: boolean;
    message: string;
    attendanceFileId?: undefined;
    teamsAttendanceFile?: undefined;
    attendanceFileData?: undefined;
    errors?: undefined;
} | {
    success: boolean;
    message: string;
    attendanceFileId: string;
    teamsAttendanceFile: string;
    attendanceFileData: AttendanceFile;
    errors?: undefined;
} | {
    success: boolean;
    errors: string[];
    message?: undefined;
    attendanceFileId?: undefined;
    teamsAttendanceFile?: undefined;
    attendanceFileData?: undefined;
}>;
export declare const getAllAttendanceFilesHandler: () => Promise<any[]>;
export declare const getAttendanceFileByIdHandler: (id: string) => Promise<any>;
export declare const getAttendanceFilesByClassIdHandler: (classId: string) => Promise<any[] | null>;
export declare const updateAttendanceFileHandler: (req: any, id: string, updatedData: AttendanceFile, file?: Express.Multer.File) => Promise<{
    success: boolean;
    message: string;
    status?: undefined;
    errors?: undefined;
    attendanceFileData?: undefined;
} | {
    status: number;
    success: boolean;
    errors: string[];
    message?: undefined;
    attendanceFileData?: undefined;
} | {
    message: string;
    attendanceFileData: AttendanceFile;
    success?: undefined;
    status?: undefined;
    errors?: undefined;
}>;
export declare const deleteAttendanceFileHandler: (req: any, id: string) => Promise<{
    success: boolean;
    message: string;
    errors?: undefined;
} | {
    success: boolean;
    errors: string[];
    message?: undefined;
}>;
export declare const createAttendanceHandler: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateAttendanceByClassIdHandler: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAttendanceByClassIdHandler: (req: any, classId: string) => Promise<{
    success: boolean;
    message: string;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    message?: undefined;
}>;
export declare const getAllAttendanceHandler: () => Promise<any[]>;
export declare const getAttendanceHandler: (req: Request) => Promise<any>;
