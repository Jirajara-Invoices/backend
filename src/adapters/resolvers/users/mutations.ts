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
    { useCases, auth }: GraphQLContext,
  ) => {
    const useCase = useCases.users;

    try {
      const user = await useCase.checkCredentials(email, password);

      if (!auth.session.userId || auth.session.userId !== user.id) {
        auth.session.regenerate(function (err) {
          if (err) throw err;

          auth.session.userId = user.id;
          auth.session.save();
        });
      }

      return user;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw mapGraphQLError(error);
      }

      throw error;
    }
  },
  logout: async (_: any, __: any, { auth }: GraphQLContext) => {
    auth.session.userId = null;
    auth.session.save((error) => {
      if (error) {
        throw error;
      }

      auth.session.regenerate((error) => {
        if (error) {
          throw error;
        }
      });
    });

    return true;
  },
};
