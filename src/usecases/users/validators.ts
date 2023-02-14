import type { CreateUserInput, UpdateUserInput } from "./interfaces";
import { EMAIL_REGEX } from "../../entities/constants";

export function validateCreateUserInput(input: CreateUserInput): Map<string, string> {
  const errors: Map<string, string> = new Map();
  if (!input.name || input.name.length < 3) {
    errors.set("name", "Name must be at least 3 characters long");
  }
  if (!input.email || !EMAIL_REGEX.test(input.email)) {
    errors.set("email", "A valid email address is required");
  }
  if (!input.password || input.password.length < 8) {
    errors.set("password", "Password must be at least 8 characters long");
  }
  if (!input.country || input.country.length !== 2) {
    errors.set("country", "Country must be a 2 character ISO code");
  }

  return errors;
}

export function validateUpdateUserInput(input: UpdateUserInput): Map<string, string> {
  const errors: Map<string, string> = new Map();
  if (!input.id) {
    errors.set("id", "An id is required");
  }

  if (input.name && input.name.length < 3) {
    errors.set("name", "Name must be at least 3 characters long");
  }

  if (input.email && !EMAIL_REGEX.test(input.email)) {
    errors.set("email", "A valid email address is required");
  }

  if (input.password && input.password.length < 8) {
    errors.set("password", "Password must be at least 8 characters long");
  }

  if (input.country && input.country.length !== 2) {
    errors.set("country", "Country must be a 2 character ISO code");
  }

  return errors;
}

export function validateLoginInput(email: string, password: string): Map<string, string> {
  const errors: Map<string, string> = new Map();
  if (!email || !EMAIL_REGEX.test(email)) {
    errors.set("email", "A valid email address is required");
  }
  if (!password || password.length < 8) {
    errors.set("password", "Password must be at least 8 characters long");
  }

  return errors;
}
