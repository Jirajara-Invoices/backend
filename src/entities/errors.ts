import { GraphQLError } from "graphql/error";
import { mapToArray } from "../utilities/arrays";

export class ValidationError extends Error {
  private readonly errors: Map<string, string>;
  constructor(message: string, errors: Map<string, string>) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }

  getFieldErrors(): Map<string, string> {
    return this.errors;
  }
}

export class UnknownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnknownError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function mapGraphQLError(error: ValidationError): GraphQLError {
  return new GraphQLError(error.message, {
    extensions: {
      code: "VALIDATION_ERROR",
      fieldErrors: mapToArray(error.getFieldErrors()),
    },
  });
}
