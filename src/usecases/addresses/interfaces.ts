import { Address, AddressType } from "../../entities/models/addresses";
import { Pagination } from "../../entities/types/pagination";
import { BaseUseCase } from "../common/base";

export interface CreateAddressInput {
  type: AddressType;
  name: string;
  tax_id?: string;
  email?: string;
  street?: string;
  number?: string;
  comment?: string;
  zipcode?: string;
  city?: string;
  state?: string;
  country: string;
}

export interface UpdateAddressInput extends Partial<CreateAddressInput> {
  id: string;
}

export interface AddressFilterInput extends Pagination {
  name?: string;
  userId?: string;
  type?: AddressType;
  email?: string;
  taxId?: string;
}

export interface AddressUseCasePort extends BaseUseCase {
  create(input: CreateAddressInput): Promise<Address>;
  update(input: UpdateAddressInput): Promise<Address>;
  delete(id: string): Promise<void>;
  findByID(id: string): Promise<Address>;
  findAll(filter: AddressFilterInput): Promise<Address[]>;
}

export interface AddressRepositoryPort {
  create(input: CreateAddressInput, userId: string): Promise<Address>;
  update(input: UpdateAddressInput, userId: string): Promise<Address>;
  delete(id: string, userId: string): Promise<void>;
  findByID(id: string): Promise<Address>;
  find(filter: AddressFilterInput): Promise<Address[]>;
}
