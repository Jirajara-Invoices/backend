import { GraphQLContext } from "../../../utilities/context";
import { CreateUserInput, UpdateUserInput } from "../../../usecases/users/interfaces";
import { mapGraphQLError, ValidationError } from "../../../entities/errors";

export const userMutationResolvers = {
  createUser: async (
    _: any,
    { input }: { input: CreateUserInput },
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.users;

    try {
      return await useCase.create(input);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw mapGraphQLError(error);
      }

      throw error;
    }
  },
  updateUser: async (
    _: any,
    { input }: { input: UpdateUserInput },
    { useCases }: GraphQLContext,
  ) => {
    const useCase = useCases.users;

    try {
      return await useCase.update(input);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw mapGraphQLError(error);
      }

      throw error;
    }
  },
  deleteUser: async (_: any, { id }: { id: string }, { useCases }: GraphQLContext) => {
    const useCase = useCases.users;

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

  login: async (
    _: any,
    { email, password }: { email: string; password: string },
    { logger, useCases, req }: GraphQLContext,
  ) => {
    const useCase = useCases.users;

    try {
      const user = await useCase.checkCredentials(email, password);
      req.session.destroy((err) => logger.error(err));
      req.sessionStore.generate(req);

      req.session.userId = user.id;

      return user;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw mapGraphQLError(error);
      }

      throw error;
    }
  },
  logout: async (_: any, __: any, { logger, req }: GraphQLContext) => {
    req.session.destroy((err) => logger.error(err));
    req.sessionStore.generate(req);

    return true;
  },
};
