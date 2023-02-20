import { IMock, It, Mock } from "moq.ts";
import { User, UserRole } from "../../entities/models/users";
import { Invoice, InvoiceStatus, InvoiceType } from "../../entities/models/invoice";
import { LoggerUseCasePort } from "../common/interfaces";
import {
  CreateInvoiceInput,
  InvoiceFilterInput,
  InvoiceRepositoryPort,
  UpdateInvoiceInput,
} from "./interfaces";
import { ValidationError } from "../../entities/errors";
import { InvoiceUseCase } from "./usecase";
import { Tax, TaxCalcType } from "../../entities/models/taxes";
import { InvoiceItem, InvoiceItemType } from "../../entities/models/invoice_items";

describe("Invoices tests suites", () => {
  let invoiceRepository: IMock<InvoiceRepositoryPort>;
  let currentUser: User;
  let invoice: Invoice;
  let logger: LoggerUseCasePort;

  beforeEach(() => {
    invoiceRepository = new Mock<InvoiceRepositoryPort>();
    invoice = {
      id: "1",
      user_id: "1",
      address_id: "1",
      client_address_id: "2",
      type: InvoiceType.Invoice,
      date: new Date(),
      due_date: new Date(),
      number: "12345",
      status: InvoiceStatus.Draft,
      terms: "",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: undefined,
    };
    logger = new Mock<LoggerUseCasePort>()
      .setup((x) => x.error(It.IsAny()))
      .returns()
      .object();

    currentUser = {
      id: "1",
      name: "name",
      email: "email",
      role: UserRole.User,
      country: "VE",
      created_at: new Date(),
      updated_at: new Date(),
    };
  });

  describe("create invoice", () => {
    it("should create an invoice", async () => {
      invoiceRepository.setup((x) => x.create).returns(() => Promise.resolve(invoice));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
      const { id, created_at, updated_at, deleted_at, user_id, ...input } = invoice;
      const result = await invoiceUseCase.create(input);

      expect(result).toEqual(invoice);
    });

    it("should throw an error if the address_id is not provided", async () => {
      invoiceRepository.setup((x) => x.create).returns(() => Promise.resolve(invoice));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);
      const input: CreateInvoiceInput = {
        address_id: "",
        client_address_id: "2",
        type: InvoiceType.Invoice,
        number: "12345",
        date: new Date(),
        due_date: new Date(),
        status: InvoiceStatus.Draft,
        terms: "",
      };
      await expect(invoiceUseCase.create(input)).rejects.toThrowError(ValidationError);
    });

    it("should throw an error if the client_address_id is not provided", async () => {
      invoiceRepository.setup((x) => x.create).returns(() => Promise.resolve(invoice));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);
      const input: CreateInvoiceInput = {
        address_id: "1",
        client_address_id: "",
        type: InvoiceType.Invoice,
        number: "12345",
        date: new Date(),
        due_date: new Date(),
        status: InvoiceStatus.Draft,
        terms: "",
      };
      await expect(invoiceUseCase.create(input)).rejects.toThrowError(ValidationError);
    });

    it("should throw an error if the due date it's before the date", async () => {
      invoiceRepository.setup((x) => x.create).returns(() => Promise.resolve(invoice));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);
      const input: CreateInvoiceInput = {
        address_id: "1",
        client_address_id: "2",
        type: InvoiceType.Invoice,
        number: "12345",
        date: new Date(),
        due_date: new Date("2020-01-01"),
        status: InvoiceStatus.Draft,
        terms: "",
      };
      await expect(invoiceUseCase.create(input)).rejects.toThrowError(ValidationError);
    });
  });

  describe("update invoice", () => {
    it("should update an invoice", async () => {
      invoiceRepository
        .setup((x) => x.update)
        .returns(() => Promise.resolve(invoice))
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(invoice));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
      const { created_at, updated_at, deleted_at, user_id, ...input } = invoice;
      const result = await invoiceUseCase.update(input);

      expect(result).toEqual(invoice);
    });

    it("should throw an error if the due date it's before the date", async () => {
      invoiceRepository
        .setup((x) => x.update)
        .returns(() => Promise.resolve(invoice))
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(invoice));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);
      const input: UpdateInvoiceInput = {
        id: "1",
        due_date: new Date("2020-01-01"),
      };
      await expect(invoiceUseCase.update(input)).rejects.toThrowError(ValidationError);
    });

    it("should throw an error if the date it's after the due date", async () => {
      invoiceRepository
        .setup((x) => x.update)
        .returns(() => Promise.resolve(invoice))
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(invoice));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);
      const input: UpdateInvoiceInput = {
        id: "1",
        date: new Date("2024-01-01"),
      };
      await expect(invoiceUseCase.update(input)).rejects.toThrowError(ValidationError);
    });
  });

  describe("delete invoice", () => {
    it("should delete an invoice", async () => {
      invoiceRepository
        .setup((x) => x.delete)
        .returns(() => Promise.resolve())
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(invoice));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);

      await expect(invoiceUseCase.delete(invoice.id)).resolves.toBeUndefined();
    });

    it("should throw an error if the invoice does not belongs to the user", async () => {
      invoice.user_id = "2";
      invoiceRepository
        .setup((x) => x.delete)
        .returns(() => Promise.resolve())
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(invoice));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);

      await expect(invoiceUseCase.delete(invoice.id)).rejects.toThrowError(ValidationError);
    });
  });

  describe("get invoice by id", () => {
    it("should get an invoice", async () => {
      invoiceRepository.setup((x) => x.findByID).returns(() => Promise.resolve(invoice));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);

      const result = await invoiceUseCase.findByID(invoice.id);

      expect(result).toEqual(invoice);
    });

    it("should throw an error if the invoice does not belongs to the user", async () => {
      invoice.user_id = "2";
      invoiceRepository.setup((x) => x.findByID).returns(() => Promise.resolve(invoice));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);

      await expect(invoiceUseCase.findByID(invoice.id)).rejects.toThrowError(ValidationError);
    });
  });

  describe("get invoices", () => {
    it("should get all invoices", async () => {
      invoiceRepository.setup((x) => x.findAll).returns(() => Promise.resolve([invoice]));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);
      const filter: InvoiceFilterInput = {
        direction: "ASC",
        limit: 1,
        userId: invoice.user_id,
      };

      const result = await invoiceUseCase.findAll(filter);

      expect(result).toEqual([invoice]);
    });

    it("should get all invoices with a filter", async () => {
      invoiceRepository.setup((x) => x.findAll).returns(() => Promise.resolve([invoice]));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);
      const filter: InvoiceFilterInput = {
        direction: "ASC",
        limit: 1,
        userId: invoice.user_id,
        status: invoice.status,
        type: invoice.type,
      };

      const result = await invoiceUseCase.findAll(filter);

      expect(result).toEqual([invoice]);
    });

    it("should throw an error if the invoices does not belongs to the user", async () => {
      invoice.user_id = "2";
      invoiceRepository.setup((x) => x.findAll).returns(() => Promise.resolve([invoice]));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);
      const filter: InvoiceFilterInput = {
        direction: "ASC",
        limit: 1,
        userId: invoice.user_id,
      };

      await expect(invoiceUseCase.findAll(filter)).rejects.toThrowError(ValidationError);
    });
  });

  describe("get invoices aggregate values: items, taxes and amounts", () => {
    it("should return the discount amount", async () => {
      invoiceRepository
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(invoice))
        .setup((x) => x.getDiscount)
        .returns(() => Promise.resolve(10));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);

      await expect(invoiceUseCase.getDiscount(invoice.id)).resolves.toBe(10);
    });

    it("should return the taxes items", async () => {
      const taxes: Tax[] = [
        {
          id: "1",
          name: "IVA",
          rate: 21,
          calc_type: TaxCalcType.Percentage,
          user_id: "1",
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: undefined,
        },
      ];
      invoiceRepository
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(invoice))
        .setup((x) => x.getInvoiceTaxes)
        .returns(() => Promise.resolve(taxes));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);

      await expect(invoiceUseCase.getInvoiceTaxes(invoice.id)).resolves.toEqual(taxes);
    });

    it("should return the non taxable amount", async () => {
      invoiceRepository
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(invoice))
        .setup((x) => x.getNonTaxableAmount)
        .returns(() => Promise.resolve(15.15));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);

      await expect(invoiceUseCase.getNonTaxableAmount(invoice.id)).resolves.toEqual(15.15);
    });

    it("should return the sub total amount", async () => {
      invoiceRepository
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(invoice))
        .setup((x) => x.getSubtotal)
        .returns(() => Promise.resolve(101.36));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);

      await expect(invoiceUseCase.getSubtotal(invoice.id)).resolves.toEqual(101.36);
    });

    it("should return the taxable amount", async () => {
      invoiceRepository
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(invoice))
        .setup((x) => x.getTaxableAmount)
        .returns(() => Promise.resolve(30.36));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);

      await expect(invoiceUseCase.getTaxableAmount(invoice.id)).resolves.toEqual(30.36);
    });

    it("should return the taxes amount", async () => {
      invoiceRepository
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(invoice))
        .setup((x) => x.getTaxAmount)
        .returns(() => Promise.resolve(21.5));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);

      await expect(invoiceUseCase.getTaxAmount(invoice.id)).resolves.toEqual(21.5);
    });

    it("should return the total amount", async () => {
      invoiceRepository
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(invoice))
        .setup((x) => x.getTotal)
        .returns(() => Promise.resolve(101.36));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);

      await expect(invoiceUseCase.getTotal(invoice.id)).resolves.toEqual(101.36);
    });

    it("should return the invoice items", async () => {
      const items: InvoiceItem[] = [
        {
          id: "1",
          invoice_id: "1",
          type: InvoiceItemType.Product,
          name: "IVA",
          description: "IVA",
          quantity: 1,
          price: 21,
          tax_id: "1",
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: undefined,
        },
      ];
      invoiceRepository
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(invoice))
        .setup((x) => x.getInvoiceItems)
        .returns(() => Promise.resolve(items));
      const invoiceUseCase = new InvoiceUseCase(invoiceRepository.object(), logger, currentUser);

      await expect(invoiceUseCase.getInvoiceItems(invoice.id)).resolves.toEqual(items);
    });
  });
});
