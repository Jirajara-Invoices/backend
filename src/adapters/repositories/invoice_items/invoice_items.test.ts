import { QueryResultRow, NotFoundError } from "slonik";
import { makePool } from "../../../utilities/mock";
import { InvoiceItem, InvoiceItemType } from "../../../entities/models/invoice_items";
import {
  CreateItemInput,
  ItemsFilterInput,
  UpdateItemInput,
} from "../../../usecases/invoice_items/interfaces";
import { InvoiceItemRepository } from "./invoice_items";

describe("InvoiceItemRepository", () => {
  let invoiceItem: InvoiceItem;
  let invoiceItemResult: QueryResultRow[];

  beforeEach(() => {
    invoiceItem = {
      id: "1",
      invoice_id: "1",
      type: InvoiceItemType.Service,
      name: "item",
      description: "description",
      quantity: 1,
      price: 10,
      tax_id: undefined,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: undefined,
    };

    invoiceItemResult = [
      {
        id: invoiceItem.id,
        invoice_id: invoiceItem.invoice_id,
        type: invoiceItem.type,
        name: invoiceItem.name,
        description: invoiceItem.description,
        quantity: invoiceItem.quantity,
        price: invoiceItem.price,
        tax_id: invoiceItem.tax_id ?? null,
        created_at: invoiceItem.created_at.toISOString(),
        updated_at: invoiceItem.updated_at.toISOString(),
        deleted_at: null,
      },
    ];
  });

  describe("findByID", () => {
    it("should return an invoice item", async () => {
      const dbPool = makePool(invoiceItemResult);
      const repo = new InvoiceItemRepository(dbPool);
      const dbInvoiceItem = await repo.findByID(invoiceItem.id);
      expect(dbInvoiceItem).toEqual(invoiceItem);
    });

    it("should throw an error if the invoice item does not exist", async () => {
      const dbPool = makePool([]);
      const repo = new InvoiceItemRepository(dbPool);
      await expect(repo.findByID(invoiceItem.id)).rejects.toThrow(NotFoundError);
    });
  });

  describe("findAll", () => {
    it("should return all invoice items", async () => {
      const dbPool = makePool(invoiceItemResult);
      const repo = new InvoiceItemRepository(dbPool);
      const filter: ItemsFilterInput = {
        direction: "ASC",
        limit: 10,
      };
      const dbInvoiceItems = await repo.findAll(filter, null);
      expect(dbInvoiceItems).toEqual([invoiceItem]);
    });

    it("should return an empty list", async () => {
      const dbPool = makePool([]);
      const repo = new InvoiceItemRepository(dbPool);
      const filter: ItemsFilterInput = {
        direction: "ASC",
        limit: 10,
      };
      const dbInvoiceItems = await repo.findAll(filter, null);
      expect(dbInvoiceItems).toEqual([]);
    });
  });

  describe("create", () => {
    it("should create an invoice item", async () => {
      const dbPool = makePool(invoiceItemResult);
      const repo = new InvoiceItemRepository(dbPool);
      const input: CreateItemInput = {
        invoice_id: invoiceItem.invoice_id,
        type: invoiceItem.type,
        name: invoiceItem.name,
        description: invoiceItem.description,
        quantity: invoiceItem.quantity,
        price: invoiceItem.price,
        tax_id: invoiceItem.tax_id,
      };
      const dbInvoiceItem = await repo.create(input);
      expect(dbInvoiceItem).toEqual(invoiceItem);
    });
  });

  describe("update", () => {
    it("should update an invoice item", async () => {
      invoiceItem.name = "updated";
      invoiceItemResult[0].name = invoiceItem.name;
      const dbPool = makePool(invoiceItemResult);
      const repo = new InvoiceItemRepository(dbPool);
      const input: UpdateItemInput = {
        id: invoiceItem.id,
        name: invoiceItem.name,
      };
      const dbInvoiceItem = await repo.update(input, "1");
      expect(dbInvoiceItem).toEqual(invoiceItem);
    });
  });

  describe("delete", () => {
    it("should delete an invoice item", async () => {
      const dbPool = makePool(invoiceItemResult);
      const repo = new InvoiceItemRepository(dbPool);
      const dbInvoiceItem = await repo.delete(invoiceItem.id, "1");
      expect(dbInvoiceItem).toBeUndefined();
    });
  });
});
