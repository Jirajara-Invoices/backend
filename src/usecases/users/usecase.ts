import { User } from "../../entities/models/users";

import { ValidationError } from "../../entities/errors";
import {
  CreateUserInput,
  FindUserInput,
  UpdateUserInput,
  UserRepositoryPort,
  UserUseCasePort,
} from "./interfaces";
import {
  validateCreateUserInput,
  validateFindUserInput,
  validateLoginInput,
  validateUpdateUserInput,
} from "./validators";

export class UserUseCase implements UserUseCasePort {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async create(input: CreateUserInput): Promise<User> {
    const errors = validateCreateUserInput(input);
    if (errors.size > 0) {
      throw new ValidationError("Invalid input for user creation", errors);
    }

    return await this.userRepository.save(input);
  }

  async update(input: UpdateUserInput): Promise<User> {
    const errors = validateUpdateUserInput(input);
    if (errors.size > 0) {
      throw new ValidationError("Invalid input for update user", errors);
    }

    return await this.userRepository.update(input);
  }

  async delete(id: string): Promise<void> {
    return await this.userRepository.delete(id);
  }

  async findByID(id: string): Promise<User> {
    return await this.userRepository.findByID(id);
  }

  async findAll(input: FindUserInput): Promise<User[]> {
    const errors = validateFindUserInput(input);
    if (errors.size > 0) {
      throw new ValidationError("Invalid input for find user", errors);
    }

    return await this.userRepository.find(input);
  }

  async checkCredentials(email: string, password: string): Promise<User> {
    const errors = validateLoginInput(email, password);
    if (errors.size > 0) {
      throw new ValidationError("Invalid input for login", errors);
    }

    return await this.userRepository.checkCredentials(email, password);
  }
}
