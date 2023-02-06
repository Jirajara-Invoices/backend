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

export class GraphQLError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GraphQLError";
  }
}
