import { ContextFunction } from "@apollo/server/src/externalTypes";
import { ExpressContextFunctionArgument } from "@apollo/server/src/express4";
import { Session, SessionData } from "express-session";
import { DatabasePool } from "slonik";
import { Logger } from "winston";

import { UserUseCasePort } from "../usecases/users/interfaces";
import { UserUseCase } from "../usecases/users/usecase";
import { UserRepository } from "../adapters/repositories/users/users";
import { User } from "../entities/models/users";
import { logger } from "./winston";

export type SessionContext = Session & Partial<SessionData>;

export interface GraphQLContext {
  useCases: {
    users: UserUseCasePort;
  };
  auth: {
    user: User | null;
    session: SessionContext;
  };
}

function instantiateUserUseCase(dbPool: DatabasePool, logger: Logger): UserUseCasePort {
  const userRepository = new UserRepository(dbPool);

  return new UserUseCase(userRepository, logger);
}

async function getAuthUser(
  session: SessionContext,
  useCase: UserUseCasePort,
  log: Logger,
): Promise<User | null> {
  const userId = session.userId;
  if (userId) {
    try {
      return await useCase.findByID(userId);
    } catch (error) {
      log.error("Failed to get user from session");
    }
  }

  return null;
}

export const createContextFactory = (
  dbPool: DatabasePool,
): ContextFunction<[ExpressContextFunctionArgument], GraphQLContext> => {
  return async ({ req: { session } }) => {
    const log = logger.child({ session: session.id });
    const userUseCase = instantiateUserUseCase(dbPool, log);
    const user = await getAuthUser(session, userUseCase, log);
    userUseCase.setCurrentUser(user);
    return {
      useCases: {
        users: userUseCase,
      },
      auth: {
        user: user,
        session: session,
      },
    };
  };
};
