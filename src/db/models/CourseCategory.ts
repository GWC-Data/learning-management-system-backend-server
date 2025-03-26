export interface CourseCategory {
  id?: string; // UUID (auto-generated)
  coursecategoryName: string;
  description?: string;
  coursecategoryImg?: string | string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
