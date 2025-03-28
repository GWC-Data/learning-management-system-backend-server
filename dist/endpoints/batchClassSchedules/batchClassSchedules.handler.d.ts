import { BatchClassSchedule } from '../../db';
export declare const createBatchClassScheduleTableHandler: (req: any, batchModule: BatchClassSchedule) => Promise<{
    trainerIds: string[];
    assignmentEndDate: Date;
    id: string;
    batchId: string;
    moduleId: string;
    classId: string;
    startDate: string | Date;
    startTime: string;
    endDate: string | Date;
    endTime: string;
    meetingLink: string;
    traineeAssignments?: {
        traineeId: string;
        assignmentEndDate: string | Date;
    }[];
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}>;
export declare const getAllBatchClassSchedulesHandler: () => Promise<{
    batchClassSchedules: {
        id: any;
        batch: {
            id: any;
            batchName: any;
        } | null;
        module: {
            id: any;
            moduleName: any;
        } | null;
        class: {
            id: any;
            classTitle: any;
        } | null;
        startDate: any;
        startTime: any;
        endDate: any;
        endTime: any;
        meetingLink: any;
        assignmentEndDate: any;
        trainers: any;
        assignments: any;
    }[];
    message?: undefined;
    error?: undefined;
} | {
    message: string;
    error: unknown;
    batchClassSchedules?: undefined;
}>;
export declare const getBatchClassScheduleDetailsHandler: (id: string) => Promise<{
    batchClassSchedules: {
        id: any;
        batch: {
            id: any;
            batchName: any;
        } | null;
        module: {
            id: any;
            moduleName: any;
        } | null;
        class: {
            id: any;
            classTitle: any;
        } | null;
        startDate: any;
        startTime: any;
        endDate: any;
        endTime: any;
        meetingLink: any;
        assignmentEndDate: any;
        trainers: any;
        assignments: any;
    }[];
}>;
export declare const getBatchClassScheduleByClassIdHandler: (classId: string) => Promise<{
    message: string;
    batchModuleClass: {
        id: any;
        batchId: any;
        moduleId: any;
        classId: any;
        startDate: any;
        startTime: any;
        endDate: any;
        endTime: any;
        meetingLink: any;
        duration: any;
        createdAt: any;
        updatedAt: any;
        module: {
            id: any;
            moduleName: any;
            materialForModule: any;
        };
        class: {
            id: any;
            classTitle: any;
        };
        batch: {
            id: any;
            batchName: any;
            startDate: any;
            endDate: any;
        };
        trainers: any;
        assignments: any;
    }[];
}>;
export declare const getBatchClassScheduleByBatchIdHandler: (batchId: string) => Promise<{
    message: string;
    batchClassSchedule: never[];
} | {
    batchClassSchedule: {
        id: any;
        batchId: any;
        moduleId: any;
        classId: any;
        startDate: any;
        startTime: any;
        endDate: any;
        endTime: any;
        meetingLink: any;
        assignmentEndDate: any;
        module: {
            id: any;
            moduleName: any;
            materialForModule: any;
            sequence: any;
        };
        class: {
            id: any;
            classTitle: any;
            classDescription: any;
            classRecordedLink: any;
            materialForClass: any;
            assignmentName: any;
            assignmentFile: any;
            totalMarks: any;
        };
        batch: {
            id: any;
            batchName: any;
            startDate: any;
            endDate: any;
        };
        trainers: any;
        assignments: any;
    }[];
    message?: undefined;
}>;
export declare const updateBatchClassScheduleHandler: (req: any, id: string, updateBatchModule: Partial<BatchClassSchedule>) => Promise<{
    assignmentEndDate: any;
    id: string;
    batchId?: string | undefined;
    moduleId?: string | undefined;
    classId?: string | undefined;
    startDate?: string | Date | undefined;
    startTime?: string | undefined;
    endDate?: string | Date | undefined;
    endTime?: string | undefined;
    meetingLink?: string | undefined;
    trainerIds?: string[] | undefined;
    traineeAssignments?: {
        traineeId: string;
        assignmentEndDate: string | Date;
    }[] | undefined;
    createdBy?: string | undefined;
    updatedBy?: string | undefined;
    createdAt?: (string | Date) | undefined;
    updatedAt?: (string | Date) | undefined;
}>;
export declare const deleteBatchClassScheduleHandler: (id: string, req: any) => Promise<void>;
