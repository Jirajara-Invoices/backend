import { IMock, It, Mock } from "moq.ts";

import { User, UserRole } from "../../entities/models/users";
import { Address, AddressType } from "../../entities/models/addresses";
import { LoggerUseCasePort } from "../common/interfaces";
import {
  AddressFilterInput,
  AddressRepositoryPort,
  CreateAddressInput,
  UpdateAddressInput,
} from "./interfaces";
import { AddressUseCase } from "./usecase";
import { ValidationError } from "../../entities/errors";

describe("Addresses tests suites", () => {
  let addressRepository: IMock<AddressRepositoryPort>;
  let currentUser: User;
  let address: Address;
  let logger: LoggerUseCasePort;

  beforeEach(() => {
    addressRepository = new Mock<AddressRepositoryPort>();
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

  describe("create address", () => {
    it("should create an address", async () => {
      addressRepository.setup((x) => x.create).returns(() => Promise.resolve(address));
      const addressUseCase = new AddressUseCase(addressRepository.object(), logger, currentUser);
      const input: CreateAddressInput = {
        type: address.type,
        name: address.name,
        tax_id: address.tax_id,
        country: address.country,
        email: address.email,
        number: address.number,
        comment: address.comment,
        street: address.street,
        zipcode: address.zipcode,
        city: address.city,
        state: address.state,
      };

      const createdAddress = await addressUseCase.create(input);
      expect(createdAddress).toEqual(address);
    });

    it("should throw an error if the input is invalid", async () => {
      addressRepository.setup((x) => x.create).returns(() => Promise.reject(ValidationError));
      const addressUseCase = new AddressUseCase(addressRepository.object(), logger, currentUser);
      const input: CreateAddressInput = {
        type: address.type,
        name: "a",
        tax_id: address.tax_id,
        country: address.country,
      };

      await expect(addressUseCase.create(input)).rejects.toThrowError(ValidationError);
    });
  });

  describe("update address", () => {
    it("should update an address", async () => {
      address.type = AddressType.Clients;
      addressRepository
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(address))
        .setup((x) => x.update)
        .returns(() => Promise.resolve(address));
      const addressUseCase = new AddressUseCase(addressRepository.object(), logger, currentUser);
      const input: UpdateAddressInput = {
        id: address.id,
        type: address.type,
      };

      const updatedAddress = await addressUseCase.update(input);
      expect(updatedAddress).toEqual(address);
    });

    it("should throw an error if the input is invalid", async () => {
      addressRepository
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(address))
        .setup((x) => x.update)
        .returns(() => Promise.reject(ValidationError));
      const addressUseCase = new AddressUseCase(addressRepository.object(), logger, currentUser);
      const input: UpdateAddressInput = {
        id: address.id,
        name: "a",
      };

      await expect(addressUseCase.update(input)).rejects.toThrowError(ValidationError);
    });

    it("should throw an error if the address does not belongs to the user", async () => {
      address.user_id = "2";
      addressRepository.setup((x) => x.findByID).returns(() => Promise.resolve(address));
      const addressUseCase = new AddressUseCase(addressRepository.object(), logger, currentUser);
      const input: UpdateAddressInput = {
        id: address.id,
        name: "address name",
      };

      await expect(addressUseCase.update(input)).rejects.toThrowError(ValidationError);
    });
  });

  describe("delete address", () => {
    it("should delete an address", async () => {
      addressRepository
        .setup((x) => x.findByID)
        .returns(() => Promise.resolve(address))
        .setup((x) => x.delete)
        .returns(() => Promise.resolve());
      const addressUseCase = new AddressUseCase(addressRepository.object(), logger, currentUser);
      const deletedAddress = await addressUseCase.delete(address.id);

      expect(deletedAddress).toBeUndefined();
    });

    it("should throw an error if the address does not belongs to the user", async () => {
      address.user_id = "2";
      addressRepository.setup((x) => x.findByID).returns(() => Promise.resolve(address));
      const addressUseCase = new AddressUseCase(addressRepository.object(), logger, currentUser);

      await expect(addressUseCase.delete(address.id)).rejects.toThrowError(ValidationError);
    });
  });

  describe("find address by id", () => {
    it("should get an address", async () => {
      addressRepository.setup((x) => x.findByID).returns(() => Promise.resolve(address));
      const addressUseCase = new AddressUseCase(addressRepository.object(), logger, currentUser);
      const foundAddress = await addressUseCase.findByID(address.id);

      expect(foundAddress).toEqual(address);
    });

    it("should throw an error if the address does not belongs to the user", async () => {
      address.user_id = "2";
      addressRepository.setup((x) => x.findByID).returns(() => Promise.resolve(address));
      const addressUseCase = new AddressUseCase(addressRepository.object(), logger, currentUser);

      await expect(addressUseCase.findByID(address.id)).rejects.toThrowError(ValidationError);
    });
  });

  describe("find address by filters", () => {
    it("should find addresses", async () => {
      addressRepository.setup((x) => x.find).returns(() => Promise.resolve([address]));
      const addressUseCase = new AddressUseCase(addressRepository.object(), logger, currentUser);
      const filter: AddressFilterInput = {
        direction: "ASC",
        limit: 1,
        userId: address.user_id,
      };
      const foundAddress = await addressUseCase.findAll(filter);

      expect(foundAddress).toEqual([address]);
    });

    it("should throw an error if the addresses does not belongs to the user", async () => {
      const addressUseCase = new AddressUseCase(addressRepository.object(), logger, currentUser);
      const filter: AddressFilterInput = {
        direction: "ASC",
        limit: 1,
        userId: "2",
      };

      await expect(addressUseCase.findAll(filter)).rejects.toThrowError(ValidationError);
    });
  });
});
