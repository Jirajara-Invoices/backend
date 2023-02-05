import { User } from "./users";
import { Address } from "./addresses";

export enum InvoiceType {
  Invoice = "invoice",
  Quote = "quote",
  Receipt = "receipt",
  Estimate = "estimate",
  Proforma = "proforma",
  Debit = "debit",
  Credit = "credit",
  Bill = "bill",
  DeliveryNote = "delivery_note",
  PurchaseOrder = "purchase_order",
}

export enum InvoiceStatus {
  Draft = "draft",
  Sent = "sent",
  Paid = "paid",
  Canceled = "canceled",
  Overdue = "overdue",
}

export type Invoice = {
  id: string;
  user_id: string;
  user?: User;
  address_id: string;
  address?: Address;
  client_address_id: string;
  client_address?: Address;
  type: InvoiceType;
  number: string;
  date: Date;
  due_date: Date;
  status: InvoiceStatus;
  terms: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
};
