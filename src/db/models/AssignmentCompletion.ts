export interface AssignmentCompletion {
  id?: string;
  classId: string;
  traineeId: string;
  obtainedMarks: number;
  obtainedPercentage: number;
  courseAssignmentAnswerFile: string;
  createdBy: string;
  updatedBy: string;
  createdAt?: string;
  updateAt?: string;
};