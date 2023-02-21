import { QueryResultRow } from "slonik";
import { Tax, TaxCalcType } from "../../../entities/models/taxes";
import { makePool } from "../../../utilities/mock";
import { TaxRepository } from "./taxes";
import {
  CreateTaxInput,
  TaxesFilterInput,
  UpdateTaxInput,
} from "../../../usecases/taxes/interfaces";

describe("TaxRepository", () => {
  let tax: Tax;
  let taxResult: QueryResultRow[];

  beforeEach(() => {
    tax = {
      id: "1",
      user_id: "1",
      calc_type: TaxCalcType.Fixed,
      name: "tax",
      rate: 10,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: undefined,
    };

    taxResult = [
      {
        id: tax.id,
        user_id: tax.user_id,
        calc_type: tax.calc_type,
        name: tax.name,
        rate: tax.rate,
        created_at: tax.created_at.toISOString(),
        updated_at: tax.updated_at.toISOString(),
        deleted_at: null,
      },
    ];
  });

  describe("findByID", () => {
    it("should return a tax", async () => {
      const dbPool = makePool(taxResult);
      const repo = new TaxRepository(dbPool);
      const dbTax = await repo.findByID(tax.id);
      expect(dbTax).toEqual(tax);
    });

    it("should throw an error if the tax does not exist", async () => {
      const dbPool = makePool([]);
      const repo = new TaxRepository(dbPool);
      await expect(repo.findByID(tax.id)).rejects.toThrow(Error);
    });
  });

  describe("findAll", () => {
    it("should return all taxes", async () => {
      const dbPool = makePool(taxResult);
      const repo = new TaxRepository(dbPool);
      const filter: TaxesFilterInput = {
        limit: 10,
        direction: "ASC",
      };
      const dbTaxes = await repo.findAll(filter);
      expect(dbTaxes).toEqual([tax]);
    });

    it("should return an empty list", async () => {
      const dbPool = makePool([]);
      const repo = new TaxRepository(dbPool);
      const filter: TaxesFilterInput = {
        limit: 10,
        direction: "ASC",
      };
      const dbTaxes = await repo.findAll(filter);
      expect(dbTaxes).toEqual([]);
    });
  });

  describe("create", () => {
    it("should create a tax", async () => {
      const dbPool = makePool(taxResult);
      const repo = new TaxRepository(dbPool);
      const input: CreateTaxInput = {
        calc_type: TaxCalcType.Fixed,
        name: tax.name,
        rate: tax.rate,
      };
      const dbTax = await repo.create(input, tax.user_id);
      expect(dbTax).toEqual(tax);
    });
  });

  describe("update", () => {
    it("should update a tax", async () => {
      const dbPool = makePool(taxResult);
      const repo = new TaxRepository(dbPool);
      const input: UpdateTaxInput = {
        id: tax.id,
        calc_type: TaxCalcType.Fixed,
      };
      const dbTax = await repo.update(input, tax.user_id);
      expect(dbTax).toEqual(tax);
    });
  });

  describe("delete", () => {
    it("should delete a tax", async () => {
      const dbPool = makePool(taxResult);
      const repo = new TaxRepository(dbPool);
      const dbTax = await repo.delete(tax.id);
      expect(dbTax).toBeUndefined();
    });
  });
});
