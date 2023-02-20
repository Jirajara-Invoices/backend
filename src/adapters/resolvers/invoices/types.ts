import { Invoice } from "../../../entities/models/invoice";
import { GraphQLContext } from "../../../utilities/context";

export const invoiceTypeResolvers = {
  id: (invoice: Invoice) => invoice.id,
  type: (invoice: Invoice) => invoice.type.toUpperCase(),
  status: (invoice: Invoice) => invoice.status.toUpperCase(),
  number: (invoice: Invoice) => invoice.number,
  date: (invoice: Invoice) => invoice.date,
  dueDate: (invoice: Invoice) => invoice.due_date,
  terms: (invoice: Invoice) => invoice.terms,
  user: async (invoice: Invoice, _: unknown, { useCases }: GraphQLContext) => {
    const useCase = useCases.users;

    return await useCase.findByID(invoice.user_id, true);
  },
  address: async (invoice: Invoice, _: unknown, { useCases }: GraphQLContext) => {
    const useCase = useCases.addresses;

    return await useCase.findByID(invoice.address_id);
  },
  clientAddress: async (invoice: Invoice, _: unknown, { useCases }: GraphQLContext) => {
    const useCase = useCases.addresses;

    return await useCase.findByID(invoice.address_id);
  },
  items: async (invoice: Invoice, _: unknown, { useCases }: GraphQLContext) => {
    const useCase = useCases.invoices;

    return await useCase.getInvoiceItems(invoice.id);
  },
  taxes: async (invoice: Invoice, _: unknown, { useCases }: GraphQLContext) => {
    const useCase = useCases.invoices;

    return await useCase.getInvoiceTaxes(invoice.id);
  },
  taxAmount: async (invoice: Invoice, _: unknown, { useCases }: GraphQLContext) => {
    const useCase = useCases.invoices;

    return await useCase.getTaxAmount(invoice.id);
  },
  discount: async (invoice: Invoice, _: unknown, { useCases }: GraphQLContext) => {
    const useCase = useCases.invoices;

    return await useCase.getDiscount(invoice.id);
  },
  subTotal: async (invoice: Invoice, _: unknown, { useCases }: GraphQLContext) => {
    const useCase = useCases.invoices;

    return await useCase.getSubtotal(invoice.id);
  },
  taxableAmount: async (invoice: Invoice, _: unknown, { useCases }: GraphQLContext) => {
    const useCase = useCases.invoices;

    return await useCase.getTaxableAmount(invoice.id);
  },
  nonTaxableAmount: async (invoice: Invoice, _: unknown, { useCases }: GraphQLContext) => {
    const useCase = useCases.invoices;

    return await useCase.getNonTaxableAmount(invoice.id);
  },
  total: async (invoice: Invoice, _: unknown, { useCases }: GraphQLContext) => {
    const useCase = useCases.invoices;

    return await useCase.getTotal(invoice.id);
  },
  createdAt: (invoice: Invoice) => invoice.created_at,
  updatedAt: (invoice: Invoice) => invoice.updated_at,
  deletedAt: (invoice: Invoice) => invoice.deleted_at,
};
