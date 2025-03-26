export interface Role {
  id?: string;
  name: string;
  description: string;
  permissions: string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updateAt?: string;
}