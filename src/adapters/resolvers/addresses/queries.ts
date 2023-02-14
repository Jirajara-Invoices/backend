import { GraphQLContext } from "../../../utilities/context";
import { generateConnection, mapGenericFilters } from "../../../utilities/relay";
import { AddressFilterInput } from "../../../usecases/addresses/interfaces";
import { AddressType } from "../../../entities/models/addresses";

function mapCursorArgsToFindAddressInput(args: {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  filter: { userId?: string; name?: string; email?: string; taxId?: string; type?: string };
}): AddressFilterInput {
  const input: AddressFilterInput = mapGenericFilters(args);

  input.name = args.filter.name;
  input.email = args.filter.email;
  input.taxId = args.filter.taxId;
  input.userId = args.filter.userId;
  input.type = !args.filter.type
    ? undefined
    : AddressType[args.filter.type.toLowerCase() as keyof typeof AddressType];

  return input;
}

export const addressQueryResolvers = {
  address: async (_: any, { id }: { id: string }, { useCases }: GraphQLContext) => {
    const useCase = useCases.addresses;

    return await useCase.findByID(id);
  },
  addresses: async (
    _: any,
    args: {
      first?: number;
      after?: string;
      last?: number;
      before?: string;
      filter: { userId?: string; name?: string; email?: string; taxId?: string; type?: string };
    },
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
