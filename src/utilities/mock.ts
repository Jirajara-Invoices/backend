import { It, Mock } from "moq.ts";
import { createMockPool, createMockQueryResult, QueryResultRow } from "slonik";

import { User } from "../entities/models/users";
import { LoggerUseCasePort } from "../usecases/common/interfaces";
import { UserUseCase } from "../usecases/users/usecase";
import { GraphQLContext, SessionContext } from "./context";
import { Request } from "express";

export function makePool(queryResults: QueryResultRow[]) {
  return createMockPool({
    query: async () => {
      return createMockQueryResult(queryResults);
    },
  });
}

export type MockContext = (user: User | null) => GraphQLContext;

type mockContextInput = Partial<GraphQLContext> | null;

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

  return (user): GraphQLContext => ({
    logger: logger,
    useCases: {
      users: mockUserUseCase,
    },
    req: input?.req || req,
    auth: {
      user,
    },
  });
}
