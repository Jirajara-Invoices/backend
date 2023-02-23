import { User } from "../../entities/models/users";
import { Tax } from "../../entities/models/taxes";
import { ValidationError } from "../../entities/errors";
import { BaseUseCase } from "../common/base";
import { LoggerUseCasePort, TranslationUseCasePort } from "../common/interfaces";
import {
  CreateTaxInput,
  TaxesFilterInput,
  TaxesRepositoryPort,
  TaxesUseCasePort,
  UpdateTaxInput,
} from "./interfaces";
import { validateCreateTaxInput, validateUpdateTaxInput } from "./validators";

export class TaxUseCase extends BaseUseCase implements TaxesUseCasePort {
  constructor(
    private readonly repository: TaxesRepositoryPort,
    private readonly logger: LoggerUseCasePort,
    translator: TranslationUseCasePort,
    currentUser: User | null,
  ) {
    super(translator, currentUser);
  }

  async create(input: CreateTaxInput): Promise<Tax> {
    const errors = validateCreateTaxInput(input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }
    return await this.repository.create(input, this.getCurrentUserId());
  }

  async update(input: UpdateTaxInput): Promise<Tax> {
    const tax = await this.repository.findByID(input.id);
    if (!this.isCurrentUserAuthorized(tax.user_id)) {
      throw new ValidationError(this.translator.translate("updatePermissionsError"), new Map());
    }

    const errors = validateUpdateTaxInput(input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }

    return await this.repository.update(input, this.getCurrentUserId());
  }

  async delete(id: string): Promise<void> {
    const tax = await this.repository.findByID(id);

    if (!this.isCurrentUserAuthorized(tax.user_id)) {
      throw new ValidationError(this.translator.translate("deleteError"), new Map());
    }

    return await this.repository.delete(id);
  }

  async findByID(id: string): Promise<Tax> {
    const tax = await this.repository.findByID(id);

    if (!this.isCurrentUserAuthorized(tax.user_id)) {
      throw new ValidationError(this.translator.translate("viewError"), new Map());
    }

    return tax;
  }

  async findAll(filter: TaxesFilterInput): Promise<Tax[]> {
    this.validateFilterInputWithUser(filter);

    return await this.repository.findAll(filter);
  }
}
