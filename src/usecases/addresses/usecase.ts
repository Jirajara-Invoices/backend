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
import { LoggerUseCasePort, TranslationUseCasePort } from "../common/interfaces";
import { BaseUseCase } from "../common/base";

export class AddressUseCase extends BaseUseCase implements AddressUseCasePort {
  constructor(
    private readonly repository: AddressRepositoryPort,
    private readonly logger: LoggerUseCasePort,
    translator: TranslationUseCasePort,
    currentUser: User | null,
  ) {
    super(translator, currentUser);
  }

  async create(input: CreateAddressInput): Promise<Address> {
    const errors = validateCreateAddressInput(input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }
    return await this.repository.create(input, this.getCurrentUserId());
  }

  async update(input: UpdateAddressInput): Promise<Address> {
    const errors = validateUpdateAddressInput(input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }

    const address = await this.repository.findByID(input.id);
    if (!this.isCurrentUserAuthorized(address.user_id)) {
      throw new ValidationError(this.translator.translate("updatePermissionsError"), errors);
    }
    return await this.repository.update(input, address.user_id);
  }

  async delete(id: string): Promise<void> {
    const address = await this.repository.findByID(id);
    if (!this.isCurrentUserAuthorized(address.user_id)) {
      throw new ValidationError(this.translator.translate("deleteError"), new Map());
    }
    await this.repository.delete(id, address.user_id);
  }

  async findByID(id: string): Promise<Address> {
    const address = await this.repository.findByID(id);
    if (!this.isCurrentUserAuthorized(address.user_id)) {
      throw new ValidationError(this.translator.translate("viewError"), new Map());
    }

    return address;
  }

  async findAll(filter: AddressFilterInput): Promise<Address[]> {
    this.validateFilterInputWithUser(filter);

    return await this.repository.find(filter);
  }
}
