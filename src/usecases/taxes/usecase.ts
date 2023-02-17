import { User } from "../../entities/models/users";
import { Tax } from "../../entities/models/taxes";
import { ValidationError } from "../../entities/errors";
import { mapToString } from "../../utilities/arrays";
import { BaseUseCase } from "../common/base";
import { LoggerUseCasePort } from "../common/interfaces";
import {
  CreateTaxInput,
  TaxesFilterInput,
  TaxesRepositoryPort,
  TaxesUseCasePort,
  UpdateTaxInput,
} from "./interfaces";
import { validateCreateTaxInput, validateUpdateTaxInput } from "./validators";
import { validateFiltersInput } from "../common/validators";

export class TaxUseCase extends BaseUseCase implements TaxesUseCasePort {
  constructor(
    private readonly repository: TaxesRepositoryPort,
    private readonly logger: LoggerUseCasePort,
    currentUser: User | null,
  ) {
    super(currentUser);
  }

  async create(input: CreateTaxInput): Promise<Tax> {
    const errors = validateCreateTaxInput(input);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for tax creation: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for tax creation", errors);
    }
    return await this.repository.create(input, this.getCurrentUserId());
  }

  async update(input: UpdateTaxInput): Promise<Tax> {
    const tax = await this.repository.findByID(input.id);
    if (!this.isCurrentUserAuthorized(tax.user_id)) {
      this.logger.error(`User is not authorized to update this tax`);
      throw new ValidationError("User is not authorized to update this tax", new Map());
    }

    const errors = validateUpdateTaxInput(input);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for update tax: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for update tax", errors);
    }

    return await this.repository.update(input, this.getCurrentUserId());
  }

  async delete(id: string): Promise<void> {
    const tax = await this.repository.findByID(id);

    if (!this.isCurrentUserAuthorized(tax.user_id)) {
      this.logger.error(`User is not authorized to update this tax`);
      throw new ValidationError("User is not authorized to update this tax", new Map());
    }

    return await this.repository.delete(id);
  }

  async findByID(id: string): Promise<Tax> {
    const tax = await this.repository.findByID(id);

    if (!this.isCurrentUserAuthorized(tax.user_id)) {
      this.logger.error(`User is not authorized to update this tax`);
      throw new ValidationError("User is not authorized to update this tax", new Map());
    }

    return tax;
  }

  async findAll(filter: TaxesFilterInput): Promise<Tax[]> {
    const errors = validateFiltersInput(filter);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for tax filters: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for tax filters", errors);
    }

    if (filter.userId && !this.isCurrentUserAuthorized(filter.userId)) {
      this.logger.error(`User is not authorized to search for this user taxes`);
      throw new ValidationError("User is not authorized to search for this user taxes", new Map());
    } else {
      filter.userId = this.getCurrentUserId();
    }

    return await this.repository.findAll(filter);
  }
}
