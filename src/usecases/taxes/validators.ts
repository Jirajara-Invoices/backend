import { CreateTaxInput, UpdateTaxInput } from "./interfaces";
import { TaxCalType } from "../../entities/models/taxes";

export function validateCreateTaxInput(input: CreateTaxInput): Map<string, string> {
  const errors: Map<string, string> = new Map();
  if (!input.name) {
    errors.set("name", "A name is required");
  }
  if (!input.rate) {
    errors.set("rate", "A rate is required");
  }
  if (!input.calc_type || !(Object.values(TaxCalType) as string[]).includes(input.calc_type)) {
    errors.set("calc_type", "A calculation type is required");
  }

  return errors;
}

export function validateUpdateTaxInput(input: UpdateTaxInput): Map<string, string> {
  const errors: Map<string, string> = new Map();
  if (!input.id) {
    errors.set("id", "An id is required");
  }

  if (input.calc_type && !(Object.values(TaxCalType) as string[]).includes(input.calc_type)) {
    errors.set("calc_type", "A calc_type is required");
  }

  return errors;
}
