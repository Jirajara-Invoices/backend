import { mapGraphQLError, ValidationError } from "../../../entities/errors";
import { CreateInvoiceInput, UpdateInvoiceInput } from "../../../usecases/invoices/interfaces";
import { GraphQLContext } from "../../../utilities/context";
import { mapInvoiceStatus, mapInvoiceType } from "./utils";

type GraphQLCreateInput = {
  addressId: string;
  clientAddressId: string;
  type: string;
  status: string;
  number: string;
  date: Date;
  dueDate: Date;
  terms: string;
};

type GraphQLUpdateInput = {
  id: string;
} & Partial<GraphQLCreateInput>;

function mapCreateInput(input: GraphQLCreateInput): CreateInvoiceInput {
  return {
    address_id: input.addressId,
    client_address_id: input.clientAddressId,
    type: mapInvoiceType(input.type),
    status: mapInvoiceStatus(input.status),
    number: input.number,
    date: input.date,
    due_date: input.dueDate,
    terms: input.terms,
  };
}

function mapUpdateInput(input: GraphQLUpdateInput): UpdateInvoiceInput {
  return {
    id: input.id,
    address_id: input.addressId,
    client_address_id: input.clientAddressId,
    type: input.type ? mapInvoiceType(input.type) : undefined,
    status: input.status ? mapInvoiceStatus(input.status) : undefined,
    number: input.number,
    date: input.date,
    due_date: input.dueDate,
    terms: input.terms,
  };
}

export const invoiceMutationResolvers = {
  createInvoice: async (
    _: any,
    { input }: { input: GraphQLCreateInput },
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.invoices;

    try {
      return await useCase.create(mapCreateInput(input));
    } catch (error) {
      if (error instanceof ValidationError) {
        throw mapGraphQLError(error);
      }

      throw error;
    }
  },
  updateInvoice: async (
    _: any,
    { input }: { input: GraphQLUpdateInput },
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.invoices;

    try {
      return await useCase.update(mapUpdateInput(input));
    } catch (error) {
      if (error instanceof ValidationError) {
        throw mapGraphQLError(error);
      }

      throw error;
    }
  },
  deleteInvoice: async (_: any, { id }: { id: string }, { useCases }: GraphQLContext) => {
    const useCase = useCases.invoices;

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
