import { User } from "../../entities/models/users";
import { Pagination } from "../../entities/types/pagination";
import { BaseUseCase } from "../common/base";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  country: string;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  id: string;
}

export interface FindUserInput extends Pagination {
  email?: string;
  name?: string;
}

export interface UserUseCasePort extends BaseUseCase {
  create(input: CreateUserInput): Promise<User>;
  update(input: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
  findByID(id: string, session?: boolean): Promise<User>;
  findAll(input: FindUserInput): Promise<User[]>;
  checkCredentials(email: string, password: string): Promise<User>;
}

export interface UserRepositoryPort {
  create(input: CreateUserInput): Promise<User>;
  update(input: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
  findByID(id: string): Promise<User>;
  find(input: FindUserInput): Promise<User[]>;
  checkCredentials(email: string, password: string): Promise<User>;
}
