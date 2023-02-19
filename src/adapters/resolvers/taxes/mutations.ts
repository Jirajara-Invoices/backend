import { mapGraphQLError, ValidationError } from "../../../entities/errors";
import { CreateTaxInput, UpdateTaxInput } from "../../../usecases/taxes/interfaces";
import { GraphQLContext } from "../../../utilities/context";
import { mapTaxCalcType } from "./utils";

type GraphQLCreateInput = {
  name: string;
  rate: number;
  calcType: string;
};

type GraphQLUpdateInput = { id: string } & Partial<GraphQLCreateInput>;

function mapGraphQLCreateInput(input: GraphQLCreateInput): CreateTaxInput {
  return {
    ...input,
    calc_type: mapTaxCalcType(input.calcType),
  };
}

function mapGraphQLUpdateInput(input: GraphQLUpdateInput): UpdateTaxInput {
  return {
    ...input,
    calc_type: input.calcType ? mapTaxCalcType(input.calcType) : undefined,
  };
}

export const taxMutationResolvers = {
  createTax: async (
    _: any,
    { input }: { input: GraphQLCreateInput },
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.taxes;
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
  updateTax: async (
    _: any,
    { input }: { input: GraphQLUpdateInput },
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.taxes;
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
  deleteTax: async (_: any, { id }: { id: string }, { useCases }: GraphQLContext) => {
    const useCase = useCases.taxes;

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
