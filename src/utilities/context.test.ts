import { Request, Response } from "express";
import { Mock } from "moq.ts";

import { createContextFactory, SessionContext } from "./context";
import { makePool } from "./mock";

describe("context", () => {
  it("should be able to create a context", async () => {
    const pool = makePool([]);
    const session = new Mock<SessionContext>()
      .setup((instance) => instance.userId)
      .returns("user-id")
      .object();
    const req = new Mock<Request>()
      .setup((instance) => instance.session)
      .returns(session)
      .object();
    const res = new Mock<Response>()
      .setup((instance) => instance)
      .returns({} as Response)
      .object();
    const contextFactory = createContextFactory(pool);
    const context = await contextFactory({ req, res });

    expect(context).toBeDefined();
    expect(context.useCases).toBeDefined();
    expect(context.useCases.users).toBeDefined();
    expect(context.auth).toBeDefined();
    expect(context.auth.user).toBeNull();
    expect(context.auth.session).toBe(session);
  });
});
