export enum UserRole {
  Admin = "admin",
  User = "user",
}

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  country: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
};
