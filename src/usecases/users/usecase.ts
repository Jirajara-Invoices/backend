import { Logger } from "winston";

import { User, UserRole } from "../../entities/models/users";
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
  private currentUser: User | null = null;

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly logger: Logger,
  ) {}

  setCurrentUser(user: User | null): void {
    this.currentUser = user;
  }

  async create(input: CreateUserInput): Promise<User> {
    const errors = validateCreateUserInput(input);
    if (errors.size > 0) {
      this.logger.error("Invalid input for user creation", Array.from(errors.entries()));
      throw new ValidationError("Invalid input for user creation", errors);
    }

    return await this.userRepository.save(input);
  }

  async update(input: UpdateUserInput): Promise<User> {
    const errors = validateUpdateUserInput(input);
    if (errors.size > 0) {
      this.logger.error("Invalid input for update user", Array.from(errors.entries()));
      throw new ValidationError("Invalid input for update user", errors);
    }

    if (this.currentUser?.id !== input.id && !(this.currentUser?.role === UserRole.Admin)) {
      this.logger.error("User is not authorized to update this user", Array.from(errors.entries()));
      throw new ValidationError("User is not authorized to update this user", errors);
    }

    return await this.userRepository.update(input);
  }

  async delete(id: string): Promise<void> {
    if (this.currentUser?.id !== id && !(this.currentUser?.role === UserRole.Admin)) {
      this.logger.error("User is not authorized to delete this user");
      throw new ValidationError("User is not authorized to delete this user", new Map());
    }

    try {
      return await this.userRepository.delete(id);
    } catch (error) {
      this.logger.error("Failed to delete user");
      throw error;
    }
  }

  async findByID(id: string): Promise<User> {
    return await this.userRepository.findByID(id);
  }

  async findAll(input: FindUserInput): Promise<User[]> {
    const errors = validateFindUserInput(input);
    if (errors.size > 0) {
      this.logger.error("Invalid input for find user", Array.from(errors.entries()));
      throw new ValidationError("Invalid input for find user", errors);
    }

    return await this.userRepository.find(input);
  }

  async checkCredentials(email: string, password: string): Promise<User> {
    const errors = validateLoginInput(email, password);
    if (errors.size > 0) {
      this.logger.error("Invalid input for login", Array.from(errors.entries()));
      throw new ValidationError("Invalid input for login", errors);
    }

    return await this.userRepository.checkCredentials(email, password);
  }
}
