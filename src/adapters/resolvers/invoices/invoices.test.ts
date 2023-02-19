import assert from "assert";
import { readFileSync } from "fs";
import { ApolloServer } from "@apollo/server";
import { addMocksToSchema } from "@graphql-tools/mock";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { User, UserRole } from "../../../entities/models/users";
import { GraphQLContext } from "../../../utilities/context";
import { createAuthDirective } from "../../../utilities/auth";
import { resolvers } from "../index";
import { Invoice, InvoiceStatus, InvoiceType } from "../../../entities/models/invoice";
import { describe } from "node:test";
import { createMockContextFactory } from "../../../utilities/mock";

const typeDefs = readFileSync("./schema.graphql", "utf8");

const INVOICE_QUERY = `
  query invoice($id: ID!) {
    invoice(id: $id) {
      id
    }
  }
`;

const INVOICES_QUERY = `
  query invoices($first: Int, $after: String, $last: Int, $before: String, $filter: FindInvoiceInput!) {
    invoices(first: $first, after: $after, last: $last, before: $before, filter: $filter) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

const CREATE_INVOICE_MUTATION = `
  mutation createInvoice($input: CreateInvoiceInput!) {
    createInvoice(input: $input) {
      id
    }
  }
`;

const UPDATE_INVOICE_MUTATION = `
  mutation updateInvoice($input: UpdateInvoiceInput!) {
    updateInvoice(input: $input) {
      id
    }
  }
`;

const DELETE_INVOICE_MUTATION = `
  mutation deleteInvoice($id: ID!) {
    deleteInvoice(id: $id)
  }
`;

describe("Invoices resolvers tests", () => {
  let server: ApolloServer<GraphQLContext>;
  let user: User;
  let invoice: Invoice;

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

    invoice = {
      id: "1",
      address_id: "1",
      client_address_id: "2",
      user_id: user.id,
      type: InvoiceType.Invoice,
      status: InvoiceStatus.Draft,
      number: "1",
      date: new Date(),
      due_date: new Date(),
      terms: "30 days",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: undefined,
    };
  });

  describe("invoice query", () => {
    it("should return a tax", async () => {
      const result = await server.executeOperation(
        {
          query: INVOICE_QUERY,
          variables: { id: invoice.id },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect((body.singleResult.data?.invoice as Invoice).id).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: INVOICE_QUERY,
          variables: { id: invoice.id },
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

  describe("invoices query", () => {
    it("should return a list of invoices", async () => {
      const result = await server.executeOperation(
        {
          query: INVOICES_QUERY,
          variables: {
            first: 10,
            filter: {
              type: InvoiceType.Invoice.toUpperCase(),
              status: InvoiceStatus.Draft.toUpperCase(),
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
        (body.singleResult.data?.invoices as { edges: { node: Invoice }[] }).edges[0].node.id,
      ).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: INVOICES_QUERY,
          variables: {
            first: 10,
            filter: {
              type: InvoiceType.Invoice.toUpperCase(),
              status: InvoiceStatus.Draft.toUpperCase(),
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
      expect(body.singleResult.data?.invoices).toBeNull();
    });
  });

  describe("createInvoice mutation", () => {
    it("should create an invoice", async () => {
      const result = await server.executeOperation(
        {
          query: CREATE_INVOICE_MUTATION,
          variables: {
            input: {
              addressId: invoice.address_id,
              clientAddressId: invoice.client_address_id,
              type: invoice.type.toUpperCase(),
              status: invoice.status.toUpperCase(),
              number: invoice.number,
              date: invoice.date,
              dueDate: invoice.due_date,
              terms: invoice.terms,
            },
          },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect((body.singleResult.data?.createInvoice as Invoice).id).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: CREATE_INVOICE_MUTATION,
          variables: {
            input: {
              addressId: invoice.address_id,
              clientAddressId: invoice.client_address_id,
              type: invoice.type.toUpperCase(),
              status: invoice.status.toUpperCase(),
              number: invoice.number,
              date: invoice.date,
              dueDate: invoice.due_date,
              terms: invoice.terms,
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

  describe("updateInvoice mutation", () => {
    it("should update an invoice", async () => {
      const result = await server.executeOperation(
        {
          query: UPDATE_INVOICE_MUTATION,
          variables: {
            input: {
              id: invoice.id,
              number: invoice.number + "1",
            },
          },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect((body.singleResult.data?.updateInvoice as Invoice).id).toBeTruthy();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: UPDATE_INVOICE_MUTATION,
          variables: {
            input: {
              id: invoice.id,
              number: invoice.number + "1",
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

  describe("deleteInvoice mutation", () => {
    it("should delete an invoice", async () => {
      const result = await server.executeOperation(
        {
          query: DELETE_INVOICE_MUTATION,
          variables: {
            id: invoice.id,
          },
        },
        {
          contextValue: createMockContextFactory(null)(user),
        },
      );
      const body = result.body;

      assert(body.kind === "single");
      expect(body.singleResult.data?.deleteInvoice as Invoice).toBeDefined();
    });

    it("should return an error if user is not logged in", async () => {
      const result = await server.executeOperation(
        {
          query: DELETE_INVOICE_MUTATION,
          variables: {
            id: invoice.id,
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
