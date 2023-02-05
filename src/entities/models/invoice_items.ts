import { Tax } from "./taxes";
import { Invoice } from "./invoice";

export enum InvoiceItemType {
  Product = "product",
  Service = "service",
  Discount = "discount",
  Shipping = "shipping",
  Tax = "tax",
}

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  invoice?: Invoice;
  tax_id: string;
  tax?: Tax;
  type: InvoiceItemType;
  name: string;
  description: string;
  quantity: number;
  price: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
};
