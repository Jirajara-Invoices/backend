import { Pagination } from "../../entities/types/pagination";
import { Invoice, InvoiceStatus, InvoiceType } from "../../entities/models/invoice";
import { BaseUseCase } from "../common/base";

export interface CreateInvoiceInput {
  user_id: string;
  address_id: string;
  client_address_id: string;
  type: InvoiceType;
  number: string;
  date: Date;
  due_date: Date;
  status: InvoiceStatus;
  terms: string;
}

export interface UpdateInvoiceInput extends Omit<Partial<CreateInvoiceInput>, "user_id"> {
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
}

export interface InvoiceRepositoryPort {
  create(input: CreateInvoiceInput): Promise<Invoice>;
  update(input: UpdateInvoiceInput): Promise<Invoice>;
  delete(id: string): Promise<void>;
  findByID(id: string): Promise<Invoice>;
  findAll(filter: InvoiceFilterInput): Promise<Invoice[]>;
}
