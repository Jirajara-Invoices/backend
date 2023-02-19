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
import { TaxesUseCasePort } from "../usecases/taxes/interfaces";
import { TaxRepository } from "../adapters/repositories/taxes/taxes";
import { TaxUseCase } from "../usecases/taxes/usecase";
import { InvoiceRepository } from "../adapters/repositories/invoices/invoices";
import { InvoiceUseCasePort } from "../usecases/invoices/interfaces";
import { InvoiceUseCase } from "../usecases/invoices/usecase";
import { InvoiceItemRepository } from "../adapters/repositories/invoice_items/invoice_items";
import { InvoiceItemUseCase } from "../usecases/invoice_items/usecase";
import { InvoiceItemUseCasePort } from "../usecases/invoice_items/interfaces";

export type SessionContext = Session & Partial<SessionData>;

export interface GraphQLContext {
  logger: LoggerUseCasePort;
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

function instantiateTaxUseCase(
  dbPool: DatabasePool,
  logger: LoggerUseCasePort,
  currentUser: User | null,
): TaxesUseCasePort {
  const taxRepository = new TaxRepository(dbPool);

  return new TaxUseCase(taxRepository, logger, currentUser);
}

function instantiateInvoiceUseCase(
  dbPool: DatabasePool,
  logger: LoggerUseCasePort,
  currentUser: User | null,
): InvoiceUseCasePort {
  const invoiceRepository = new InvoiceRepository(dbPool);

  return new InvoiceUseCase(invoiceRepository, logger, currentUser);
}

function instantiateInvoiceItemsUseCase(
  dbPool: DatabasePool,
  logger: LoggerUseCasePort,
  currentUser: User | null,
): InvoiceItemUseCasePort {
  const invoiceItemsRepository = new InvoiceItemRepository(dbPool);

  return new InvoiceItemUseCase(invoiceItemsRepository, logger, currentUser);
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

    return {
      logger: log,
      useCases: {
        users: userUseCase,
        addresses: instantiateAddressUseCase(dbPool, log, user),
        taxes: instantiateTaxUseCase(dbPool, log, user),
        invoices: instantiateInvoiceUseCase(dbPool, log, user),
        invoiceItems: instantiateInvoiceItemsUseCase(dbPool, log, user),
      },
      req,
      auth: {
        user: user,
      },
    };
  };
};
