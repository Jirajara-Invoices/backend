import { User } from "../../entities/models/users";
import { Address } from "../../entities/models/addresses";
import {
  AddressFilterInput,
  AddressRepositoryPort,
  AddressUseCasePort,
  CreateAddressInput,
  UpdateAddressInput,
} from "./interfaces";
import { validateCreateAddressInput, validateUpdateAddressInput } from "./validators";
import { ValidationError } from "../../entities/errors";
import { LoggerUseCasePort } from "../common/interfaces";
import { mapToString } from "../../utilities/arrays";
import { BaseUseCase } from "../common/base";
import { validateFiltersInput } from "../common/validators";

export class AddressUseCase extends BaseUseCase implements AddressUseCasePort {
  constructor(
    private readonly repository: AddressRepositoryPort,
    private readonly logger: LoggerUseCasePort,
    currentUser: User,
  ) {
    super(currentUser);
  }

  async create(input: CreateAddressInput): Promise<Address> {
    const errors = validateCreateAddressInput(input);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for address creation: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for address creation", errors);
    }
    return await this.repository.save(input, this.getCurrentUserId());
  }

  async update(input: UpdateAddressInput): Promise<Address> {
    const errors = validateUpdateAddressInput(input);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for update address: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for update address", errors);
    }

    const address = await this.repository.findByID(input.id);
    if (!this.isCurrentUserAuthorized(address.user_id)) {
      this.logger.error(`User is not authorized to update this address: ${mapToString(errors)}`);
      throw new ValidationError("User is not authorized to update this address", errors);
    }
    return await this.repository.update(input, address.user_id);
  }

  async delete(id: string): Promise<void> {
    const address = await this.repository.findByID(id);
    if (!this.isCurrentUserAuthorized(address.user_id)) {
      this.logger.error(`User is not authorized to update this address`);
      throw new ValidationError("User is not authorized to update this address", new Map());
    }
    await this.repository.delete(id, address.user_id);
  }

  async findByID(id: string): Promise<Address> {
    const address = await this.repository.findByID(id);
    if (!this.isCurrentUserAuthorized(address.user_id)) {
      this.logger.error(`User is not authorized to see this address`);
      throw new ValidationError("User is not authorized to see this address", new Map());
    }

    return address;
  }

  async findAll(filter: AddressFilterInput): Promise<Address[]> {
    const errors = validateFiltersInput(filter);
    if (errors.size > 0) {
      this.logger.error(`Invalid input for address filters: ${mapToString(errors)}`);
      throw new ValidationError("Invalid input for address filters", errors);
    }

    if (
      (!filter.userId && !this.isCurrentUserAdmin()) ||
      !this.isCurrentUserAuthorized(filter.userId!)
    ) {
      this.logger.error(`User is not authorized to see this address`);
      throw new ValidationError("User is not authorized to see this address", new Map());
    }

    return await this.repository.find(filter);
  }
}
