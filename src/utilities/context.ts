import { ApolloFastifyContextFunction } from "@as-integrations/fastify";
import { DatabasePool } from "slonik";

import { UserUseCasePort } from "../usecases/users/interfaces";
import { UserUseCase } from "../usecases/users/usecase";
import { UserRepository } from "../adapters/repositories/users/users";

export interface GraphQLContext {
  useCases: {
    users: UserUseCasePort;
  };
}

function instantiateUserUseCase(dbPool: DatabasePool): UserUseCasePort {
  const userRepository = new UserRepository(dbPool);

  return new UserUseCase(userRepository);
}

export const createContextFactory = (
  dbPool: DatabasePool,
): ApolloFastifyContextFunction<GraphQLContext> => {
  return async () => {
    return {
      useCases: {
        users: instantiateUserUseCase(dbPool),
      },
    };
  };
};
