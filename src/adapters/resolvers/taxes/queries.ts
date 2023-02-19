import { TaxesFilterInput } from "../../../usecases/taxes/interfaces";
import { GraphQLContext } from "../../../utilities/context";
import { ConnectionArgs, generateConnection, mapGenericFilters } from "../../../utilities/relay";
import { mapTaxCalcType } from "./utils";

type TaxGraphQLFilterInput = {
  userId?: string;
  name?: string;
  rate?: number;
  calcType?: string;
};

function mapGraphQLFilterInput(args: ConnectionArgs<TaxGraphQLFilterInput>): TaxesFilterInput {
  const input: TaxesFilterInput = mapGenericFilters(args);

  input.name = args.filter.name;
  input.rate = args.filter.rate;
  input.calcType = args.filter.calcType ? mapTaxCalcType(args.filter.calcType) : undefined;
  input.userId = args.filter.userId;

  return input;
}

export const taxQueryResolvers = {
  tax: async (_: any, { id }: { id: string }, { useCases }: GraphQLContext) => {
    const useCase = useCases.taxes;

    return await useCase.findByID(id);
  },
  taxes: async (
    _: any,
    args: ConnectionArgs<TaxGraphQLFilterInput>,
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.taxes;

    const taxes = await useCase.findAll(mapGraphQLFilterInput(args));

    return generateConnection(
      "Tax",
      taxes,
      {
        endCursor: taxes.length > 0 ? taxes[taxes.length - 1].created_at : undefined,
        startCursor: taxes.length > 0 ? taxes && taxes[0].created_at : undefined,
        hasNextPage: taxes.length === args.first,
        hasPreviousPage: args.after !== undefined,
      },
      taxes.length,
    );
  },
};
