import { User } from "../../entities/models/users";
import { InvoiceItem } from "../../entities/models/invoice_items";
import { ValidationError } from "../../entities/errors";
import { mapToString } from "../../utilities/arrays";
import { BaseUseCase } from "../common/base";
import { LoggerUseCasePort } from "../common/interfaces";
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
    currentUser: User | null,
  ) {
    super(currentUser);
  }

  async create(input: CreateItemInput): Promise<InvoiceItem> {
    const errors = validateCreateItemInput(input);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for invoice item creation: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for invoice item creation", errors);
    }
    return await this.repository.create(input);
  }

  async update(input: UpdateItemInput): Promise<InvoiceItem> {
    const errors = validateUpdateItemInput(input);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for update invoice item: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for update invoice item", errors);
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
      this.logger.error(`Invalid input for invoice items filter: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for invoice items filter", errors);
    }

    return await this.repository.findAll(filter, currentUserId);
  }
}
