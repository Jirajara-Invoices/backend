import { User } from "../../entities/models/users";
import { Invoice } from "../../entities/models/invoice";
import { ValidationError } from "../../entities/errors";
import { BaseUseCase } from "../common/base";
import { LoggerUseCasePort } from "../common/interfaces";
import { validateFiltersInput } from "../common/validators";
import {
  CreateInvoiceInput,
  InvoiceFilterInput,
  InvoiceRepositoryPort,
  InvoiceUseCasePort,
  UpdateInvoiceInput,
} from "./interfaces";
import { validateCreateInvoiceInput, validateUpdateInvoiceInput } from "./validators";
import { mapToString } from "../../utilities/arrays";

export class InvoiceUseCase extends BaseUseCase implements InvoiceUseCasePort {
  constructor(
    private readonly repository: InvoiceRepositoryPort,
    private readonly logger: LoggerUseCasePort,
    currentUser: User | null,
  ) {
    super(currentUser);
  }

  async create(input: CreateInvoiceInput): Promise<Invoice> {
    const errors = validateCreateInvoiceInput(input);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for invoice creation: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for invoice creation", errors);
    }

    return await this.repository.create(input, this.getCurrentUserId());
  }
  async update(input: UpdateInvoiceInput): Promise<Invoice> {
    const invoice = await this.repository.findByID(input.id);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      this.logger.error(`User is not authorized to update this invoice`);
      throw new ValidationError("User is not authorized to update this invoice", new Map());
    }

    const errors = validateUpdateInvoiceInput(invoice, input);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for update invoice: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for update invoice", errors);
    }

    return await this.repository.update(input, this.getCurrentUserId());
  }
  async delete(id: string): Promise<void> {
    const invoice = await this.repository.findByID(id);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      this.logger.error(`User is not authorized to update this invoice`);
      throw new ValidationError("User is not authorized to update this invoice", new Map());
    }

    return await this.repository.delete(id);
  }
  async findByID(id: string): Promise<Invoice> {
    const invoice = await this.repository.findByID(id);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      this.logger.error(`User is not authorized to update this invoice`);
      throw new ValidationError("User is not authorized to update this invoice", new Map());
    }

    return invoice;
  }
  async findAll(filter: InvoiceFilterInput): Promise<Invoice[]> {
    const errors = validateFiltersInput(filter);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for invoice filters: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for invoice filters", errors);
    }

    if (filter.userId && !this.isCurrentUserAuthorized(filter.userId)) {
      this.logger.error(`User is not authorized to get invoices for this user`);
      throw new ValidationError("User is not authorized to get invoices for this user", new Map());
    } else {
      filter.userId = this.getCurrentUserId();
    }

    return await this.repository.findAll(filter);
  }
}
