import { IMock, It, Mock } from "moq.ts";
import { ValidationError } from "../../entities/errors";
import { User, UserRole } from "../../entities/models/users";
import { InvoiceItem, InvoiceItemType } from "../../entities/models/invoice_items";
import { LoggerUseCasePort, TranslationUseCasePort } from "../common/interfaces";
import {
  CreateItemInput,
  InvoiceItemRepositoryPort,
  ItemsFilterInput,
  UpdateItemInput,
} from "./interfaces";
import { InvoiceItemUseCase } from "./usecase";

describe("invoice items test suites", () => {
  let invoiceItemsRepository: IMock<InvoiceItemRepositoryPort>;
  let currentUser: User;
  let logger: LoggerUseCasePort;
  let translator: TranslationUseCasePort;
  let invoiceItem: InvoiceItem;

  beforeEach(() => {
    invoiceItemsRepository = new Mock<InvoiceItemRepositoryPort>();
    logger = new Mock<LoggerUseCasePort>()
      .setup((x) => x.error(It.IsAny()))
      .returns()
      .object();
    translator = new Mock<TranslationUseCasePort>()
      .setup((x) => x.translate(It.IsAny(), It.IsAny()))
      .returns("translated")
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
    invoiceItem = {
      id: "1",
      invoice_id: "1",
      tax_id: "1",
      type: InvoiceItemType.Service,
      name: "name",
      description: "description",
      price: 1,
      quantity: 1,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: undefined,
    };
  });

  describe("create invoice item", () => {
    it("should create an invoice item", async () => {
      invoiceItemsRepository.setup((x) => x.create).returns(() => Promise.resolve(invoiceItem));
      const invoiceItemsUseCase = new InvoiceItemUseCase(
        invoiceItemsRepository.object(),
        logger,
        translator,
        currentUser,
      );

      const input: CreateItemInput = {
        invoice_id: "1",
        tax_id: "1",
        type: InvoiceItemType.Service,
        name: "name",
        description: "description",
        price: 1,
        quantity: 1,
      };

      const result = await invoiceItemsUseCase.create(input);

      expect(result).toEqual(invoiceItem);
    });

    it("should throw an error if the invoice id is not provided", async () => {
      const invoiceItemsUseCase = new InvoiceItemUseCase(
        invoiceItemsRepository.object(),
        logger,
        translator,
        currentUser,
      );
      const input: CreateItemInput = {
        invoice_id: "",
        tax_id: "1",
        type: InvoiceItemType.Service,
        name: "name",
        description: "description",
        price: 1,
        quantity: 1,
      };

      await expect(invoiceItemsUseCase.create(input)).rejects.toThrowError(ValidationError);
    });

    it("should throw an error if the price is not a number", async () => {
      const invoiceItemsUseCase = new InvoiceItemUseCase(
        invoiceItemsRepository.object(),
        logger,
        translator,
        currentUser,
      );
      const input: CreateItemInput = {
        invoice_id: "1",
        tax_id: "1",
        type: InvoiceItemType.Service,
        name: "name",
        description: "description",
        price: NaN,
        quantity: 1,
      };

      await expect(invoiceItemsUseCase.create(input)).rejects.toThrowError(ValidationError);
    });
  });

  describe("update invoice item", () => {
    it("should update an invoice item", async () => {
      invoiceItemsRepository.setup((x) => x.update).returns(() => Promise.resolve(invoiceItem));
      const invoiceItemsUseCase = new InvoiceItemUseCase(
        invoiceItemsRepository.object(),
        logger,
        translator,
        currentUser,
      );

      const input: UpdateItemInput = {
        id: "1",
        tax_id: "1",
        type: InvoiceItemType.Service,
        name: "name",
        description: "description",
        price: 1,
        quantity: 1,
      };

      const result = await invoiceItemsUseCase.update(input);

      expect(result).toEqual(invoiceItem);
    });

    it("should throw an error if the id is not provided", async () => {
      const invoiceItemsUseCase = new InvoiceItemUseCase(
        invoiceItemsRepository.object(),
        logger,
        translator,
        currentUser,
      );
      const input: UpdateItemInput = {
        id: "",
        quantity: 1,
      };

      await expect(invoiceItemsUseCase.update(input)).rejects.toThrowError(ValidationError);
    });
  });

  describe("delete invoice item", () => {
    it("should delete an invoice item", async () => {
      invoiceItemsRepository.setup((x) => x.delete).returns(() => Promise.resolve());
      const invoiceItemsUseCase = new InvoiceItemUseCase(
        invoiceItemsRepository.object(),
        logger,
        translator,
        currentUser,
      );

      await expect(invoiceItemsUseCase.delete("1")).resolves.toBeUndefined();
    });
  });

  describe("get invoice item", () => {
    it("should get an invoice item", async () => {
      invoiceItemsRepository.setup((x) => x.findByID).returns(() => Promise.resolve(invoiceItem));
      const invoiceItemsUseCase = new InvoiceItemUseCase(
        invoiceItemsRepository.object(),
        logger,
        translator,
        currentUser,
      );

      const result = await invoiceItemsUseCase.findByID("1");

      expect(result).toEqual(invoiceItem);
    });
  });

  describe("get invoice items", () => {
    it("should get invoice items", async () => {
      invoiceItemsRepository.setup((x) => x.findAll).returns(() => Promise.resolve([invoiceItem]));
      const invoiceItemsUseCase = new InvoiceItemUseCase(
        invoiceItemsRepository.object(),
        logger,
        translator,
        currentUser,
      );
      const filters: ItemsFilterInput = {
        limit: 10,
        direction: "ASC",
      };

      const result = await invoiceItemsUseCase.findAll(filters);

      expect(result).toEqual([invoiceItem]);
    });
  });
});
