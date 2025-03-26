export interface Batch {
  id?: string;
  courseId: string;
  batchName: string;
  traineeIds: string[];
  startDate: string;
  endDate: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updateAt?: string;
}