export interface Permission {
  id?: string;
  action: string;
  groupName: string;
  description: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updateAt?: string;
}