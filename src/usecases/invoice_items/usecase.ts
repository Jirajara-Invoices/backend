import { User } from "../../entities/models/users";
import { InvoiceItem, InvoiceItemType } from "../../entities/models/invoice_items";
import { ValidationError } from "../../entities/errors";
import { BaseUseCase } from "../common/base";
import { LoggerUseCasePort, TranslationUseCasePort } from "../common/interfaces";
import {
  CreateItemInput,
  InvoiceItemRepositoryPort,
  InvoiceItemUseCasePort,
  ItemsFilterInput,
  UpdateItemInput,
} from "./interfaces";

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
    const errors = this.validateCreateItemInput(input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }
    return await this.repository.create(input);
  }

  async update(input: UpdateItemInput): Promise<InvoiceItem> {
    const errors = this.validateUpdateItemInput(input);
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
    const errors = this.validateFiltersInput(filter);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("filtersError"), errors);
    }

    return await this.repository.findAll(filter, currentUserId);
  }

  private validateCreateItemInput(input: CreateItemInput): Map<string, string> {
    const errors: Map<string, string> = new Map();
    if (!input.invoice_id) {
      errors.set("invoice_id", this.translator.translate("inputInvoiceItemInvoiceIdError"));
    }
    if (!input.type || !(Object.values(InvoiceItemType) as string[]).includes(input.type)) {
      errors.set("type", this.translator.translate("inputInvoiceItemTypeError"));
    }
    if (!input.name) {
      errors.set("name", this.translator.translate("inputNameRequiredError", { length: "3" }));
    }
    if (Number.isNaN(input.price)) {
      errors.set("price", this.translator.translate("inputInvoiceItemPriceError"));
    }
    if (!input.quantity || input.quantity <= 0) {
      errors.set("quantity", this.translator.translate("inputInvoiceItemQuantityError"));
    }

    if (
      (input.type === InvoiceItemType.Tax || input.type === InvoiceItemType.Discount) &&
      input.quantity !== 1
    ) {
      errors.set("quantity", this.translator.translate("inputInvoiceItemSpecialQuantityError"));
    }

    return errors;
  }

  private validateUpdateItemInput(input: UpdateItemInput): Map<string, string> {
    const errors: Map<string, string> = new Map();
    if (!input.id) {
      errors.set("id", this.translator.translate("inputIdError"));
    }

    if (input.type && !(Object.values(InvoiceItemType) as string[]).includes(input.type)) {
      errors.set("type", this.translator.translate("inputInvoiceItemTypeError"));
    }

    if (input.price && Number.isNaN(input.price)) {
      errors.set("price", this.translator.translate("inputInvoiceItemPriceError"));
    }

    if (input.quantity && input.quantity <= 0) {
      errors.set("quantity", this.translator.translate("inputInvoiceItemQuantityError"));
    }

    return errors;
  }
}
