import assert from "assert";
import { readFileSync } from "fs";
import { ApolloServer } from "@apollo/server";
import { addMocksToSchema } from "@graphql-tools/mock";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { userQueryResolvers } from "./queries";
import { userMutationResolvers } from "./mutations";
import { dateScalarResolvers } from "../types/date";
import { GraphQLContext } from "../../../utilities/context";
import { UserUseCase } from "../../../usecases/users/usecase";
import { Mock } from "moq.ts";
import { User } from "../../../entities/models/users";

const resolvers = {
  ...dateScalarResolvers,
  Query: {
    ...userQueryResolvers,
  },
  Mutation: {
    ...userMutationResolvers,
  },
};

const typeDefs = readFileSync("./schema.graphql", "utf8");

const USER_QUERY = `
  query user($id: ID!) {
    user(id: $id) {
      id
    }
  }
`;

const USERS_QUERY = `
  query users($first: Int, $after: String, $last: Int, $before: String, $filter: FindUserInput!) {
    users(first: $first, after: $after, last: $last, before: $before, filter: $filter) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

describe("users schema tests", () => {
  let server: ApolloServer<GraphQLContext>;

  beforeAll(async () => {
    server = new ApolloServer<GraphQLContext>({
      schema: addMocksToSchema({
        schema: makeExecutableSchema({ typeDefs, resolvers }),
      }),
    });
  });

  describe("user query", () => {
    let mockUserUseCase: UserUseCase;
    beforeEach(() => {
      mockUserUseCase = new Mock<UserUseCase>()
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve({} as User))
        .object();
    });

    it("should return a valid user", async () => {
      const result = await server.executeOperation(
        {
          query: USER_QUERY,
          variables: {
            id: "1",
          },
        },
        {
          contextValue: {
            useCases: {
              users: mockUserUseCase,
            },
          },
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(result).toMatchSnapshot();
      expect((body.singleResult.data?.user as User).id).toBeTruthy();
    });
  });

  describe("users query", () => {
    let mockUserUseCase: UserUseCase;
    beforeEach(() => {
      mockUserUseCase = new Mock<UserUseCase>()
        .setup((x) => x.findAll)
        .returns(() => Promise.resolve([{} as User]))
        .object();
    });

    it("should return a valid user", async () => {
      const result = await server.executeOperation(
        {
          query: USERS_QUERY,
          variables: {
            first: 1,
            filter: {},
          },
        },
        {
          contextValue: {
            useCases: {
              users: mockUserUseCase,
            },
          },
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(result).toMatchSnapshot();
      expect(
        (
          (
            body.singleResult.data?.users as {
              edges: { node: User }[];
            }
          ).edges[0].node as User
        ).id,
      ).toBeTruthy();
    });
  });

  describe("createUser mutation", () => {
    let mockUserUseCase: UserUseCase;
    beforeEach(() => {
      mockUserUseCase = new Mock<UserUseCase>()
        .setup((x) => x.create)
        .returns(() => Promise.resolve({} as User))
        .object();
    });

    it("should return a valid user", async () => {
      const result = await server.executeOperation(
        {
          query: `
            mutation createUser($input: CreateUserInput!) {
              createUser(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              email: "example@example.com",
              password: "password",
              name: "John",
              country: "US",
            },
          },
        },
        {
          contextValue: {
            useCases: {
              users: mockUserUseCase,
            },
          },
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(result).toMatchSnapshot();
      expect((body.singleResult.data?.createUser as User).id).toBeTruthy();
    });
  });

  describe("updateUser mutation", () => {
    let mockUserUseCase: UserUseCase;
    beforeEach(() => {
      mockUserUseCase = new Mock<UserUseCase>()
        .setup((x) => x.update)
        .returns(() => Promise.resolve({} as User))
        .object();
    });

    it("should return a valid user", async () => {
      const result = await server.executeOperation(
        {
          query: `
            mutation updateUser($input: UpdateUserInput!) {
              updateUser(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              id: "1",
              email: "",
            },
          },
        },
        {
          contextValue: {
            useCases: {
              users: mockUserUseCase,
            },
          },
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(result).toMatchSnapshot();
      expect((body.singleResult.data?.updateUser as User).id).toBeTruthy();
    });
  });

  describe("deleteUser mutation", () => {
    let mockUserUseCase: UserUseCase;
    beforeEach(() => {
      mockUserUseCase = new Mock<UserUseCase>()
        .setup((x) => x.delete)
        .returns(() => Promise.resolve())
        .object();
    });

    it("should return a valid user", async () => {
      const result = await server.executeOperation(
        {
          query: `
            mutation deleteUser($id: ID!) {
              deleteUser(id: $id)
            }
          `,
          variables: {
            id: "1",
          },
        },
        {
          contextValue: {
            useCases: {
              users: mockUserUseCase,
            },
          },
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(result).toMatchSnapshot();
      expect(body.singleResult.errors).toBeUndefined();
    });
  });
});
