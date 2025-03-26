

export interface Attendance {
    id?: string;
    userId?: string;
    batchId?: string;
    courseId?: string;
    moduleId?: string;
    classId?: string;
    firstJoin?: string;
    lastLeave?: string;
    email?: string;
    percentage?: string;
    duration?: string;
    teamsRole?: string;
    attendance?: string;
    attendanceFileId?: string;
    createdBy: string;
    updatedBy: string;
    createdAt?: string;
    updatedAt?: string;
}