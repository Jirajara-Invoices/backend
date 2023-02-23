import { EMAIL_REGEX } from "../../entities/constants";
import { User } from "../../entities/models/users";
import { ValidationError } from "../../entities/errors";
import { BaseUseCase } from "../common/base";
import { LoggerUseCasePort, TranslationUseCasePort } from "../common/interfaces";
import {
  CreateUserInput,
  FindUserInput,
  UpdateUserInput,
  UserRepositoryPort,
  UserUseCasePort,
} from "./interfaces";

export class UserUseCase extends BaseUseCase implements UserUseCasePort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly logger: LoggerUseCasePort,
    translator: TranslationUseCasePort,
  ) {
    super(translator, null);
  }

  async create(input: CreateUserInput): Promise<User> {
    const errors = this.validateCreateUserInput(input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }

    return await this.userRepository.create(input);
  }

  async update(input: UpdateUserInput): Promise<User> {
    const errors = this.validateUpdateUserInput(input);
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
    const errors = this.validateFiltersInput(input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("filtersError"), errors);
    }

    if (!this.isCurrentUserAdmin()) {
      throw new ValidationError(this.translator.translate("viewAllError"), new Map());
    }

    return await this.userRepository.find(input);
  }

  async checkCredentials(email: string, password: string): Promise<User> {
    const errors = this.validateLoginInput(email, password);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }

    return await this.userRepository.checkCredentials(email, password);
  }

  private validateCreateUserInput(input: CreateUserInput): Map<string, string> {
    const errors: Map<string, string> = new Map();
    if (!input.name || input.name.length < 3) {
      errors.set("name", this.translator.translate("inputNameRequiredError", { length: "3" }));
    }
    if (!input.email || !EMAIL_REGEX.test(input.email)) {
      errors.set("email", this.translator.translate("inputEmailRequiredError"));
    }
    if (!input.password || input.password.length < 8) {
      errors.set(
        "password",
        this.translator.translate("inputPasswordRequiredError", {
          length: "8",
        }),
      );
    }
    if (!input.country || input.country.length !== 2) {
      errors.set("country", this.translator.translate("inputCountryRequiredError"));
    }

    return errors;
  }

  private validateUpdateUserInput(input: UpdateUserInput): Map<string, string> {
    const errors: Map<string, string> = new Map();
    if (!input.id) {
      errors.set("id", this.translator.translate("inputIdError"));
    }

    if (input.name && input.name.length < 3) {
      errors.set("name", this.translator.translate("inputNameRequiredError", { length: "3" }));
    }

    if (input.email && !EMAIL_REGEX.test(input.email)) {
      errors.set("email", this.translator.translate("inputEmailRequiredError"));
    }

    if (input.password && input.password.length < 8) {
      errors.set(
        "password",
        this.translator.translate("inputPasswordRequiredError", { length: "8" }),
      );
    }

    if (input.country && input.country.length !== 2) {
      errors.set("country", this.translator.translate("inputCountryRequiredError"));
    }

    return errors;
  }

  private validateLoginInput(email: string, password: string): Map<string, string> {
    const errors: Map<string, string> = new Map();
    if (!email || !EMAIL_REGEX.test(email)) {
      errors.set("email", this.translator.translate("inputEmailRequiredError"));
    }
    if (!password || password.length < 8) {
      errors.set(
        "password",
        this.translator.translate("inputPasswordRequiredError", { length: "8" }),
      );
    }

    return errors;
  }
}
