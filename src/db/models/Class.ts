export interface Classes {
  id?: string; // UUID (auto-generated)
  classTitle: string;
  classDescription?: string;
  classRecordedLink?: string;
  assignmentName?: string;
  assignmentFile?: string; // URL for uploaded assignment file
  moduleId?: string;
  materialForClass?: string; // URL for uploaded class material
  totalMarks?: string;
  assignmentEndDate?: string; // ISO date string
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
