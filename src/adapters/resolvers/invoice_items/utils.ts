import { InvoiceItemType } from "../../../entities/models/invoice_items";

export function mapInvoiceItemType(type: string): InvoiceItemType {
  switch (type.toLowerCase()) {
    case "service":
      return InvoiceItemType.Service;
    case "product":
      return InvoiceItemType.Product;
    case "discount":
      return InvoiceItemType.Discount;
    case "shipping":
      return InvoiceItemType.Shipping;
    case "tax":
      return InvoiceItemType.Tax;
    default:
      throw new Error(`Invalid invoice item type: ${type}`);
  }
}
