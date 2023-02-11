import { readFileSync } from "fs";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { User, UserRole } from "../entities/models/users";
import { resolvers } from "../adapters/resolvers";
import { GraphQLContext } from "./context";
import assert from "assert";
import { createAuthDirective } from "./auth";
import { createMockContextFactory, MockContext } from "./mock";

const typeDefs = readFileSync("./schema.graphql", "utf8");

describe("auth directive", () => {
  let server: ApolloServer<GraphQLContext>;
  let contextFactory: MockContext;
  let user: User;

  beforeAll(async () => {
    server = new ApolloServer<GraphQLContext>({
      schema: createAuthDirective(
        makeExecutableSchema({
          typeDefs,
          resolvers,
        }),
        "auth",
      ),
    });
    contextFactory = createMockContextFactory();

    user = {
      id: "1",
      name: "John Doe",
      email: "example@example.com",
      country: "VE",
      role: UserRole.User,
      created_at: new Date(),
      updated_at: new Date(),
    };
  });

  it("should throw an error if the user is not authenticated", async () => {
    const result = await server.executeOperation(
      {
        query: `
          query {
            currentUser {
              id
            }
          }
        `,
        variables: {
          id: "1",
        },
      },
      {
        contextValue: contextFactory(null),
      },
    );
    const body = result.body;

    assert(body.kind === "single");

    expect(body.singleResult.errors).toHaveLength(1);
    expect(body.singleResult.errors?.[0].message).toEqual("Not authenticated");
  });

  it("should throw an error if the user is not authorized", async () => {
    const result = await server.executeOperation(
      {
        query: `
          query {
            user(id: "1") {
              id
            }
          }
        `,
        variables: {},
      },
      {
        contextValue: contextFactory(user),
      },
    );
    const body = result.body;

    assert(body.kind === "single");

    expect(body.singleResult.errors).toHaveLength(1);
    expect(body.singleResult.errors?.[0].message).toEqual("Not authorized");
  });

  it("should return a valid user", async () => {
    const result = await server.executeOperation(
      {
        query: `
          query {
            currentUser {
              id
            }
          }
        `,
        variables: {},
      },
      {
        contextValue: contextFactory(user),
      },
    );
    const body = result.body;

    assert(body.kind === "single");

    expect((body.singleResult.data?.currentUser as User).id).toBeTruthy();
  });
});
