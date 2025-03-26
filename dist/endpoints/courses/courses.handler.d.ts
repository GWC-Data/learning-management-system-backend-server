import { Courses } from '../../db';
export declare const createCourseHandler: (courseData: Courses, req: any, file?: Express.Multer.File) => Promise<{
    success: boolean;
    message: string;
    courseId?: undefined;
    courseImg?: undefined;
    courseData?: undefined;
} | {
    success: boolean;
    message: string;
    courseId: string;
    courseImg: string;
    courseData: Courses;
}>;
export declare const getAllCoursesHandler: () => Promise<any[]>;
export declare const getCourseByIdHandler: (courseId: string) => Promise<any>;
export declare const updateCourseHandler: (id: string, req: any, updatedData: Courses, file?: Express.Multer.File) => Promise<{
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
    message: string;
    courseData: Courses;
    success?: undefined;
    status?: undefined;
    errors?: undefined;
}>;
export declare const deleteCourseHandler: (id: string, req: any) => Promise<{
    success: boolean;
    message: string;
    errors?: undefined;
} | {
    success: boolean;
    errors: string[];
    message?: undefined;
}>;
