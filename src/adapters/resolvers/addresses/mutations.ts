import { mapGraphQLError, ValidationError } from "../../../entities/errors";
import { CreateAddressInput, UpdateAddressInput } from "../../../usecases/addresses/interfaces";
import { GraphQLContext } from "../../../utilities/context";
import { AddressType } from "../../../entities/models/addresses";

type GraphQLCreateInput = {
  type: string;
  name: string;
  tax_id?: string;
  email?: string;
  street?: string;
  number?: string;
  comment?: string;
  zipcode?: string;
  city?: string;
  state?: string;
  country: string;
};

type GraphQLUpdateInput = {
  id: string;
} & Partial<GraphQLCreateInput>;

function mapAddressType(type: string): AddressType {
  switch (type.toLowerCase()) {
    case "personal":
      return AddressType.Personal;
    case "clients":
      return AddressType.Clients;
    default:
      throw new Error(`Invalid address type: ${type}`);
  }
}

function mapGraphQLCreateInput(input: GraphQLCreateInput): CreateAddressInput {
  return {
    ...input,
    type: mapAddressType(input.type),
  };
}

function mapGraphQLUpdateInput(input: GraphQLUpdateInput): UpdateAddressInput {
  return {
    ...input,
    type: input.type ? mapAddressType(input.type) : undefined,
  };
}

export const addressMutationResolvers = {
  createAddress: async (
    _: any,
    { input }: { input: GraphQLCreateInput },
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.addresses;
    const useCaseInput = mapGraphQLCreateInput(input);

    try {
      return await useCase.create(useCaseInput);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw mapGraphQLError(error);
      }

      throw error;
    }
  },
  updateAddress: async (
    _: any,
    { input }: { input: GraphQLUpdateInput },
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.addresses;
    const useCaseInput = mapGraphQLUpdateInput(input);

    try {
      return await useCase.update(useCaseInput);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw mapGraphQLError(error);
      }

      throw error;
    }
  },
  deleteAddress: async (_: any, { id }: { id: string }, { useCases }: GraphQLContext) => {
    const useCase = useCases.addresses;

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
