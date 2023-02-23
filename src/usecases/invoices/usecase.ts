import { User } from "../../entities/models/users";
import { Invoice, InvoiceStatus, InvoiceType } from "../../entities/models/invoice";
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
    const errors = this.validateCreateInvoiceInput(input);
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

    const errors = this.validateUpdateInvoiceInput(invoice, input);
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

  private validateCreateInvoiceInput(input: CreateInvoiceInput): Map<string, string> {
    const errors: Map<string, string> = new Map();
    if (!input.address_id) {
      errors.set("address_id", this.translator.translate("inputInvoiceAddressIdError"));
    }
    if (!input.client_address_id) {
      errors.set(
        "client_address_id",
        this.translator.translate("inputInvoiceClientAddressIdError"),
      );
    }
    if (!input.type || !(Object.values(InvoiceType) as string[]).includes(input.type)) {
      errors.set("type", this.translator.translate("inputInvoiceTypeError"));
    }
    if (!input.number) {
      errors.set("number", this.translator.translate("inputInvoiceNumberError"));
    }
    if (!input.date) {
      errors.set("date", this.translator.translate("inputInvoiceDateError"));
    }
    if (!input.due_date || input.due_date < input.date) {
      errors.set("due_date", this.translator.translate("inputInvoiceDueDateError"));
    }
    if (!input.status || !(Object.values(InvoiceStatus) as string[]).includes(input.status)) {
      errors.set("status", this.translator.translate("inputInvoiceStatusError"));
    }

    return errors;
  }

  private validateUpdateInvoiceInput(
    invoice: Invoice,
    input: UpdateInvoiceInput,
  ): Map<string, string> {
    const errors: Map<string, string> = new Map();
    if (!input.id) {
      errors.set("id", this.translator.translate("inputIdError"));
    }

    if (input.type && !(Object.values(InvoiceType) as string[]).includes(input.type)) {
      errors.set("type", this.translator.translate("inputInvoiceTypeError"));
    }

    if (input.status && !(Object.values(InvoiceStatus) as string[]).includes(input.status)) {
      errors.set("status", this.translator.translate("inputInvoiceStatusError"));
    }

    if (
      input.date &&
      (input.date > invoice.due_date || (input.due_date && input.date > input.due_date))
    ) {
      errors.set("date", this.translator.translate("inputInvoiceUpdateDateError"));
    }

    if (
      input.due_date &&
      (input.due_date < invoice.date || (input.date && input.due_date < input.date))
    ) {
      errors.set("due_date", this.translator.translate("inputInvoiceUpdateDueDateError"));
    }

    return errors;
  }
}
