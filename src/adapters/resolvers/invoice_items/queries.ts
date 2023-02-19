import { ItemsFilterInput } from "../../../usecases/invoice_items/interfaces";
import { GraphQLContext } from "../../../utilities/context";
import { ConnectionArgs, generateConnection, mapGenericFilters } from "../../../utilities/relay";
import { mapInvoiceItemType } from "./utils";

type InvoiceItemGraphQLFilterInput = {
  invoiceId?: string;
  taxId?: string;
  name?: string;
  type?: string;
};

function mapGraphQLFilterInput(
  args: ConnectionArgs<InvoiceItemGraphQLFilterInput>,
): ItemsFilterInput {
  const input: ItemsFilterInput = mapGenericFilters(args);
  input.invoiceId = args.filter.invoiceId;
  input.taxId = args.filter.taxId;
  input.name = args.filter.name;
  input.type = args.filter.type ? mapInvoiceItemType(args.filter.type) : undefined;

  return input;
}

export const invoiceItemQueryResolvers = {
  invoiceItem: async (_: any, { id }: { id: string }, { useCases }: GraphQLContext) => {
    const useCase = useCases.invoiceItems;

    return await useCase.findByID(id);
  },
  invoiceItems: async (
    _: any,
    args: ConnectionArgs<InvoiceItemGraphQLFilterInput>,
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.invoiceItems;

    const invoiceItems = await useCase.findAll(mapGraphQLFilterInput(args));

    return generateConnection(
      "InvoiceItem",
      invoiceItems,
      {
        endCursor:
          invoiceItems.length > 0 ? invoiceItems[invoiceItems.length - 1].created_at : undefined,
        startCursor:
          invoiceItems.length > 0 ? invoiceItems && invoiceItems[0].created_at : undefined,
        hasNextPage: invoiceItems.length === args.first,
        hasPreviousPage: args.after !== undefined,
      },
      invoiceItems.length,
    );
  },
};
