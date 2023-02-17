import { Tax, TaxCalType } from "../../entities/models/taxes";
import { BaseUseCase } from "../common/base";
import { Pagination } from "../../entities/types/pagination";

export interface CreateTaxInput {
  name: string;
  rate: number;
  calc_type: TaxCalType;
}

export interface UpdateTaxInput extends Partial<CreateTaxInput> {
  id: string;
}

export interface TaxesFilterInput extends Pagination {
  userId?: string;
  name?: string;
  rate?: number;
  calc_type?: TaxCalType;
}

export interface TaxesUseCasePort extends BaseUseCase {
  create(input: CreateTaxInput): Promise<Tax>;
  update(input: UpdateTaxInput): Promise<Tax>;
  delete(id: string): Promise<void>;
  findByID(id: string): Promise<Tax>;
  findAll(filter: TaxesFilterInput): Promise<Tax[]>;
}

export interface TaxesRepositoryPort {
  create(input: CreateTaxInput, user_id: string): Promise<Tax>;
  update(input: UpdateTaxInput, user_id: string): Promise<Tax>;
  delete(id: string): Promise<void>;
  findByID(id: string): Promise<Tax>;
  findAll(filter: TaxesFilterInput): Promise<Tax[]>;
}
