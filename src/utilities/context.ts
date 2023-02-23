import Redis from "ioredis";
import { ContextFunction } from "@apollo/server/src/externalTypes";
import { ExpressContextFunctionArgument } from "@apollo/server/src/express4";
import { Session, SessionData } from "express-session";
import { DatabasePool } from "slonik";

import { UserUseCasePort } from "../usecases/users/interfaces";
import { UserUseCase } from "../usecases/users/usecase";
import { UserRepository } from "../adapters/repositories/users/users";
import { User, UserRole } from "../entities/models/users";
import { TranslatorAdapter } from "../adapters/common/i18n";
import { LoggerAdapter } from "../adapters/common/logger";
import { LoggerUseCasePort, TranslationUseCasePort } from "../usecases/common/interfaces";
import { AddressUseCasePort } from "../usecases/addresses/interfaces";
import { AddressUseCase } from "../usecases/addresses/usecase";
import { AddressRepository } from "../adapters/repositories/addresses/addresses";
import { TaxesUseCasePort } from "../usecases/taxes/interfaces";
import { TaxRepository } from "../adapters/repositories/taxes/taxes";
import { TaxUseCase } from "../usecases/taxes/usecase";
import { InvoiceRepository } from "../adapters/repositories/invoices/invoices";
import { InvoiceUseCasePort } from "../usecases/invoices/interfaces";
import { InvoiceUseCase } from "../usecases/invoices/usecase";
import { InvoiceItemRepository } from "../adapters/repositories/invoice_items/invoice_items";
import { InvoiceItemUseCase } from "../usecases/invoice_items/usecase";
import { InvoiceItemUseCasePort } from "../usecases/invoice_items/interfaces";
import { logger } from "./winston";

export type SessionContext = Session & Partial<SessionData>;

export interface GraphQLContext {
  logger: LoggerUseCasePort;
  redis: Redis;
  useCases: {
    users: UserUseCasePort;
    addresses: AddressUseCasePort;
    taxes: TaxesUseCasePort;
    invoices: InvoiceUseCasePort;
    invoiceItems: InvoiceItemUseCasePort;
  };
  req: Express.Request;
  auth: {
    user: User | null;
  };
}

function instantiateUserUseCase(
  dbPool: DatabasePool,
  logger: LoggerUseCasePort,
  translator: TranslationUseCasePort,
): UserUseCasePort {
  const userRepository = new UserRepository(dbPool, translator);

  return new UserUseCase(userRepository, logger, translator);
}

function instantiateAddressUseCase(
  dbPool: DatabasePool,
  logger: LoggerUseCasePort,
  translator: TranslationUseCasePort,
  currentUser: User | null,
): AddressUseCasePort {
  const addressRepository = new AddressRepository(dbPool, translator);

  return new AddressUseCase(addressRepository, logger, translator, currentUser);
}

function instantiateTaxUseCase(
  dbPool: DatabasePool,
  logger: LoggerUseCasePort,
  translator: TranslationUseCasePort,
  currentUser: User | null,
): TaxesUseCasePort {
  const taxRepository = new TaxRepository(dbPool, translator);

  return new TaxUseCase(taxRepository, logger, translator, currentUser);
}

function instantiateInvoiceUseCase(
  dbPool: DatabasePool,
  logger: LoggerUseCasePort,
  translator: TranslationUseCasePort,
  currentUser: User | null,
): InvoiceUseCasePort {
  const invoiceRepository = new InvoiceRepository(dbPool, translator);

  return new InvoiceUseCase(invoiceRepository, logger, translator, currentUser);
}

function instantiateInvoiceItemsUseCase(
  dbPool: DatabasePool,
  logger: LoggerUseCasePort,
  translator: TranslationUseCasePort,
  currentUser: User | null,
): InvoiceItemUseCasePort {
  const invoiceItemsRepository = new InvoiceItemRepository(dbPool);

  return new InvoiceItemUseCase(invoiceItemsRepository, logger, translator, currentUser);
}

export async function getAuthUser(
  session: SessionContext,
  useCase: UserUseCasePort,
  redis: Redis,
  log: LoggerUseCasePort,
): Promise<User | null> {
  const userId = session.userId;
  if (userId) {
    const userCached = await getUserCached(redis, userId);
    if (userCached) {
      return userCached;
    }
    try {
      const user = await useCase.findByID(userId, true);
      await setUserAuthCache(redis, user);

      return user;
    } catch (error) {
      log.error("Failed to get user from session");
    }
  }

  return null;
}

export async function getUserCached(redis: Redis, userId: string): Promise<User | null> {
  const userCached = await redis.hgetall(userId);
  if (userCached && userCached.id) {
    return {
      id: userCached.id,
      name: userCached.name,
      email: userCached.email,
      country: userCached.country,
      role: userCached.role === "admin" ? UserRole.Admin : UserRole.User,
      created_at: new Date(userCached.created_at),
      updated_at: new Date(userCached.updated_at),
    };
  }

  return null;
}

export async function setUserAuthCache(redis: Redis, user: User): Promise<void> {
  const userCached = {
    id: user.id,
    name: user.name,
    email: user.email,
    country: user.country,
    role: user.role,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
  };
  await redis.hset(user.id, userCached);
}

export const createContextFactory = (
  dbPool: DatabasePool,
  redis?: Redis,
): ContextFunction<[ExpressContextFunctionArgument], GraphQLContext> => {
  return async ({ req }) => {
    const log = new LoggerAdapter(logger.child({ session: req.session.id }));
    const translator = new TranslatorAdapter(req.i18n.t);

    const userUseCase = instantiateUserUseCase(dbPool, log, translator);
    const redisClient = redis ?? new Redis();

    const user = await getAuthUser(req.session, userUseCase, redisClient, log);
    userUseCase.setCurrentUser(user);

    return {
      logger: log,
      redis: redisClient,
      useCases: {
        users: userUseCase,
        addresses: instantiateAddressUseCase(dbPool, log, translator, user),
        taxes: instantiateTaxUseCase(dbPool, log, translator, user),
        invoices: instantiateInvoiceUseCase(dbPool, log, translator, user),
        invoiceItems: instantiateInvoiceItemsUseCase(dbPool, log, translator, user),
      },
      req,
      auth: {
        user: user,
      },
    };
  };
};
