import { User } from "../../../entities/models/users";

export const userTypeResolvers = {
  id: (user: User) => user.id,
  email: (user: User) => user.email,
  name: (user: User) => user.name,
  role: (user: User) => user.role.toUpperCase(),
  country: (user: User) => user.country,
  createdAt: (user: User) => user.created_at,
  updatedAt: (user: User) => user.updated_at,
  deletedAt: (user: User) => user.deleted_at,
};
