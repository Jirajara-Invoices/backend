import { InvoiceItem } from "../../../entities/models/invoice_items";
import { GraphQLContext } from "../../../utilities/context";
import { TaxCalcType } from "../../../entities/models/taxes";

export const invoiceItemTypeResolvers = {
  id: (invoiceItem: InvoiceItem) => invoiceItem.id,
  name: (invoiceItem: InvoiceItem) => invoiceItem.name,
  description: (invoiceItem: InvoiceItem) => invoiceItem.description,
  quantity: (invoiceItem: InvoiceItem) => invoiceItem.quantity,
  price: (invoiceItem: InvoiceItem) => invoiceItem.price,
  type: (invoiceItem: InvoiceItem) => invoiceItem.type.toUpperCase(),
  tax: async (invoiceItem: InvoiceItem, _: unknown, { useCases }: GraphQLContext) => {
    if (invoiceItem.tax_id) {
      const taxUseCase = useCases.taxes;
      return await taxUseCase.findByID(invoiceItem.tax_id);
    }
  },
  taxAmount: async (invoiceItem: InvoiceItem, _: unknown, { useCases }: GraphQLContext) => {
    let amount = 0;
    if (invoiceItem.tax_id) {
      const taxUseCase = useCases.taxes;
      const tax = await taxUseCase.findByID(invoiceItem.tax_id);

      if (tax.calc_type === TaxCalcType.Percentage) {
        amount = invoiceItem.price * invoiceItem.quantity * (tax.rate / 100);
      } else if (tax.calc_type === TaxCalcType.Fixed) {
        amount = tax.rate;
      }
    }

    return amount;
  },
  subTotal: (invoiceItem: InvoiceItem) => invoiceItem.price * invoiceItem.quantity,
  total: async (invoiceItem: InvoiceItem, _: unknown, { useCases }: GraphQLContext) => {
    let price = invoiceItem.price * invoiceItem.quantity;
    if (invoiceItem.tax_id) {
      const taxUseCase = useCases.taxes;
      const tax = await taxUseCase.findByID(invoiceItem.tax_id);

      if (tax.calc_type === TaxCalcType.Percentage) {
        price += price * (tax.rate / 100);
      } else if (tax.calc_type === TaxCalcType.Fixed) {
        price += tax.rate;
      }
    }

    return price;
  },
  invoice: async (invoiceItem: InvoiceItem, _: unknown, { useCases }: GraphQLContext) => {
    const useCase = useCases.invoices;

    return await useCase.findByID(invoiceItem.invoice_id);
  },
  createdAt: (invoiceItem: InvoiceItem) => invoiceItem.created_at,
  updatedAt: (invoiceItem: InvoiceItem) => invoiceItem.updated_at,
  deletedAt: (invoiceItem: InvoiceItem) => invoiceItem.deleted_at,
};
