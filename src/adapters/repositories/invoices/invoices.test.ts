import { QueryResultRow } from "slonik";

import { makePool } from "../../../utilities/mock";
import { Invoice, InvoiceStatus, InvoiceType } from "../../../entities/models/invoice";
import { InvoiceRepository } from "./invoices";
import { CreateInvoiceInput, InvoiceFilterInput } from "../../../usecases/invoices/interfaces";
import { InvoiceItemType } from "../../../entities/models/invoice_items";
import { TaxCalcType } from "../../../entities/models/taxes";
import { TranslationUseCasePort } from "../../../usecases/common/interfaces";
import { It, Mock } from "moq.ts";

describe("InvoicesRepository", () => {
  let invoice: Invoice;
  let invoiceResult: QueryResultRow[];
  let translator: TranslationUseCasePort;

  beforeEach(() => {
    translator = new Mock<TranslationUseCasePort>()
      .setup((x) => x.translate(It.IsAny(), It.IsAny()))
      .returns("translated")
      .object();

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
      const repo = new InvoiceRepository(dbPool, translator);
      const dbInvoice = await repo.findByID(invoice.id);
      expect(dbInvoice).toEqual(invoice);
    });

    it("should throw an error if the invoice does not exist", async () => {
      const dbPool = makePool([]);
      const repo = new InvoiceRepository(dbPool, translator);
      await expect(repo.findByID(invoice.id)).rejects.toThrow(Error);
    });
  });

  describe("findByFilter", () => {
    it("should return an array of invoices", async () => {
      const dbPool = makePool(invoiceResult);
      const repo = new InvoiceRepository(dbPool, translator);
      const filter: InvoiceFilterInput = { limit: 10, direction: "ASC" };
      const dbInvoices = await repo.findAll(filter);
      expect(dbInvoices).toEqual([invoice]);
    });

    it("should return an empty array if no invoices are found", async () => {
      const dbPool = makePool([]);
      const repo = new InvoiceRepository(dbPool, translator);
      const filter: InvoiceFilterInput = { limit: 10, direction: "ASC" };
      const dbInvoices = await repo.findAll(filter);
      expect(dbInvoices).toEqual([]);
    });
  });

  describe("create", () => {
    it("should return the created invoice", async () => {
      const dbPool = makePool(invoiceResult);
      const repo = new InvoiceRepository(dbPool, translator);
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
      const repo = new InvoiceRepository(dbPool, translator);
      const dbInvoice = await repo.update(invoice, invoice.user_id);
      expect(dbInvoice).toEqual(invoice);
    });
  });

  describe("delete", () => {
    it("should return the deleted invoice", async () => {
      const dbPool = makePool(invoiceResult);
      const repo = new InvoiceRepository(dbPool, translator);
      const dbInvoice = await repo.delete(invoice.id);

      expect(dbInvoice).toBeUndefined();
    });
  });

  describe("aggregate functions", () => {
    const queryResultItemTemplate = {
      id: "1",
      invoice_id: "1",
      type: InvoiceItemType.Service,
      name: "name",
      description: "description",
      quantity: 1,
      price: 100,
      tax_id: null,
      item_created_at: new Date().toISOString(),
      item_updated_at: new Date().toISOString(),
      item_deleted_at: null,
      tax_user_id: "1",
      tax_name: "tax",
      tax_rate: 10,
      tax_calc_type: TaxCalcType.Percentage,
      tax_created_at: new Date().toISOString(),
      tax_updated_at: new Date().toISOString(),
      tax_deleted_at: null,
    };

    it("should return discount amount", async () => {
      const dbPool = makePool([
        {
          ...queryResultItemTemplate,
          type: InvoiceItemType.Discount,
        },
      ]);
      const repo = new InvoiceRepository(dbPool, translator);
      const amount = await repo.getDiscount(invoice.id);

      expect(amount).toEqual(100);
    });

    it("should return 0 discount amount", async () => {
      const dbPool = makePool([]);
      const repo = new InvoiceRepository(dbPool, translator);
      const amount = await repo.getDiscount(invoice.id);

      expect(amount).toEqual(0);
    });

    it("should return tax amount", async () => {
      const dbPool = makePool([queryResultItemTemplate]);
      const repo = new InvoiceRepository(dbPool, translator);
      const amount = await repo.getTaxAmount(invoice.id);

      expect(amount).toEqual(10);
    });

    it("should return 0 tax amount", async () => {
      const dbPool = makePool([]);
      const repo = new InvoiceRepository(dbPool, translator);
      const amount = await repo.getTaxAmount(invoice.id);

      expect(amount).toEqual(0);
    });

    it("should return subtotal amount", async () => {
      const dbPool = makePool([queryResultItemTemplate]);
      const repo = new InvoiceRepository(dbPool, translator);
      const amount = await repo.getSubtotal(invoice.id);

      expect(amount).toEqual(100);
    });

    it("should return 0 subtotal amount", async () => {
      const dbPool = makePool([]);
      const repo = new InvoiceRepository(dbPool, translator);
      const amount = await repo.getSubtotal(invoice.id);

      expect(amount).toEqual(0);
    });

    it("should return total amount", async () => {
      const dbPool = makePool([queryResultItemTemplate]);
      const repo = new InvoiceRepository(dbPool, translator);
      const amount = await repo.getTotal(invoice.id);

      expect(amount).toEqual(110);
    });

    it("should return 0 total amount", async () => {
      const dbPool = makePool([]);
      const repo = new InvoiceRepository(dbPool, translator);
      const amount = await repo.getTotal(invoice.id);

      expect(amount).toEqual(0);
    });

    it("should return taxable amount", async () => {
      const dbPool = makePool([queryResultItemTemplate]);
      const repo = new InvoiceRepository(dbPool, translator);
      const amount = await repo.getTaxableAmount(invoice.id);

      expect(amount).toEqual(100);
    });

    it("should return 0 taxable amount", async () => {
      const dbPool = makePool([]);
      const repo = new InvoiceRepository(dbPool, translator);
      const amount = await repo.getTaxableAmount(invoice.id);

      expect(amount).toEqual(0);
    });

    it("should return non taxable amount", async () => {
      const dbPool = makePool([
        {
          ...queryResultItemTemplate,
          tax_id: null,
          tax_name: null,
          tax_rate: null,
          tax_calc_type: null,
        },
      ]);
      const repo = new InvoiceRepository(dbPool, translator);
      const amount = await repo.getNonTaxableAmount(invoice.id);

      expect(amount).toEqual(100);
    });

    it("should return 0 non taxable amount", async () => {
      const dbPool = makePool([]);
      const repo = new InvoiceRepository(dbPool, translator);
      const amount = await repo.getNonTaxableAmount(invoice.id);

      expect(amount).toEqual(0);
    });

    it("should return taxes list", async () => {
      const newResult = { ...queryResultItemTemplate, tax_id: "1" };
      const dbPool = makePool([newResult]);
      const repo = new InvoiceRepository(dbPool, translator);
      const taxes = await repo.getInvoiceTaxes(invoice.id);

      expect(taxes).toEqual([
        {
          id: newResult.tax_id,
          name: newResult.tax_name,
          rate: newResult.tax_rate,
          calc_type: newResult.tax_calc_type,
          user_id: newResult.tax_user_id,
          created_at: new Date(newResult.tax_created_at),
          updated_at: new Date(newResult.tax_updated_at),
          deleted_at: undefined,
        },
      ]);
    });

    it("should return empty taxes list", async () => {
      const dbPool = makePool([]);
      const repo = new InvoiceRepository(dbPool, translator);
      const taxes = await repo.getInvoiceTaxes(invoice.id);

      expect(taxes).toEqual([]);
    });

    it("should return items list", async () => {
      const dbPool = makePool([queryResultItemTemplate]);
      const repo = new InvoiceRepository(dbPool, translator);
      const taxes = await repo.getInvoiceItems(invoice.id);

      expect(taxes).toEqual([
        {
          id: queryResultItemTemplate.id,
          invoice_id: queryResultItemTemplate.invoice_id,
          type: queryResultItemTemplate.type,
          name: queryResultItemTemplate.name,
          description: queryResultItemTemplate.description,
          quantity: queryResultItemTemplate.quantity,
          price: queryResultItemTemplate.price,
          tax_id: queryResultItemTemplate.tax_id,
          created_at: new Date(queryResultItemTemplate.item_created_at),
          updated_at: new Date(queryResultItemTemplate.item_updated_at),
          deleted_at: undefined,
        },
      ]);
    });

    it("should return empty items list", async () => {
      const dbPool = makePool([]);
      const repo = new InvoiceRepository(dbPool, translator);
      const taxes = await repo.getInvoiceItems(invoice.id);

      expect(taxes).toEqual([]);
    });
  });
});
