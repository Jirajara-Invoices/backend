import { InvoiceStatus, InvoiceType } from "../../../entities/models/invoice";
import { GraphQLError } from "graphql/error";

export const mapInvoiceStatus = (status: string): InvoiceStatus => {
  switch (status.toLowerCase()) {
    case "draft":
      return InvoiceStatus.Draft;
    case "paid":
      return InvoiceStatus.Paid;
    case "sent":
      return InvoiceStatus.Sent;
    case "canceled":
      return InvoiceStatus.Canceled;
    case "overdue":
      return InvoiceStatus.Overdue;
    default:
      throw new GraphQLError(`Invalid invoice status provided: ${status}`);
  }
};

export const mapInvoiceType = (type: string): InvoiceType => {
  switch (type.toLowerCase()) {
    case "invoice":
      return InvoiceType.Invoice;
    case "estimate":
      return InvoiceType.Estimate;
    case "credit":
      return InvoiceType.Credit;
    case "debit":
      return InvoiceType.Debit;
    case "receipt":
      return InvoiceType.Receipt;
    case "proforma":
      return InvoiceType.Proforma;
    case "purchase_order":
      return InvoiceType.PurchaseOrder;
    case "delivery_note":
      return InvoiceType.DeliveryNote;
    case "quote":
      return InvoiceType.Quote;
    default:
      throw new GraphQLError(`Invalid invoice type provided: ${type}`);
  }
};
