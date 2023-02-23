import { IMock, It, Mock } from "moq.ts";
import { User, UserRole } from "../../entities/models/users";
import { Tax, TaxCalcType } from "../../entities/models/taxes";
import { LoggerUseCasePort, TranslationUseCasePort } from "../common/interfaces";
import {
  CreateTaxInput,
  TaxesFilterInput,
  TaxesRepositoryPort,
  UpdateTaxInput,
} from "./interfaces";
import { TaxUseCase } from "./usecase";
import { ValidationError } from "../../entities/errors";

describe("taxes test suites", () => {
  let taxesRepository: IMock<TaxesRepositoryPort>;
  let currentUser: User;
  let logger: LoggerUseCasePort;
  let translator: TranslationUseCasePort;
  let tax: Tax;

  beforeEach(() => {
    taxesRepository = new Mock<TaxesRepositoryPort>();
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
    tax = {
      id: "1",
      user_id: currentUser.id,
      name: "name",
      rate: 1,
      calc_type: TaxCalcType.Fixed,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: undefined,
    };
  });

  describe("create tax", () => {
    it("should create a tax", async () => {
      taxesRepository.setup((x) => x.create).returns(() => Promise.resolve(tax));
      const taxesUseCase = new TaxUseCase(
        taxesRepository.object(),
        logger,
        translator,
        currentUser,
      );

      const input: CreateTaxInput = {
        name: "name",
        rate: 1,
        calc_type: TaxCalcType.Fixed,
      };

      const result = await taxesUseCase.create(input);

      expect(result).toEqual(tax);
    });

    it("should throw an error if the name is not provided", async () => {
      const taxesUseCase = new TaxUseCase(
        taxesRepository.object(),
        logger,
        translator,
        currentUser,
      );
      const input: CreateTaxInput = {
        name: "",
        rate: 1,
        calc_type: TaxCalcType.Fixed,
      };

      await expect(taxesUseCase.create(input)).rejects.toThrowError(ValidationError);
    });

    it("should throw an error if the rate is not provided", async () => {
      const taxesUseCase = new TaxUseCase(
        taxesRepository.object(),
        logger,
        translator,
        currentUser,
      );
      const input: CreateTaxInput = {
        name: "name",
        rate: 0,
        calc_type: TaxCalcType.Fixed,
      };

      await expect(taxesUseCase.create(input)).rejects.toThrowError(ValidationError);
    });
  });

  describe("update tax", () => {
    it("should update a tax", async () => {
      tax.name = "name 2";
      taxesRepository
        .setup((x) => x.update)
        .returns(() => Promise.resolve(tax))
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(tax));
      const taxesUseCase = new TaxUseCase(
        taxesRepository.object(),
        logger,
        translator,
        currentUser,
      );

      const input: UpdateTaxInput = {
        id: tax.id,
        name: tax.name,
      };

      const result = await taxesUseCase.update(input);

      expect(result).toEqual(tax);
    });

    it("should throw an error if the tax does belong to the user", async () => {
      tax.name = "name 2";
      taxesRepository
        .setup((x) => x.update)
        .returns(() => Promise.resolve(tax))
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(tax));
      const taxesUseCase = new TaxUseCase(
        taxesRepository.object(),
        logger,
        translator,
        currentUser,
      );
      currentUser.id = "2";

      const input: UpdateTaxInput = {
        id: tax.id,
        name: tax.name,
      };

      await expect(taxesUseCase.update(input)).rejects.toThrowError(ValidationError);
    });
  });

  describe("delete tax", () => {
    it("should delete a tax", async () => {
      taxesRepository
        .setup((x) => x.delete)
        .returns(() => Promise.resolve())
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(tax));
      const taxesUseCase = new TaxUseCase(
        taxesRepository.object(),
        logger,
        translator,
        currentUser,
      );

      await expect(taxesUseCase.delete(tax.id)).resolves.toBeUndefined();
    });

    it("should throw an error if the tax does belong to the user", async () => {
      taxesRepository
        .setup((x) => x.delete)
        .returns(() => Promise.resolve())
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(tax));
      const taxesUseCase = new TaxUseCase(
        taxesRepository.object(),
        logger,
        translator,
        currentUser,
      );
      currentUser.id = "2";

      await expect(taxesUseCase.delete(tax.id)).rejects.toThrowError(ValidationError);
    });
  });

  describe("get tax by id", () => {
    it("should get a tax by id", async () => {
      taxesRepository.setup((x) => x.findByID).returns(() => Promise.resolve(tax));
      const taxesUseCase = new TaxUseCase(
        taxesRepository.object(),
        logger,
        translator,
        currentUser,
      );

      const result = await taxesUseCase.findByID(tax.id);

      expect(result).toEqual(tax);
    });

    it("should throw an error if the tax does belong to the user", async () => {
      taxesRepository.setup((x) => x.findByID).returns(() => Promise.resolve(tax));
      const taxesUseCase = new TaxUseCase(
        taxesRepository.object(),
        logger,
        translator,
        currentUser,
      );
      currentUser.id = "2";

      await expect(taxesUseCase.findByID(tax.id)).rejects.toThrowError(ValidationError);
    });
  });

  describe("get taxes", () => {
    it("should get taxes", async () => {
      taxesRepository.setup((x) => x.findAll).returns(() => Promise.resolve([tax]));
      const taxesUseCase = new TaxUseCase(
        taxesRepository.object(),
        logger,
        translator,
        currentUser,
      );
      const filters: TaxesFilterInput = {
        direction: "ASC",
        limit: 10,
      };

      const result = await taxesUseCase.findAll(filters);

      expect(result).toEqual([tax]);
    });

    it("should throw an error if the tax does belong to the user", async () => {
      taxesRepository.setup((x) => x.findAll).returns(() => Promise.resolve([tax]));
      const taxesUseCase = new TaxUseCase(
        taxesRepository.object(),
        logger,
        translator,
        currentUser,
      );
      const filters: TaxesFilterInput = {
        userId: "2",
        direction: "ASC",
        limit: 10,
      };

      await expect(taxesUseCase.findAll(filters)).rejects.toThrowError(ValidationError);
    });
  });
});
