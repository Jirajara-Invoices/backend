import * as argon2 from "argon2";

import { User, UserRole } from "../../../entities/models/users";
import { UnauthorizedError, UnknownError } from "../../../entities/errors";
import { makePool } from "../../../utilities/mock";
import { UserRepository } from "./users";
import { CreateUserInput } from "../../../usecases/users/interfaces";
import { TranslationUseCasePort } from "../../../usecases/common/interfaces";
import { It, Mock } from "moq.ts";

describe("UsersRepository tests", () => {
  let translator: TranslationUseCasePort;
  let user: User;

  beforeEach(() => {
    translator = new Mock<TranslationUseCasePort>()
      .setup((x) => x.translate(It.IsAny(), It.IsAny()))
      .returns("translated")
      .object();

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

      const userRepository = new UserRepository(pool, translator);
      const result = await userRepository.findByID(user.id);

      expect(result).toEqual(user);
    });

    it("should raise NotFoundError", async () => {
      const pool = makePool([]);
      const userRepository = new UserRepository(pool, translator);

      await expect(userRepository.findByID("1")).rejects.toThrowError(Error);
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

      const userRepository = new UserRepository(pool, translator);
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
      const userRepository = new UserRepository(pool, translator);

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

      const userRepository = new UserRepository(pool, translator);
      const result = await userRepository.checkCredentials(user.email, "password");

      expect(result).toEqual(user);
    });

    it("should raise Error", async () => {
      const pool = makePool([]);
      const userRepository = new UserRepository(pool, translator);

      await expect(userRepository.checkCredentials("", "")).rejects.toThrowError(Error);
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
      const userRepository = new UserRepository(pool, translator);

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

      const userRepository = new UserRepository(pool, translator);
      const input: CreateUserInput = {
        name: user.name,
        email: user.email,
        password: "password",
        country: user.country,
      };
      const result = await userRepository.create(input);

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

      const userRepository = new UserRepository(pool, translator);
      const result = await userRepository.update({
        id: user.id,
        name: "John Doe",
      });

      expect(result).toEqual(user);
    });

    it("should raise NotFoundError", async () => {
      const pool = makePool([]);
      const userRepository = new UserRepository(pool, translator);

      await expect(userRepository.update({ id: "1", name: "John Doe" })).rejects.toThrowError(
        UnknownError,
      );
    });
  });

  describe("delete", () => {
    it("should delete a user", async () => {
      const pool = makePool([]);

      const userRepository = new UserRepository(pool, translator);

      await expect(userRepository.delete(user.id)).resolves.toBeUndefined();
    });
  });
});
