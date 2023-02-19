import { User } from "../../entities/models/users";
import { ValidationError } from "../../entities/errors";
import { BaseUseCase } from "../common/base";
import { LoggerUseCasePort } from "../common/interfaces";
import { validateFiltersInput } from "../common/validators";
import {
  CreateUserInput,
  FindUserInput,
  UpdateUserInput,
  UserRepositoryPort,
  UserUseCasePort,
} from "./interfaces";
import { validateCreateUserInput, validateLoginInput, validateUpdateUserInput } from "./validators";
import { mapToString } from "../../utilities/arrays";

export class UserUseCase extends BaseUseCase implements UserUseCasePort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly logger: LoggerUseCasePort,
  ) {
    super(null);
  }

  async create(input: CreateUserInput): Promise<User> {
    const errors = validateCreateUserInput(input);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for user creation: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for user creation", errors);
    }

    return await this.userRepository.create(input);
  }

  async update(input: UpdateUserInput): Promise<User> {
    const errors = validateUpdateUserInput(input);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for update user: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for update user", errors);
    }

    if (!this.isCurrentUserAuthorized(input.id)) {
      this.logger.error(`User is not authorized to update this user: ${mapToString(errors)}`);
      throw new ValidationError("User is not authorized to update this user", errors);
    }

    return await this.userRepository.update(input);
  }

  async delete(id: string): Promise<void> {
    if (!this.isCurrentUserAuthorized(id)) {
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

  async findByID(id: string, force?: boolean): Promise<User> {
    if (!this.isCurrentUserAdmin() && !force) {
      this.logger.error(`User is not authorized to find for an user`);
      throw new ValidationError("User is not authorized to find for an users", new Map());
    }

    return await this.userRepository.findByID(id);
  }

  async findAll(input: FindUserInput): Promise<User[]> {
    const errors = validateFiltersInput(input);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for find user: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for find user", errors);
    }

    if (!this.isCurrentUserAdmin()) {
      this.logger.error(`User is not authorized to find all users`);
      throw new ValidationError("User is not authorized to find all users", new Map());
    }

    return await this.userRepository.find(input);
  }

  async checkCredentials(email: string, password: string): Promise<User> {
    const errors = validateLoginInput(email, password);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for login: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for login", errors);
    }

    return await this.userRepository.checkCredentials(email, password);
  }
}
