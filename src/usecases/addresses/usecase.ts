import { EMAIL_REGEX } from "../../entities/constants";
import { User } from "../../entities/models/users";
import { Address, AddressType } from "../../entities/models/addresses";
import {
  AddressFilterInput,
  AddressRepositoryPort,
  AddressUseCasePort,
  CreateAddressInput,
  UpdateAddressInput,
} from "./interfaces";
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
    const errors = this.validateCreateAddressInput(input);
    if (errors.size > 0) {
      throw new ValidationError(this.translator.translate("validationError"), errors);
    }
    return await this.repository.create(input, this.getCurrentUserId());
  }

  async update(input: UpdateAddressInput): Promise<Address> {
    const errors = this.validateUpdateAddressInput(input);
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

  private validateCreateAddressInput(input: CreateAddressInput): Map<string, string> {
    const errors: Map<string, string> = new Map();

    if (!input.name || input.name.length < 3) {
      errors.set("name", this.translator.translate("inputNameRequiredError", { length: "3" }));
    }
    if (
      !input.type &&
      !(input.type === AddressType.Personal && input.type === AddressType.Clients)
    ) {
      errors.set("type", this.translator.translate("inputAddressTypeRequiredError"));
    }
    if (!input.country || input.country.length !== 2) {
      errors.set("country", this.translator.translate("inputCountryRequiredError"));
    }
    if (input.email && !EMAIL_REGEX.test(input.email)) {
      errors.set("email", this.translator.translate("inputAddressEmailError"));
    }

    return errors;
  }

  private validateUpdateAddressInput(input: UpdateAddressInput): Map<string, string> {
    const errors: Map<string, string> = new Map();

    if (!input.id) {
      errors.set("id", this.translator.translate("inputIdError"));
    }
    if (input.name && input.name.length < 3) {
      errors.set("name", this.translator.translate("inputNameRequiredError", { length: "3" }));
    }
    if (
      input.type &&
      !(input.type === AddressType.Personal || input.type === AddressType.Clients)
    ) {
      errors.set("type", this.translator.translate("inputAddressTypeRequiredError"));
    }
    if (input.country && input.country.length !== 2) {
      errors.set("country", this.translator.translate("inputCountryRequiredError"));
    }

    return errors;
  }
}
