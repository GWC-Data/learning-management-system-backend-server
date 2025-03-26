import { Batch } from '../../db';
export declare const createBatchTable: (req: any, batch: Batch) => Promise<{
    traineeIds: string[];
    id: string;
    courseId: string;
    batchName: string;
    startDate: string;
    endDate: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updateAt?: string;
}>;
export declare const getAllBatchesHandler: () => Promise<any[]>;
export declare const getBatchDetailsHandler: (id: string) => Promise<{
    id: any;
    courseId: any;
    batchName: any;
    startDate: any;
    endDate: any;
    trainees: any;
    course: {
        courseName: any;
        courseImg: any;
        courseLink: any;
    };
}>;
export declare const getBatchByBatchNameHandler: (batchName: string) => Promise<{
    batchId: any;
    batchName: any;
    startDate: any;
    endDate: any;
    course: {
        id: any;
        courseName: any;
        courseImg: any;
        courseLink: any;
    } | null;
    trainees: {
        id: any;
        firstName: any;
        lastName: any;
    }[];
}>;
export declare const getBatchIdsByTraineeIdHandler: (id: string) => Promise<any[]>;
export declare const updateBatchesHandler: (id: string, req: any, updateBatch: Partial<Batch>) => Promise<{
    id: string;
    courseId?: string | undefined;
    batchName?: string | undefined;
    traineeIds?: string[] | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    createdBy?: string | undefined;
    updatedBy?: string | undefined;
    createdAt?: string | undefined;
    updateAt?: string | undefined;
}>;
export declare const deleteBatchHandler: (req: any, id: string) => Promise<{
    success: boolean;
    message: string;
}>;
