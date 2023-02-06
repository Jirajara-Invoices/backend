import { makePool } from "./mock";

describe("mock db", () => {
  it("should return a mock db instance", () => {
    expect(makePool([])).toBeTruthy();
  });
});
