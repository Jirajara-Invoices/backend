import { decodeCursor, encodeCursor, mapGenericFilters } from "./relay";

const encodedCursor = "VXNlcjsxOzIwMjMtMDEtMDE=";

describe("relay utilities tests", () => {
  it("should decode cursor", () => {
    const decodedCursor = decodeCursor(encodedCursor);
    expect(decodedCursor).toEqual(
      new Map([
        ["type", "User"],
        ["id", "1"],
        ["createdAt", "2023-01-01"],
      ]),
    );
  });

  it("should encode cursor", () => {
    const encodedCursor = encodeCursor("User", "1", "2023-01-01");
    expect(encodedCursor).toEqual(encodedCursor);
  });

  it("should map filters", () => {
    const args = {
      first: 10,
      after: encodedCursor,
      last: undefined,
      before: undefined,
      filter: {},
    };
    const input = mapGenericFilters(args);

    expect(input).toEqual({
      limit: 10,
      cursor: "2023-01-01",
      cursorDirection: "ASC",
      direction: "ASC",
    });
  });

  it("should map filters without params", () => {
    const args = {
      filter: {},
    };
    const input = mapGenericFilters(args);

    expect(input).toEqual({
      limit: 10,
      cursor: undefined,
      cursorDirection: undefined,
      direction: "ASC",
    });
  });

  it("should map filters with last", () => {
    const args = {
      first: undefined,
      after: undefined,
      last: 10,
      before: encodedCursor,
      filter: {},
    };
    const input = mapGenericFilters(args);

    expect(input).toEqual({
      limit: 10,
      cursor: "2023-01-01",
      cursorDirection: "DESC",
      direction: "DESC",
    });
  });

  it("should return error with first and last", () => {
    const args = {
      first: 10,
      after: undefined,
      last: 10,
      before: undefined,
      filter: {},
    };
    expect(() => mapGenericFilters(args)).toThrowError("Cannot specify both first and last");
  });

  it("should return error with before and after", () => {
    const args = {
      first: undefined,
      after: encodedCursor,
      last: undefined,
      before: encodedCursor,
      filter: {},
    };
    expect(() => mapGenericFilters(args)).toThrowError("Cannot specify both before and after");
  });
});
