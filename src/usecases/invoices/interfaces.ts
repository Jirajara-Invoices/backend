import { Pagination } from "../../entities/types/pagination";
import { Invoice, InvoiceStatus, InvoiceType } from "../../entities/models/invoice";
import { BaseUseCase } from "../common/base";
import { Tax } from "../../entities/models/taxes";
import { InvoiceItem } from "../../entities/models/invoice_items";

export interface CreateInvoiceInput {
  address_id: string;
  client_address_id: string;
  type: InvoiceType;
  number: string;
  date: Date;
  due_date: Date;
  status: InvoiceStatus;
  terms: string;
}

export interface UpdateInvoiceInput extends Partial<CreateInvoiceInput> {
  id: string;
}

export interface InvoiceFilterInput extends Pagination {
  userId?: string;
  type?: InvoiceType;
  status?: InvoiceStatus;
  number?: string;
  date?: Date;
  dueDate?: Date;
  addressId?: string;
  clientAddressId?: string;
}

export interface InvoiceUseCasePort extends BaseUseCase {
  create(input: CreateInvoiceInput): Promise<Invoice>;
  update(input: UpdateInvoiceInput): Promise<Invoice>;
  delete(id: string): Promise<void>;
  findByID(id: string): Promise<Invoice>;
  findAll(filter: InvoiceFilterInput): Promise<Invoice[]>;
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  getInvoiceTaxes(invoiceId: string): Promise<Tax[]>;
  getTaxAmount(invoiceId: string): Promise<number>;
  getTaxableAmount(invoiceId: string): Promise<number>;
  getNonTaxableAmount(invoiceId: string): Promise<number>;
  getSubtotal(invoiceId: string): Promise<number>;
  getDiscount(invoiceId: string): Promise<number>;
  getTotal(invoiceId: string): Promise<number>;
}

export interface InvoiceRepositoryPort {
  create(input: CreateInvoiceInput, userId: string): Promise<Invoice>;
  update(input: UpdateInvoiceInput, userId: string): Promise<Invoice>;
  delete(id: string): Promise<void>;
  findByID(id: string): Promise<Invoice>;
  findAll(filter: InvoiceFilterInput): Promise<Invoice[]>;
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  getInvoiceTaxes(invoiceId: string): Promise<Tax[]>;
  getTaxAmount(invoiceId: string): Promise<number>;
  getTaxableAmount(invoiceId: string): Promise<number>;
  getNonTaxableAmount(invoiceId: string): Promise<number>;
  getSubtotal(invoiceId: string): Promise<number>;
  getDiscount(invoiceId: string): Promise<number>;
  getTotal(invoiceId: string): Promise<number>;
}
