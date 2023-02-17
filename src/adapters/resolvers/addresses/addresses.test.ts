import { readFileSync } from "fs";
import { ApolloServer } from "@apollo/server";
import { addMocksToSchema } from "@graphql-tools/mock";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { User, UserRole } from "../../../entities/models/users";
import { Address, AddressType } from "../../../entities/models/addresses";
import { GraphQLContext } from "../../../utilities/context";
import { createMockContextFactory } from "../../../utilities/mock";
import assert from "assert";
import { resolvers } from "../index";
import { createAuthDirective } from "../../../utilities/auth";

const typeDefs = readFileSync("./schema.graphql", "utf8");

const ADDRESS_QUERY = `
  query address($id: ID!) {
    address(id: $id) {
      id
    }
  }
`;

const ADDRESSES_QUERY = `
  query addresses($first: Int, $after: String, $last: Int, $before: String, $filter: FindAddressInput!) {
    addresses(first: $first, after: $after, last: $last, before: $before, filter: $filter) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

const CREATE_ADDRESS_MUTATION = `
  mutation createAddress($input: CreateAddressInput!) {
    createAddress(input: $input) {
      id
    }
  }
`;

const UPDATE_ADDRESS_MUTATION = `
  mutation updateAddress($input: UpdateAddressInput!) {
    updateAddress(input: $input) {
      id
    }
  }
`;

const DELETE_ADDRESS_MUTATION = `
  mutation deleteAddress($id: ID!) {
    deleteAddress(id: $id)
  }
`;

describe("Addresses resolvers tests", () => {
  let server: ApolloServer<GraphQLContext>;
  let user: User;
  let address: Address;

  beforeAll(async () => {
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

    address = {
      id: "1",
      user_id: user.id,
      user: user,
      type: AddressType.Personal,
      name: "name",
      tax_id: "taxId",
      email: "email@example.com",
      number: "number",
      comment: "comment",
      street: "street",
      zipcode: "zipcode",
      city: "city",
      state: "state",
      country: "VE",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: undefined,
    };
  });

  describe("address", () => {
    it("should return an address", async () => {
      const result = await server.executeOperation(
        {
          query: ADDRESS_QUERY,
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
      expect((body.singleResult.data?.address as Address).id).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: ADDRESS_QUERY,
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

  describe("addresses", () => {
    it("should return a list of addresses", async () => {
      const result = await server.executeOperation(
        {
          query: ADDRESSES_QUERY,
          variables: {
            first: 10,
            after: null,
            last: null,
            before: null,
            filter: {
              userId: user.id,
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
        (body.singleResult.data?.addresses as { edges: { node: Address }[] }).edges[0].node.id,
      ).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: ADDRESSES_QUERY,
          variables: {
            first: 10,
            after: null,
            last: null,
            before: null,
            filter: {
              userId: user.id,
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
      expect(body.singleResult.data?.addresses).toBeNull();
    });
  });

  describe("createAddress", () => {
    it("should create an address", async () => {
      const input = {
        type: address.type.toUpperCase(),
        name: address.name,
        tax_id: address.tax_id,
        country: address.country,
      };
      const result = await server.executeOperation(
        {
          query: CREATE_ADDRESS_MUTATION,
          variables: {
            input,
          },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );

      const body = result.body;

      assert(body.kind === "single");
      expect((body.singleResult.data?.createAddress as Address).id).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const input = {
        type: address.type.toUpperCase(),
        name: address.name,
        tax_id: address.tax_id,
        country: address.country,
      };
      const result = await server.executeOperation(
        {
          query: CREATE_ADDRESS_MUTATION,
          variables: {
            input,
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

  describe("updateAddress", () => {
    it("should update an address", async () => {
      const input = {
        id: address.id,
        name: address.name,
      };
      const result = await server.executeOperation(
        {
          query: UPDATE_ADDRESS_MUTATION,
          variables: {
            input,
          },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );

      const body = result.body;

      assert(body.kind === "single");
      expect((body.singleResult.data?.updateAddress as Address).id).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const input = {
        id: address.id,
        name: address.name,
      };
      const result = await server.executeOperation(
        {
          query: UPDATE_ADDRESS_MUTATION,
          variables: {
            input,
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

  describe("deleteAddress", () => {
    it("should delete an address", async () => {
      const result = await server.executeOperation(
        {
          query: DELETE_ADDRESS_MUTATION,
          variables: {
            id: address.id,
          },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );

      const body = result.body;

      assert(body.kind === "single");
      expect(body.singleResult.data?.deleteAddress).toBeDefined();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: DELETE_ADDRESS_MUTATION,
          variables: {
            id: address.id,
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
