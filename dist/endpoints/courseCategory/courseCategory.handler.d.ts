import { CourseCategory } from "../../db";
export declare const createCourseCategoryHandler: (req: any, courseCategoryData: any, file?: Express.Multer.File) => Promise<{
    success: boolean;
    message: string;
    courseCategoryId?: undefined;
    coursecategoryImg?: undefined;
    errors?: undefined;
} | {
    success: boolean;
    message: string;
    courseCategoryId: string;
    coursecategoryImg: string;
    errors?: undefined;
} | {
    success: boolean;
    errors: any[];
    message?: undefined;
    courseCategoryId?: undefined;
    coursecategoryImg?: undefined;
}>;
export declare const getAllCourseCategoriesHandler: () => Promise<any[]>;
export declare const getCourseCategoryByIdHandler: (id: string) => Promise<any>;
export declare const updateCourseCategoryHandler: (id: string, req: any, updatedData: CourseCategory, file?: Express.Multer.File) => Promise<{
    success: boolean;
    message: string;
    status?: undefined;
    errors?: undefined;
    courseCategoryData?: undefined;
} | {
    status: number;
    success: boolean;
    errors: string[];
    message?: undefined;
    courseCategoryData?: undefined;
} | {
    message: string;
    courseCategoryData: any;
    success?: undefined;
    status?: undefined;
    errors?: undefined;
}>;
export declare const deleteCourseCategoryHandler: (id: string, req: any) => Promise<{
    success: boolean;
    message: string;
    errors?: undefined;
} | {
    success: boolean;
    errors: string[];
    message?: undefined;
}>;
