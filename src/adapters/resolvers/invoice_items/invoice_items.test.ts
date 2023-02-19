import assert from "assert";
import { readFileSync } from "fs";
import { ApolloServer } from "@apollo/server";
import { addMocksToSchema } from "@graphql-tools/mock";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { User, UserRole } from "../../../entities/models/users";
import { GraphQLContext } from "../../../utilities/context";
import { createAuthDirective } from "../../../utilities/auth";
import { InvoiceItem, InvoiceItemType } from "../../../entities/models/invoice_items";
import { resolvers } from "../index";
import { createMockContextFactory } from "../../../utilities/mock";

const typeDefs = readFileSync("./schema.graphql", "utf8");

const INVOICE_ITEM_QUERY = `
  query invoiceItem($id: ID!) {
    invoiceItem(id: $id) {
      id
    }
  }
`;

const INVOICE_ITEMS_QUERY = `
  query invoiceItems($first: Int, $after: String, $last: Int, $before: String, $filter: FindInvoiceItemInput!) {
    invoiceItems(first: $first, after: $after, last: $last, before: $before, filter: $filter) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

const CREATE_INVOICE_ITEM_MUTATION = `
  mutation createInvoiceItem($input: CreateInvoiceItemInput!) {
    createInvoiceItem(input: $input) {
      id
    }
  }
`;

const UPDATE_INVOICE_ITEM_MUTATION = `
  mutation updateInvoiceItem($input: UpdateInvoiceItemInput!) {
    updateInvoiceItem(input: $input) {
      id
    }
  }
`;

const DELETE_INVOICE_ITEM_MUTATION = `
  mutation deleteInvoiceItem($id: ID!) {
    deleteInvoiceItem(id: $id)
  }
`;

describe("InvoiceItems resolvers tests", () => {
  let server: ApolloServer<GraphQLContext>;
  let user: User;
  let invoiceItem: InvoiceItem;

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

    invoiceItem = {
      id: "1",
      invoice_id: "1",
      name: "Invoice Item Name",
      description: "Invoice Item Description",
      quantity: 1,
      price: 1,
      type: InvoiceItemType.Product,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: undefined,
    };
  });

  describe("invoice item query", () => {
    it("should return an invoice item", async () => {
      const result = await server.executeOperation(
        {
          query: INVOICE_ITEM_QUERY,
          variables: { id: invoiceItem.id },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect((body.singleResult.data?.invoiceItem as InvoiceItem).id).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: INVOICE_ITEM_QUERY,
          variables: { id: invoiceItem.id },
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

  describe("invoice items query", () => {
    it("should return a list of invoice items", async () => {
      const result = await server.executeOperation(
        {
          query: INVOICE_ITEMS_QUERY,
          variables: { filter: { invoiceId: invoiceItem.invoice_id } },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(
        (body.singleResult.data?.invoiceItems as { edges: { node: InvoiceItem }[] }).edges[0].node
          .id,
      ).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: INVOICE_ITEMS_QUERY,
          variables: { filter: { invoiceId: invoiceItem.invoice_id } },
        },
        {
          contextValue: createMockContextFactory(null)(null),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(body.singleResult.errors).toBeTruthy();
      expect(body.singleResult.data?.invoiceItems).toBeNull();
    });
  });

  describe("create invoice item mutation", () => {
    it("should create an invoice item", async () => {
      const result = await server.executeOperation(
        {
          query: CREATE_INVOICE_ITEM_MUTATION,
          variables: {
            input: {
              invoiceId: invoiceItem.invoice_id,
              name: invoiceItem.name,
              description: invoiceItem.description,
              quantity: invoiceItem.quantity,
              price: invoiceItem.price,
              type: invoiceItem.type.toUpperCase(),
            },
          },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect((body.singleResult.data?.createInvoiceItem as InvoiceItem).id).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: CREATE_INVOICE_ITEM_MUTATION,
          variables: {
            input: {
              invoiceId: invoiceItem.invoice_id,
              name: invoiceItem.name,
              description: invoiceItem.description,
              quantity: invoiceItem.quantity,
              price: invoiceItem.price,
              type: invoiceItem.type.toUpperCase(),
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

  describe("update invoice item mutation", () => {
    it("should update an invoice item", async () => {
      const result = await server.executeOperation(
        {
          query: UPDATE_INVOICE_ITEM_MUTATION,
          variables: {
            input: {
              id: invoiceItem.id,
              name: "New Invoice Item Name",
            },
          },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect((body.singleResult.data?.updateInvoiceItem as InvoiceItem).id).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: UPDATE_INVOICE_ITEM_MUTATION,
          variables: {
            input: {
              id: invoiceItem.id,
              name: "New Invoice Item Name",
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

  describe("delete invoice item mutation", () => {
    it("should delete an invoice item", async () => {
      const result = await server.executeOperation(
        {
          query: DELETE_INVOICE_ITEM_MUTATION,
          variables: {
            id: invoiceItem.id,
          },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(body.singleResult.data?.deleteInvoiceItem).toBeDefined();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: DELETE_INVOICE_ITEM_MUTATION,
          variables: {
            id: invoiceItem.id,
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
