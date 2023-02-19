import { CreateItemInput, UpdateItemInput } from "../../../usecases/invoice_items/interfaces";
import { mapInvoiceItemType } from "./utils";
import { GraphQLContext } from "../../../utilities/context";
import { mapGraphQLError, ValidationError } from "../../../entities/errors";

type GraphQLCreateInput = {
  invoiceId: string;
  taxId: string;
  type: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
};

type GraphQLUpdateInput = {
  id: string;
} & Partial<GraphQLCreateInput>;

function mapCreateInput(input: GraphQLCreateInput): CreateItemInput {
  return {
    invoice_id: input.invoiceId,
    tax_id: input.taxId,
    type: mapInvoiceItemType(input.type),
    name: input.name,
    description: input.description,
    quantity: input.quantity,
    price: input.price,
  };
}

function mapUpdateInput(input: GraphQLUpdateInput): UpdateItemInput {
  return {
    id: input.id,
    tax_id: input.taxId,
    type: input.type ? mapInvoiceItemType(input.type) : undefined,
    name: input.name,
    description: input.description,
    quantity: input.quantity,
    price: input.price,
  };
}

export const invoiceItemMutationResolvers = {
  createInvoiceItem: async (
    _: any,
    { input }: { input: GraphQLCreateInput },
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.invoiceItems;

    try {
      return await useCase.create(mapCreateInput(input));
    } catch (error) {
      if (error instanceof ValidationError) {
        throw mapGraphQLError(error);
      }

      throw error;
    }
  },
  updateInvoiceItem: async (
    _: any,
    { input }: { input: GraphQLUpdateInput },
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.invoiceItems;

    try {
      return await useCase.update(mapUpdateInput(input));
    } catch (error) {
      if (error instanceof ValidationError) {
        throw mapGraphQLError(error);
      }

      throw error;
    }
  },
  deleteInvoiceItem: async (_: any, { id }: { id: string }, { useCases }: GraphQLContext) => {
    const useCase = useCases.invoiceItems;

    try {
      await useCase.delete(id);

      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw mapGraphQLError(error);
      }

      throw error;
    }
  },
};
