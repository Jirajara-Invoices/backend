import { Request } from "express";
import { It, Mock } from "moq.ts";
import { createMockPool, createMockQueryResult, QueryResultRow } from "slonik";

import { User } from "../entities/models/users";
import { Address } from "../entities/models/addresses";
import { LoggerUseCasePort } from "../usecases/common/interfaces";
import { UserUseCase } from "../usecases/users/usecase";
import { AddressUseCase } from "../usecases/addresses/usecase";
import { GraphQLContext, SessionContext } from "./context";

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

  return (user): GraphQLContext => ({
    logger: logger,
    useCases: {
      users: mockUserUseCase,
      addresses: mockAddressUseCase,
    },
    req: input?.req || req,
    auth: {
      user,
    },
  });
}
