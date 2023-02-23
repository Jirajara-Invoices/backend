import { User } from "../../entities/models/users";
import { InvoiceItem } from "../../entities/models/invoice_items";
import { ValidationError } from "../../entities/errors";
import { BaseUseCase } from "../common/base";
import { LoggerUseCasePort, TranslationUseCasePort } from "../common/interfaces";
import { validateFiltersInput } from "../common/validators";
import {
  CreateItemInput,
  InvoiceItemRepositoryPort,
  InvoiceItemUseCasePort,
  ItemsFilterInput,
  UpdateItemInput,
} from "./interfaces";
import { validateCreateItemInput, validateUpdateItemInput } from "./validators";

export class InvoiceItemUseCase extends BaseUseCase implements InvoiceItemUseCasePort {
  constructor(
    private readonly repository: InvoiceItemRepositoryPort,
    private readonly logger: LoggerUseCasePort,
    translator: TranslationUseCasePort,
    currentUser: User | null,
  ) {
    super(translator, currentUser);
  }

  async create(input: CreateItemInput): Promise<InvoiceItem> {
    const errors = validateCreateItemInput(input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }
    return await this.repository.create(input);
  }

  async update(input: UpdateItemInput): Promise<InvoiceItem> {
    const errors = validateUpdateItemInput(input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }

    return await this.repository.update(input, this.getCurrentUserId());
  }

  async delete(id: string): Promise<void> {
    return await this.repository.delete(id, this.getCurrentUserId());
  }

  async findByID(id: string): Promise<InvoiceItem> {
    const currentUserId = this.isCurrentUserAdmin() ? null : this.getCurrentUserId();

    return await this.repository.findByID(id, currentUserId);
  }

  async findAll(filter: ItemsFilterInput): Promise<InvoiceItem[]> {
    const currentUserId = this.isCurrentUserAdmin() ? null : this.getCurrentUserId();
    const errors = validateFiltersInput(filter);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("filtersError"), errors);
    }

    return await this.repository.findAll(filter, currentUserId);
  }
}
