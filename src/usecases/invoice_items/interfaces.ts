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
  create(input: CreateItemInput): Promise<InvoiceItem>;
  update(input: UpdateItemInput, userId: string): Promise<InvoiceItem>;
  delete(id: string, userId: string): Promise<void>;
  findByID(id: string, userId: string | null): Promise<InvoiceItem>;
  findAll(filter: ItemsFilterInput, userId: string | null): Promise<InvoiceItem[]>;
}
