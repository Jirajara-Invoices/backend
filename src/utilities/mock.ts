import { Mock } from "moq.ts";
import { createMockPool, createMockQueryResult, QueryResultRow } from "slonik";

import { User } from "../entities/models/users";
import { GraphQLContext, SessionContext } from "./context";
import { UserUseCase } from "../usecases/users/usecase";

export function makePool(queryResults: QueryResultRow[]) {
  return createMockPool({
    query: async () => {
      return createMockQueryResult(queryResults);
    },
  });
}

export type MockContext = (user: User | null) => GraphQLContext;

export function createMockContextFactory(): MockContext {
  const session = new Mock<SessionContext>().object();
  const mockUserUseCase = new Mock<UserUseCase>()
    .setup((x) => x.findByID)
    .returns(() => Promise.resolve({} as User))
    .object();

  return (user): GraphQLContext => ({
    useCases: {
      users: mockUserUseCase,
    },
    auth: {
      user,
      session,
    },
  });
}
