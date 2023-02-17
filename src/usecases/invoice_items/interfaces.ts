import { InvoiceItem, InvoiceItemType } from "../../entities/models/invoice_items";
import { Pagination } from "../../entities/types/pagination";
import { BaseUseCase } from "../common/base";

export interface CreateItemInput {
  invoice_id: string;
  tax_id?: string;
  type: InvoiceItemType;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface UpdateItemInput extends Omit<Partial<CreateItemInput>, "invoice_id"> {
  id: string;
}

export interface ItemsFilterInput extends Pagination {
  invoiceId?: string;
  taxId?: string;
  type?: InvoiceItemType;
  name?: string;
}

export interface InvoiceItemUseCasePort extends BaseUseCase {
  create(input: CreateItemInput): Promise<InvoiceItem>;
  update(input: UpdateItemInput): Promise<InvoiceItem>;
  delete(id: string): Promise<void>;
  findByID(id: string): Promise<InvoiceItem>;
  findAll(filter: ItemsFilterInput): Promise<InvoiceItem[]>;
}

export interface InvoiceItemRepositoryPort {
  create(input: CreateItemInput, user_id: string): Promise<InvoiceItem>;
  update(input: UpdateItemInput, user_id: string): Promise<InvoiceItem>;
  delete(id: string, user_id: string): Promise<void>;
  findByID(id: string, user_id: string | null): Promise<InvoiceItem>;
  findAll(filter: ItemsFilterInput, user_id: string | null): Promise<InvoiceItem[]>;
}
