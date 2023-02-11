import { UserRole } from "../entities/models/users";
import { createMockContextFactory, makePool } from "./mock";

describe("mock utils", () => {
  describe("mock db", () => {
    it("should return a mock db instance", () => {
      expect(makePool([])).toBeTruthy();
    });
  });

  describe("mock utils", () => {
    it("should create a mock context factory", () => {
      const contextFactory = createMockContextFactory();
      const context = contextFactory(null);
      expect(context).toMatchSnapshot();
    });

    it("should create a mock context factory with a user", () => {
      const user = {
        id: "1",
        name: "John Doe",
        email: "example@example.com",
        country: "VE",
        role: UserRole.User,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const contextFactory = createMockContextFactory();
      const context = contextFactory(user);
      expect(context.auth.user).toBe(user);
    });
  });
});
