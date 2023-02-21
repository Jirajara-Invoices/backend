import { QueryResultRow } from "slonik";

import { Address, AddressType } from "../../../entities/models/addresses";
import { makePool } from "../../../utilities/mock";
import { AddressRepository } from "./addresses";
import { AddressFilterInput, CreateAddressInput } from "../../../usecases/addresses/interfaces";
import { UpdateUserInput } from "../../../usecases/users/interfaces";

describe("AddressesRepository", () => {
  let address: Address;
  let addressResult: QueryResultRow[];

  beforeEach(() => {
    address = {
      id: "1",
      user_id: "1",
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

    addressResult = [
      {
        id: address.id,
        user_id: address.user_id,
        type: address.type,
        name: address.name,
        tax_id: address.tax_id!,
        email: address.email!,
        number: address.number!,
        comment: address.comment!,
        street: address.street!,
        zipcode: address.zipcode!,
        city: address.city!,
        state: address.state!,
        country: address.country,
        created_at: address.created_at.toISOString(),
        updated_at: address.updated_at.toISOString(),
        deleted_at: null,
      },
    ];
  });

  describe("findByID", () => {
    it("should return an address", async () => {
      const dbPool = makePool(addressResult);
      const repo = new AddressRepository(dbPool);
      const dbAddress = await repo.findByID(address.id);

      expect(dbAddress).toEqual(address);
    });

    it("should raise NotFoundError", async () => {
      const dbPool = makePool([]);
      const repo = new AddressRepository(dbPool);

      await expect(repo.findByID(address.id)).rejects.toThrowError(Error);
    });
  });

  describe("find", () => {
    it("should return a list of addresses", async () => {
      const dbPool = makePool(addressResult);
      const repo = new AddressRepository(dbPool);
      const filter: AddressFilterInput = {
        limit: 10,
        direction: "ASC",
      };
      const dbAddresses = await repo.find(filter);

      expect(dbAddresses).toEqual([address]);
    });

    it("should return an empty list", async () => {
      const dbPool = makePool([]);
      const repo = new AddressRepository(dbPool);

      const filter: AddressFilterInput = {
        limit: 10,
        direction: "ASC",
      };
      const dbAddresses = await repo.find(filter);

      expect(dbAddresses).toEqual([]);
    });
  });

  describe("save", () => {
    it("should save an address", async () => {
      const dbPool = makePool(addressResult);
      const repo = new AddressRepository(dbPool);
      const input: CreateAddressInput = {
        type: address.type,
        name: address.name,
        tax_id: address.tax_id,
        email: address.email,
        number: address.number,
        comment: address.comment,
        street: address.street,
        zipcode: address.zipcode,
        city: address.city,
        state: address.state,
        country: address.country,
      };
      const dbAddress = await repo.create(input, address.user_id);

      expect(dbAddress).toEqual(address);
    });
  });

  describe("update", () => {
    it("should update an address", async () => {
      address.name = "new name";
      const input: UpdateUserInput = {
        id: address.id,
        name: address.name,
      };
      addressResult[0].name = input.name!;
      const dbPool = makePool(addressResult);
      const repo = new AddressRepository(dbPool);
      const dbAddress = await repo.update(input, address.user_id);

      expect(dbAddress).toEqual(address);
    });
  });

  describe("delete", () => {
    it("should delete an address", async () => {
      const dbPool = makePool(addressResult);
      const repo = new AddressRepository(dbPool);
      const dbAddress = await repo.delete(address.id, address.user_id);

      expect(dbAddress).toBeUndefined();
    });
  });
});
