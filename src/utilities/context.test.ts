import { createContextFactory } from "./context";
import { makePool } from "./mock";
import { Mock } from "moq.ts";
import { FastifyReply, FastifyRequest } from "fastify";

describe("context", () => {
  it("should be able to create a context", async () => {
    const pool = makePool([]);
    const request = new Mock<FastifyRequest>()
      .setup((instance) => instance)
      .returns({} as FastifyRequest)
      .object();
    const reply = new Mock<FastifyReply>()
      .setup((instance) => instance)
      .returns({} as FastifyReply)
      .object();
    const context = await createContextFactory(pool)(request, reply);

    expect(context).toBeDefined();
  });
});
