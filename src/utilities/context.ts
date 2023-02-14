import { ContextFunction } from "@apollo/server/src/externalTypes";
import { ExpressContextFunctionArgument } from "@apollo/server/src/express4";
import { Session, SessionData } from "express-session";
import { DatabasePool } from "slonik";

import { UserUseCasePort } from "../usecases/users/interfaces";
import { UserUseCase } from "../usecases/users/usecase";
import { UserRepository } from "../adapters/repositories/users/users";
import { User } from "../entities/models/users";
import { LoggerAdapter } from "../adapters/common/logger";
import { LoggerUseCasePort } from "../usecases/common/interfaces";
import { AddressUseCasePort } from "../usecases/addresses/interfaces";
import { AddressUseCase } from "../usecases/addresses/usecase";
import { AddressRepository } from "../adapters/repositories/addresses/addresses";
import { logger } from "./winston";

export type SessionContext = Session & Partial<SessionData>;

export interface GraphQLContext {
  logger: LoggerUseCasePort;
  useCases: {
    users: UserUseCasePort;
    addresses: AddressUseCasePort;
  };
  req: Express.Request;
  auth: {
    user: User | null;
  };
}

function instantiateUserUseCase(dbPool: DatabasePool, logger: LoggerUseCasePort): UserUseCasePort {
  const userRepository = new UserRepository(dbPool);

  return new UserUseCase(userRepository, logger);
}

function instantiateAddressUseCase(
  dbPool: DatabasePool,
  logger: LoggerUseCasePort,
  currentUser: User | null,
): AddressUseCasePort {
  const addressRepository = new AddressRepository(dbPool);

  return new AddressUseCase(addressRepository, logger, currentUser);
}

async function getAuthUser(
  session: SessionContext,
  useCase: UserUseCasePort,
  log: LoggerUseCasePort,
): Promise<User | null> {
  const userId = session.userId;
  if (userId) {
    try {
      return await useCase.findByID(userId, true);
    } catch (error) {
      log.error("Failed to get user from session");
    }
  }

  return null;
}

export const createContextFactory = (
  dbPool: DatabasePool,
): ContextFunction<[ExpressContextFunctionArgument], GraphQLContext> => {
  return async ({ req }) => {
    const log = new LoggerAdapter(logger.child({ session: req.session.id }));

    const userUseCase = instantiateUserUseCase(dbPool, log);

    const user = await getAuthUser(req.session, userUseCase, log);
    userUseCase.setCurrentUser(user);

    const addressUseCase = instantiateAddressUseCase(dbPool, log, user);

    return {
      logger: log,
      useCases: {
        users: userUseCase,
        addresses: addressUseCase,
      },
      req,
      auth: {
        user: user,
      },
    };
  };
};
