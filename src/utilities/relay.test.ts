import { decodeCursor, encodeCursor, mapGenericFilters } from "./relay";

const encodedCursor = "VXNlcjoxOjIwMjMtMDEtMDE=";

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
      after: "VXNlcjoxOjIwMjMtMDEtMDE=",
      last: undefined,
      before: undefined,
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
    const args = {};
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
      before: "VXNlcjoxOjIwMjMtMDEtMDE=",
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
    };
    expect(() => mapGenericFilters(args)).toThrowError("Cannot specify both first and last");
  });

  it("should return error with before and after", () => {
    const args = {
      first: undefined,
      after: "VXNlcjoxOjIwMjMtMDEtMDE=",
      last: undefined,
      before: "VXNlcjoxOjIwMjMtMDEtMDE=",
    };
    expect(() => mapGenericFilters(args)).toThrowError("Cannot specify both before and after");
  });
});
