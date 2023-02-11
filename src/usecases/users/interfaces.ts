import { User } from "../../entities/models/users";
import { Pagination } from "../../entities/types/pagination";

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

export interface UserUseCasePort {
  setCurrentUser(user: User | null): void;
  create(input: CreateUserInput): Promise<User>;
  update(input: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
  findByID(id: string): Promise<User>;
  findAll(input: FindUserInput): Promise<User[]>;
  checkCredentials(email: string, password: string): Promise<User>;
}

export interface UserRepositoryPort {
  save(input: CreateUserInput): Promise<User>;
  update(input: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
  findByID(id: string): Promise<User>;
  find(input: FindUserInput): Promise<User[]>;
  checkCredentials(email: string, password: string): Promise<User>;
}

export interface UserPresenterPort {
  present(user: User): Promise<User>;
}
