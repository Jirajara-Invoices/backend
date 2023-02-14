import { Pagination } from "../../entities/types/pagination";
import { validateFiltersInput } from "./validators";

describe("validators tests", () => {
  it("should validate filters input", () => {
    const input: Pagination = {
      limit: 10,
      cursor: "2021-01-01",
      direction: "ASC",
    };
    const errors = validateFiltersInput(input);
    expect(errors.size).toBe(0);
  });

  it("should validate filters input with invalid limit", () => {
    const input: Pagination = {
      limit: -1,
      cursor: "2021-01-01",
      direction: "ASC",
    };
    const errors = validateFiltersInput(input);
    expect(errors.size).toBe(1);
    expect(errors.get("limit")).toBe("Limit must be at least 1");
  });
});
