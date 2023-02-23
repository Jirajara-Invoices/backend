import { User } from "../../entities/models/users";
import { Invoice } from "../../entities/models/invoice";
import { ValidationError } from "../../entities/errors";
import { BaseUseCase } from "../common/base";
import { LoggerUseCasePort, TranslationUseCasePort } from "../common/interfaces";
import {
  CreateInvoiceInput,
  InvoiceFilterInput,
  InvoiceRepositoryPort,
  InvoiceUseCasePort,
  UpdateInvoiceInput,
} from "./interfaces";
import { validateCreateInvoiceInput, validateUpdateInvoiceInput } from "./validators";
import { Tax } from "../../entities/models/taxes";
import { InvoiceItem } from "../../entities/models/invoice_items";

export class InvoiceUseCase extends BaseUseCase implements InvoiceUseCasePort {
  constructor(
    private readonly repository: InvoiceRepositoryPort,
    private readonly logger: LoggerUseCasePort,
    translator: TranslationUseCasePort,
    currentUser: User | null,
  ) {
    super(translator, currentUser);
  }

  async create(input: CreateInvoiceInput): Promise<Invoice> {
    const errors = validateCreateInvoiceInput(input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }

    return await this.repository.create(input, this.getCurrentUserId());
  }
  async update(input: UpdateInvoiceInput): Promise<Invoice> {
    const invoice = await this.repository.findByID(input.id);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      throw new ValidationError(this.translator.translate("updatePermissionsError"), new Map());
    }

    const errors = validateUpdateInvoiceInput(invoice, input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }

    return await this.repository.update(input, this.getCurrentUserId());
  }
  async delete(id: string): Promise<void> {
    const invoice = await this.repository.findByID(id);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      throw new ValidationError(this.translator.translate("deleteError"), new Map());
    }

    return await this.repository.delete(id);
  }
  async findByID(id: string): Promise<Invoice> {
    const invoice = await this.repository.findByID(id);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      throw new ValidationError(this.translator.translate("viewError"), new Map());
    }

    return invoice;
  }
  async findAll(filter: InvoiceFilterInput): Promise<Invoice[]> {
    this.validateFilterInputWithUser(filter);

    return await this.repository.findAll(filter);
  }

  async getDiscount(invoiceId: string): Promise<number> {
    const invoice = await this.repository.findByID(invoiceId);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      throw new ValidationError(this.translator.translate("viewError"), new Map());
    }

    return this.repository.getDiscount(invoiceId);
  }

  async getInvoiceTaxes(invoiceId: string): Promise<Tax[]> {
    const invoice = await this.repository.findByID(invoiceId);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      throw new ValidationError(this.translator.translate("viewError"), new Map());
    }

    return this.repository.getInvoiceTaxes(invoiceId);
  }

  async getNonTaxableAmount(invoiceId: string): Promise<number> {
    const invoice = await this.repository.findByID(invoiceId);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      throw new ValidationError(this.translator.translate("viewError"), new Map());
    }

    return this.repository.getNonTaxableAmount(invoiceId);
  }

  async getSubtotal(invoiceId: string): Promise<number> {
    const invoice = await this.repository.findByID(invoiceId);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      throw new ValidationError(this.translator.translate("viewError"), new Map());
    }

    return this.repository.getSubtotal(invoiceId);
  }

  async getTaxAmount(invoiceId: string): Promise<number> {
    const invoice = await this.repository.findByID(invoiceId);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      throw new ValidationError(this.translator.translate("viewError"), new Map());
    }

    return this.repository.getTaxAmount(invoiceId);
  }

  async getTaxableAmount(invoiceId: string): Promise<number> {
    const invoice = await this.repository.findByID(invoiceId);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      throw new ValidationError(this.translator.translate("viewError"), new Map());
    }

    return this.repository.getTaxableAmount(invoiceId);
  }

  async getTotal(invoiceId: string): Promise<number> {
    const invoice = await this.repository.findByID(invoiceId);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      throw new ValidationError(this.translator.translate("viewError"), new Map());
    }

    return this.repository.getTotal(invoiceId);
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    const invoice = await this.repository.findByID(invoiceId);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      throw new ValidationError(this.translator.translate("viewError"), new Map());
    }

    return this.repository.getInvoiceItems(invoiceId);
  }
}
