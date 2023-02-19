import { InvoiceFilterInput } from "../../../usecases/invoices/interfaces";
import { GraphQLContext } from "../../../utilities/context";
import { ConnectionArgs, generateConnection, mapGenericFilters } from "../../../utilities/relay";
import { mapInvoiceStatus, mapInvoiceType } from "./utils";

type InvoiceGraphQLFilterInput = {
  userId?: string;
  type?: string;
  status?: string;
  number?: string;
  date?: Date;
  dueDate?: Date;
  addressId?: string;
  clientAddressId?: string;
};

function mapGraphQLFilterInput(
  args: ConnectionArgs<InvoiceGraphQLFilterInput>,
): InvoiceFilterInput {
  const input: InvoiceFilterInput = mapGenericFilters(args);
  input.userId = args.filter.userId;
  input.type = args.filter.type ? mapInvoiceType(args.filter.type) : undefined;
  input.status = args.filter.status ? mapInvoiceStatus(args.filter.status) : undefined;
  input.number = args.filter.number;
  input.date = args.filter.date;
  input.dueDate = args.filter.dueDate;
  input.addressId = args.filter.addressId;
  input.clientAddressId = args.filter.clientAddressId;

  return input;
}

export const invoiceQueryResolvers = {
  invoice: async (_: any, { id }: { id: string }, { useCases }: GraphQLContext) => {
    const useCase = useCases.invoices;

    return await useCase.findByID(id);
  },
  invoices: async (
    _: any,
    args: ConnectionArgs<InvoiceGraphQLFilterInput>,
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.invoices;

    const invoices = await useCase.findAll(mapGraphQLFilterInput(args));

    return generateConnection(
      "Invoice",
      invoices,
      {
        endCursor: invoices.length > 0 ? invoices[invoices.length - 1].created_at : undefined,
        startCursor: invoices.length > 0 ? invoices && invoices[0].created_at : undefined,
        hasNextPage: invoices.length === args.first,
        hasPreviousPage: args.after !== undefined,
      },
      invoices.length,
    );
  },
};
