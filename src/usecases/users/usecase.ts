import { User } from "../../entities/models/users";
import { ValidationError } from "../../entities/errors";
import { BaseUseCase } from "../common/base";
import { LoggerUseCasePort, TranslationUseCasePort } from "../common/interfaces";
import { validateFiltersInput } from "../common/validators";
import {
  CreateUserInput,
  FindUserInput,
  UpdateUserInput,
  UserRepositoryPort,
  UserUseCasePort,
} from "./interfaces";
import { validateCreateUserInput, validateLoginInput, validateUpdateUserInput } from "./validators";

export class UserUseCase extends BaseUseCase implements UserUseCasePort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly logger: LoggerUseCasePort,
    translator: TranslationUseCasePort,
  ) {
    super(translator, null);
  }

  async create(input: CreateUserInput): Promise<User> {
    const errors = validateCreateUserInput(input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }

    return await this.userRepository.create(input);
  }

  async update(input: UpdateUserInput): Promise<User> {
    const errors = validateUpdateUserInput(input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }

    if (!this.isCurrentUserAuthorized(input.id)) {
      throw new ValidationError(this.translator.translate("updatePermissionsError"), errors);
    }

    return await this.userRepository.update(input);
  }

  async delete(id: string): Promise<void> {
    if (!this.isCurrentUserAuthorized(id)) {
      throw new ValidationError(this.translator.translate("deleteError"), new Map());
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
      throw new ValidationError(this.translator.translate("viewError"), new Map());
    }

    return await this.userRepository.findByID(id);
  }

  async findAll(input: FindUserInput): Promise<User[]> {
    const errors = validateFiltersInput(input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("filtersError"), errors);
    }

    if (!this.isCurrentUserAdmin()) {
      throw new ValidationError(this.translator.translate("viewAllError"), new Map());
    }

    return await this.userRepository.find(input);
  }

  async checkCredentials(email: string, password: string): Promise<User> {
    const errors = validateLoginInput(email, password);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }

    return await this.userRepository.checkCredentials(email, password);
  }
}
