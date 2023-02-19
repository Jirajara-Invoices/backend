import { readFileSync } from "fs";
import { ApolloServer } from "@apollo/server";
import { addMocksToSchema } from "@graphql-tools/mock";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { User, UserRole } from "../../../entities/models/users";
import { GraphQLContext } from "../../../utilities/context";
import { createAuthDirective } from "../../../utilities/auth";
import { resolvers } from "../index";
import { Tax, TaxCalcType } from "../../../entities/models/taxes";
import { createMockContextFactory } from "../../../utilities/mock";
import assert from "assert";

const typeDefs = readFileSync("./schema.graphql", "utf8");

const TAX_QUERY = `
  query tax($id: ID!) {
    tax(id: $id) {
      id
    }
  }
`;

const TAXES_QUERY = `
  query taxes($first: Int, $after: String, $last: Int, $before: String, $filter: FindTaxInput!) {
    taxes(first: $first, after: $after, last: $last, before: $before, filter: $filter) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

const CREATE_TAX_MUTATION = `
  mutation createTax($input: CreateTaxInput!) {
    createTax(input: $input) {
      id
    }
  }
`;

const UPDATE_TAX_MUTATION = `
  mutation updateTax($input: UpdateTaxInput!) {
    updateTax(input: $input) {
      id
    }
  }
`;

const DELETE_TAX_MUTATION = `
  mutation deleteTax($id: ID!) {
    deleteTax(id: $id)
  }
`;

describe("Taxes resolvers tests", () => {
  let server: ApolloServer<GraphQLContext>;
  let user: User;
  let tax: Tax;

  beforeAll(() => {
    server = new ApolloServer<GraphQLContext>({
      schema: createAuthDirective(
        addMocksToSchema({
          schema: makeExecutableSchema({ typeDefs, resolvers }),
        }),
        "auth",
      ),
    });

    user = {
      id: "1",
      name: "John Doe",
      email: "example@example.com",
      country: "VE",
      role: UserRole.Admin,
      created_at: new Date(),
      updated_at: new Date(),
    };

    tax = {
      id: "1",
      name: "IVA",
      rate: 12,
      calc_type: TaxCalcType.Percentage,
      user_id: user.id,
      created_at: new Date(),
      updated_at: new Date(),
    };
  });

  describe("tax query", () => {
    it("should return a tax", async () => {
      const result = await server.executeOperation(
        {
          query: TAX_QUERY,
          variables: {
            id: tax.id,
          },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect((body.singleResult.data?.tax as Tax).id).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: TAX_QUERY,
          variables: {
            id: tax.id,
          },
        },
        {
          contextValue: createMockContextFactory(null)(null),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(body.singleResult.errors).toBeTruthy();
      expect(body.singleResult.data).toBeNull();
    });
  });

  describe("taxes query", () => {
    it("should return a list of taxes", async () => {
      const result = await server.executeOperation(
        {
          query: TAXES_QUERY,
          variables: {
            first: 1,
            filter: {
              name: "IVA",
            },
          },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(
        (body.singleResult.data?.taxes as { edges: { node: Tax }[] }).edges[0].node.id,
      ).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: TAXES_QUERY,
          variables: {
            first: 1,
            filter: {
              name: "IVA",
            },
          },
        },
        {
          contextValue: createMockContextFactory(null)(null),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(body.singleResult.errors).toBeTruthy();
      expect(body.singleResult.data?.taxes).toBeNull();
    });
  });

  describe("createTax mutation", () => {
    it("should create a tax", async () => {
      const result = await server.executeOperation(
        {
          query: CREATE_TAX_MUTATION,
          variables: {
            input: {
              name: tax.name,
              rate: tax.rate,
              calcType: tax.calc_type.toUpperCase(),
            },
          },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect((body.singleResult.data?.createTax as Tax).id).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: CREATE_TAX_MUTATION,
          variables: {
            input: {
              name: tax.name,
              rate: tax.rate,
              calcType: tax.calc_type.toUpperCase(),
            },
          },
        },
        {
          contextValue: createMockContextFactory(null)(null),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(body.singleResult.errors).toBeTruthy();
      expect(body.singleResult.data).toBeNull();
    });
  });

  describe("updateTax mutation", () => {
    it("should update a tax", async () => {
      const result = await server.executeOperation(
        {
          query: UPDATE_TAX_MUTATION,
          variables: {
            input: {
              id: tax.id,
              name: tax.name + " updated",
            },
          },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect((body.singleResult.data?.updateTax as Tax).id).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: UPDATE_TAX_MUTATION,
          variables: {
            input: {
              id: tax.id,
              name: tax.name + " updated",
            },
          },
        },
        {
          contextValue: createMockContextFactory(null)(null),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(body.singleResult.errors).toBeTruthy();
      expect(body.singleResult.data).toBeNull();
    });
  });

  describe("deleteTax mutation", () => {
    it("should delete a tax", async () => {
      const result = await server.executeOperation(
        {
          query: DELETE_TAX_MUTATION,
          variables: {
            id: "1",
          },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(body.singleResult.data?.deleteTax).toBeDefined();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: DELETE_TAX_MUTATION,
          variables: {
            id: "1",
          },
        },
        {
          contextValue: createMockContextFactory(null)(null),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(body.singleResult.errors).toBeTruthy();
      expect(body.singleResult.data).toBeNull();
    });
  });
});
