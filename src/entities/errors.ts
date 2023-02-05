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
