import { Request, Response } from "express";
import { It, Mock } from "moq.ts";

import { createContextFactory, SessionContext } from "./context";
import { makePool } from "./mock";
import Redis from "ioredis";

describe("context", () => {
  it("should be able to create a context", async () => {
    const pool = makePool([]);
    const session = new Mock<SessionContext>()
      .setup((instance) => instance.userId)
      .returns("user-id")
      .object();
    const sessionStore = new Mock<Express.SessionStore>().object();
    const req = new Mock<Request>()
      .setup((instance) => instance.session)
      .returns(session)
      .setup((instance) => instance.sessionStore)
      .returns(sessionStore)
      .object();
    const res = new Mock<Response>()
      .setup((instance) => instance)
      .returns({} as Response)
      .object();
    const redis = new Mock<Redis>()
      .setup((x) => x.hgetall(It.IsAny()))
      .returns(Promise.resolve({} as any))
      .setup((x) => x.hset(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(1))
      .setup((x) => x.hdel(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(1))
      .object();
    const contextFactory = createContextFactory(pool, redis);
    const context = await contextFactory({ req, res });

    expect(context).toBeDefined();
    expect(context.logger).toBeDefined();
    expect(context.req.sessionStore).toBeDefined();
    expect(context.useCases).toBeDefined();
    expect(context.useCases.users).toBeDefined();
    expect(context.auth).toBeDefined();
    expect(context.auth.user).toBeNull();
    expect(context.req.session).toBe(session);
  });
});
