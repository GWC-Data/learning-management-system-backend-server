import { LinkedIn } from '../../db/models/LinkedIn';
interface FetchLinkedInJobsResponse {
    status: 'success' | 'error';
    jobs?: LinkedIn[];
    message?: string;
}
export declare const createLinkedInJobHandler: (jobData: Partial<LinkedIn>, file?: Express.Multer.File) => Promise<{
    success: boolean;
    message: string;
    jobId?: undefined;
    imgSrc?: undefined;
    jobData?: undefined;
} | {
    success: boolean;
    message: string;
    jobId: string;
    imgSrc: string;
    jobData: Partial<LinkedIn>;
}>;
export declare const fetchLinkedInJobs: () => Promise<FetchLinkedInJobsResponse>;
export declare const getAllLinkedInHandler: () => Promise<any[]>;
export declare const updateLinkedInJobHandler: (company: string, file?: Express.Multer.File) => Promise<{
    success: boolean;
    message: string;
    imgSrc?: undefined;
    error?: undefined;
} | {
    success: boolean;
    message: string;
    imgSrc: any;
    error?: undefined;
} | {
    success: boolean;
    message: string;
    error: unknown;
    imgSrc?: undefined;
}>;
export declare const updateCarrierPathLinkJobHandler: (id: string, updatedData: Partial<LinkedIn>) => Promise<{
    success: boolean;
    message: string;
    carrierPathLink?: undefined;
    error?: undefined;
} | {
    success: boolean;
    message: string;
    carrierPathLink: string;
    error?: undefined;
} | {
    success: boolean;
    message: string;
    error: unknown;
    carrierPathLink?: undefined;
}>;
export declare const deleteLinkedInJobHandler: (id: string, req: any) => Promise<{
    success: boolean;
    message: string;
    errors?: undefined;
} | {
    success: boolean;
    errors: string[];
    message?: undefined;
}>;
export declare const deleteLinkedInAutomationJobHandler: (req: any) => Promise<{
    success: boolean;
    message: string;
    errors?: undefined;
} | {
    success: boolean;
    errors: string[];
    message?: undefined;
}>;
export {};
