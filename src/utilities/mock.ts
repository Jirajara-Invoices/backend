import { Request } from "express";
import { It, Mock } from "moq.ts";
import { createMockPool, createMockQueryResult, QueryResultRow } from "slonik";

import { User } from "../entities/models/users";
import { Address } from "../entities/models/addresses";
import { LoggerUseCasePort } from "../usecases/common/interfaces";
import { UserUseCase } from "../usecases/users/usecase";
import { AddressUseCase } from "../usecases/addresses/usecase";
import { GraphQLContext, SessionContext } from "./context";
import { TaxesUseCasePort } from "../usecases/taxes/interfaces";
import { InvoiceUseCasePort } from "../usecases/invoices/interfaces";
import { InvoiceItemUseCasePort } from "../usecases/invoice_items/interfaces";

export function makePool(queryResults: QueryResultRow[]) {
  return createMockPool({
    query: async () => {
      return createMockQueryResult(queryResults);
    },
  });
}

export type MockContext = (user: User | null) => GraphQLContext;

type mockContextInput = {
  logger?: LoggerUseCasePort;
  req?: Request;
  useCases?: {
    users?: UserUseCase;
    addresses?: AddressUseCase;
    taxes?: TaxesUseCasePort;
    invoices?: InvoiceUseCasePort;
    invoiceItems?: InvoiceItemUseCasePort;
  };
  user?: User | null;
} | null;

export function createMockContextFactory(input: mockContextInput): MockContext {
  const logger =
    input?.logger ||
    new Mock<LoggerUseCasePort>()
      .setup((x) => x.error(It.IsAny()))
      .returns({} as any)
      .object();
  const session = new Mock<SessionContext>()
    .setup((instance) => instance.userId)
    .returns("user-id")
    .object();
  const sessionStore = new Mock<Express.SessionStore>().object();
  const req =
    input?.req ||
    new Mock<Request>()
      .setup((instance) => instance.session)
      .returns(session)
      .setup((instance) => instance.sessionStore)
      .returns(sessionStore)
      .object();
  const mockUserUseCase =
    input?.useCases?.users ||
    new Mock<UserUseCase>()
      .setup((x) => x.findByID)
      .returns(() => Promise.resolve({} as User))
      .object();
  const mockAddressUseCase =
    input?.useCases?.addresses ||
    new Mock<AddressUseCase>()
      .setup((x) => x.findByID)
      .returns(() => Promise.resolve({} as Address))
      .object();
  const mockTaxUseCase =
    input?.useCases?.taxes ||
    new Mock<TaxesUseCasePort>()
      .setup((x) => x.findByID)
      .returns(() => Promise.resolve({} as any))
      .object();
  const mockInvoiceUseCase =
    input?.useCases?.invoices ||
    new Mock<InvoiceUseCasePort>()
      .setup((x) => x.findByID)
      .returns(() => Promise.resolve({} as any))
      .object();
  const mockInvoiceItemUseCase =
    input?.useCases?.invoiceItems ||
    new Mock<InvoiceItemUseCasePort>()
      .setup((x) => x.findByID)
      .returns(() => Promise.resolve({} as any))
      .object();

  return (user): GraphQLContext => ({
    logger: logger,
    useCases: {
      users: mockUserUseCase,
      addresses: mockAddressUseCase,
      taxes: mockTaxUseCase,
      invoices: mockInvoiceUseCase,
      invoiceItems: mockInvoiceItemUseCase,
    },
    req: input?.req || req,
    auth: {
      user,
    },
  });
}
