import { CreateAddressInput, UpdateAddressInput } from "./interfaces";
import { AddressType } from "../../entities/models/addresses";
import { EMAIL_REGEX } from "../../entities/constants";

export function validateCreateAddressInput(input: CreateAddressInput): Map<string, string> {
  const errors: Map<string, string> = new Map();

  if (!input.name || input.name.length < 3) {
    errors.set("name", "Name must be at least 3 characters long");
  }
  if (!input.type && !(input.type === AddressType.Personal && input.type === AddressType.Clients)) {
    errors.set("type", "Type must be set to Personal or Clients");
  }
  if (!input.country || input.country.length !== 2) {
    errors.set("country", "Country must be a 2 character ISO code");
  }
  if (input.email && !EMAIL_REGEX.test(input.email)) {
    errors.set(
      "email",
      "You must provide a valid email address or leave it blank, if you don't want to provide one",
    );
  }

  return errors;
}

export function validateUpdateAddressInput(input: UpdateAddressInput): Map<string, string> {
  const errors: Map<string, string> = new Map();

  if (!input.id) {
    errors.set("id", "An id is mandatory");
  }
  if (input.name && input.name.length < 3) {
    errors.set("name", "Name must be at least 3 characters long");
  }
  if (input.type && !(input.type === AddressType.Personal || input.type === AddressType.Clients)) {
    errors.set("type", "Type must be set to Personal or Clients");
  }
  if (input.country && input.country.length !== 2) {
    errors.set("country", "Country must be a 2 character ISO code");
  }

  return errors;
}
