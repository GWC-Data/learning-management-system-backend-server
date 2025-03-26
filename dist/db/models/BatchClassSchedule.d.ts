export interface BatchClassSchedule {
    id?: string;
    batchId: string;
    moduleId: string;
    classId: string;
    startDate: string | Date;
    startTime: string;
    endDate: string | Date;
    endTime: string;
    meetingLink: string;
    assignmentEndDate?: string | Date;
    trainerIds?: string[];
    traineeAssignments?: {
        traineeId: string;
        assignmentEndDate: string | Date;
    }[];
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
