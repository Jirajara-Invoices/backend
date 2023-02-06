import * as argon2 from "argon2";
import { NotFoundError } from "slonik";

import { User, UserRole } from "../../../entities/models/users";
import { UnauthorizedError, UnknownError } from "../../../entities/errors";
import { makePool } from "../../../utilities/mock";
import { UserRepository } from "./users";
import { CreateUserInput } from "../../../usecases/users/interfaces";

describe("UsersRepository tests", () => {
  let user: User;

  beforeEach(() => {
    user = {
      id: "1",
      name: "John Doe",
      email: "example@example.com",
      country: "US",
      role: UserRole.User,
      created_at: new Date(),
      updated_at: new Date(),
    };
  });

  describe("findByID", () => {
    it("should return a user", async () => {
      const pool = makePool([
        {
          id: user.id,
          name: user.name,
          email: user.email,
          country: user.country,
          role: user.role,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
          deleted_at: null,
        },
      ]);

      const userRepository = new UserRepository(pool);
      const result = await userRepository.findByID(user.id);

      expect(result).toEqual(user);
    });

    it("should raise NotFoundError", async () => {
      const pool = makePool([]);
      const userRepository = new UserRepository(pool);

      await expect(userRepository.findByID("1")).rejects.toThrowError(NotFoundError);
    });
  });

  describe("find", () => {
    it("should return a list of users", async () => {
      const pool = makePool([
        {
          id: user.id,
          name: user.name,
          email: user.email,
          country: user.country,
          role: user.role,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
          deleted_at: null,
        },
      ]);

      const userRepository = new UserRepository(pool);
      const result = await userRepository.find({
        email: "exam",
        limit: 10,
        direction: "ASC",
      });

      expect(result).toStrictEqual([user]);
      expect(result).toContainEqual(user);
      expect(result).toHaveLength(1);
    });

    it("should return an empty list", async () => {
      const pool = makePool([]);
      const userRepository = new UserRepository(pool);

      const result = await userRepository.find({
        email: "exam",
        limit: 10,
        direction: "ASC",
      });

      expect(result).toEqual([]);
    });
  });

  describe("checkCredentials", () => {
    let passwordHash: string;

    beforeEach(async () => {
      passwordHash = await argon2.hash("password");
    });

    it("should return a user", async () => {
      const pool = makePool([
        {
          id: user.id,
          name: user.name,
          email: user.email,
          password: passwordHash,
          country: user.country,
          role: user.role,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
          deleted_at: null,
        },
      ]);

      const userRepository = new UserRepository(pool);
      const result = await userRepository.checkCredentials(user.email, "password");

      expect(result).toEqual(user);
    });

    it("should raise NotFoundError", async () => {
      const pool = makePool([]);
      const userRepository = new UserRepository(pool);

      await expect(userRepository.checkCredentials("", "")).rejects.toThrowError(NotFoundError);
    });

    it("should raise ValidationError", async () => {
      const pool = makePool([
        {
          id: user.id,
          name: user.name,
          email: user.email,
          country: user.country,
          password: passwordHash,
          role: user.role,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
          deleted_at: null,
        },
      ]);
      const userRepository = new UserRepository(pool);

      await expect(userRepository.checkCredentials(user.email, "password2")).rejects.toThrowError(
        UnauthorizedError,
      );
    });
  });

  describe("create", () => {
    it("should return a user", async () => {
      const pool = makePool([
        {
          id: user.id,
          name: user.name,
          email: user.email,
          country: user.country,
          role: user.role,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
          deleted_at: null,
        },
      ]);

      const userRepository = new UserRepository(pool);
      const input: CreateUserInput = {
        name: user.name,
        email: user.email,
        password: "password",
        country: user.country,
      };
      const result = await userRepository.save(input);

      expect(result).toEqual(user);
    });
  });

  describe("update", () => {
    it("should return a user", async () => {
      const pool = makePool([
        {
          id: user.id,
          name: user.name,
          email: user.email,
          country: user.country,
          role: user.role,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
          deleted_at: null,
        },
      ]);

      const userRepository = new UserRepository(pool);
      const result = await userRepository.update({
        id: user.id,
        name: "John Doe",
      });

      expect(result).toEqual(user);
    });

    it("should raise NotFoundError", async () => {
      const pool = makePool([]);
      const userRepository = new UserRepository(pool);

      await expect(userRepository.update({ id: "1", name: "John Doe" })).rejects.toThrowError(
        UnknownError,
      );
    });
  });

  describe("delete", () => {
    it("should delete a user", async () => {
      const pool = makePool([]);

      const userRepository = new UserRepository(pool);

      await expect(userRepository.delete(user.id)).resolves.toBeUndefined();
    });
  });
});
