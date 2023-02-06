import { GraphQLContext } from "../../../utilities/context";
import { CreateUserInput, UpdateUserInput } from "../../../usecases/users/interfaces";

export const userMutationResolvers = {
  createUser: async (
    _: any,
    { input }: { input: CreateUserInput },
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.users;

    return await useCase.create(input);
  },
  updateUser: async (
    _: any,
    { input }: { input: UpdateUserInput },
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.users;

    return await useCase.update(input);
  },
  deleteUser: async (_: any, { id }: { id: string }, { useCases }: GraphQLContext) => {
    const useCase = useCases.users;

    return await useCase.delete(id);
  },
};
