import { GraphQLContext } from "../../../utilities/context";
import { ConnectionArgs, generateConnection, mapGenericFilters } from "../../../utilities/relay";
import { AddressFilterInput } from "../../../usecases/addresses/interfaces";
import { mapAddressType } from "./utils";

type AddressGraphQLFilterInput = {
  userId?: string;
  name?: string;
  email?: string;
  taxId?: string;
  type?: string;
};

function mapCursorArgsToFindAddressInput(
  args: ConnectionArgs<AddressGraphQLFilterInput>,
): AddressFilterInput {
  const input: AddressFilterInput = mapGenericFilters(args);

  input.name = args.filter.name;
  input.email = args.filter.email;
  input.taxId = args.filter.taxId;
  input.userId = args.filter.userId;
  input.type = args.filter.type ? mapAddressType(args.filter.type) : undefined;

  return input;
}

export const addressQueryResolvers = {
  address: async (_: any, { id }: { id: string }, { useCases }: GraphQLContext) => {
    const useCase = useCases.addresses;

    return await useCase.findByID(id);
  },
  addresses: async (
    _: any,
    args: ConnectionArgs<AddressGraphQLFilterInput>,
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.addresses;
    const input = mapCursorArgsToFindAddressInput(args);

    const addresses = await useCase.findAll(input);

    return generateConnection(
      "Address",
      addresses,
      {
        endCursor: addresses.length > 0 ? addresses[addresses.length - 1].created_at : undefined,
        startCursor: addresses.length > 0 ? addresses && addresses[0].created_at : undefined,
        hasNextPage: addresses.length === input.limit,
        hasPreviousPage: input.cursor !== undefined,
      },
      addresses.length,
    );
  },
};
