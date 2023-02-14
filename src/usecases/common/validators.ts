import { Pagination } from "../../entities/types/pagination";

export function validateFiltersInput<T extends Pagination>(input: T): Map<string, string> {
  const errors: Map<string, string> = new Map();
  if (!input.limit || input.limit < 1) {
    errors.set("limit", "Limit must be at least 1");
  }

  if (input.cursor && input.cursor.length < 1 && isNaN(new Date(input.cursor).valueOf())) {
    errors.set("cursor", "Cursor must be a valid date string");
  }

  if (!input.direction || (input.direction !== "ASC" && input.direction !== "DESC")) {
    errors.set("direction", "Direction must be either ASC or DESC");
  }

  return errors;
}
