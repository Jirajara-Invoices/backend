import { NotFoundError, QueryResultRow } from "slonik";

import { makePool } from "../../../utilities/mock";
import { Invoice, InvoiceStatus, InvoiceType } from "../../../entities/models/invoice";
import { InvoiceRepository } from "./invoices";
import { CreateInvoiceInput, InvoiceFilterInput } from "../../../usecases/invoices/interfaces";

describe("InvoicesRepository", () => {
  let invoice: Invoice;
  let invoiceResult: QueryResultRow[];

  beforeEach(() => {
    invoice = {
      id: "1",
      user_id: "1",
      address_id: "1",
      client_address_id: "1",
      type: InvoiceType.Invoice,
      number: "number",
      date: new Date(),
      due_date: new Date(),
      status: InvoiceStatus.Draft,
      terms: "",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: undefined,
    };

    invoiceResult = [
      {
        id: invoice.id,
        user_id: invoice.user_id,
        address_id: invoice.address_id,
        client_address_id: invoice.client_address_id,
        type: invoice.type,
        number: invoice.number,
        date: invoice.date.toISOString(),
        due_date: invoice.due_date.toISOString(),
        status: invoice.status,
        terms: invoice.terms,
        created_at: invoice.created_at.toISOString(),
        updated_at: invoice.updated_at.toISOString(),
        deleted_at: null,
      },
    ];
  });

  describe("findByID", () => {
    it("should return an invoice", async () => {
      const dbPool = makePool(invoiceResult);
      const repo = new InvoiceRepository(dbPool);
      const dbInvoice = await repo.findByID(invoice.id);
      expect(dbInvoice).toEqual(invoice);
    });

    it("should throw an error if the invoice does not exist", async () => {
      const dbPool = makePool([]);
      const repo = new InvoiceRepository(dbPool);
      await expect(repo.findByID(invoice.id)).rejects.toThrow(NotFoundError);
    });
  });

  describe("findByFilter", () => {
    it("should return an array of invoices", async () => {
      const dbPool = makePool(invoiceResult);
      const repo = new InvoiceRepository(dbPool);
      const filter: InvoiceFilterInput = { limit: 10, direction: "ASC" };
      const dbInvoices = await repo.findAll(filter);
      expect(dbInvoices).toEqual([invoice]);
    });

    it("should return an empty array if no invoices are found", async () => {
      const dbPool = makePool([]);
      const repo = new InvoiceRepository(dbPool);
      const filter: InvoiceFilterInput = { limit: 10, direction: "ASC" };
      const dbInvoices = await repo.findAll(filter);
      expect(dbInvoices).toEqual([]);
    });
  });

  describe("create", () => {
    it("should return the created invoice", async () => {
      const dbPool = makePool(invoiceResult);
      const repo = new InvoiceRepository(dbPool);
      const input: CreateInvoiceInput = {
        ...invoice,
      };
      const dbInvoice = await repo.create(input, invoice.user_id);
      expect(dbInvoice).toEqual(invoice);
    });
  });

  describe("update", () => {
    it("should return the updated invoice", async () => {
      const dbPool = makePool(invoiceResult);
      const repo = new InvoiceRepository(dbPool);
      const dbInvoice = await repo.update(invoice, invoice.user_id);
      expect(dbInvoice).toEqual(invoice);
    });
  });

  describe("delete", () => {
    it("should return the deleted invoice", async () => {
      const dbPool = makePool(invoiceResult);
      const repo = new InvoiceRepository(dbPool);
      const dbInvoice = await repo.delete(invoice.id);

      expect(dbInvoice).toBeUndefined();
    });
  });
});
