export interface Modules {
  id?: string; // UUID (auto-generated)
  courseId: string;
  moduleName?: string;
  moduleDescription?: string;
  sequence?: number;
  materialForModule?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

