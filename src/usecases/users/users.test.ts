import { Mock } from "moq.ts";

import type { CreateUserInput, FindUserInput, UserRepositoryPort } from "./interfaces";
import { UserUseCase } from "./usecase";
import { User, UserRole } from "../../entities/models/users";
import { ValidationError } from "../../entities/errors";
import { describe } from "node:test";

describe("UserUseCase tests", () => {
  describe("create", () => {
    it("should create a user", async () => {
      const input: CreateUserInput = {
        name: "John Doe",
        email: "example@example",
        password: "password",
        country: "US",
      };
      const user: User = {
        id: "1",
        name: "John Doe",
        email: "example@example",
        role: UserRole.User,
        country: "US",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.save(input))
        .returns(Promise.resolve(user))
        .object();
      const userUseCase = new UserUseCase(userRepository);
      const result = await userUseCase.create(input);

      expect(result).toEqual(user);
    });

    it("should throw an error if the input is invalid", async () => {
      const input: CreateUserInput = {
        name: "j",
        email: "exampl",
        password: "passwor",
        country: "U",
      };

      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.save(input))
        .returns(Promise.resolve({} as User))
        .object();
      const userUseCase = new UserUseCase(userRepository);

      await expect(userUseCase.create(input)).rejects.toThrow(ValidationError);
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const input = {
        id: "1",
        name: "John Doe",
      };
      const user: User = {
        id: "1",
        name: "John Doe",
        email: "example@example",
        role: UserRole.User,
        country: "US",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.update(input))
        .returns(Promise.resolve(user))
        .object();
      const userUseCase = new UserUseCase(userRepository);
      const result = await userUseCase.update(input);

      expect(result).toEqual(user);
    });

    it("should throw an error if the input is invalid", async () => {
      const input = {
        id: "1",
        name: "j",
      };

      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.update(input))
        .returns(Promise.resolve({} as User))
        .object();
      const userUseCase = new UserUseCase(userRepository);

      await expect(userUseCase.update(input)).rejects.toThrow(ValidationError);
    });
  });

  describe("delete", () => {
    it("should delete a user", async () => {
      const id = "1";

      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.delete(id))
        .returns(Promise.resolve())
        .object();
      const userUseCase = new UserUseCase(userRepository);

      await expect(userUseCase.delete(id)).resolves.toBeUndefined();
    });
  });

  describe("find by id", () => {
    it("should find a user by id", async () => {
      const id = "1";
      const user: User = {
        id: "1",
        name: "John Doe",
        email: "example@example",
        role: UserRole.User,
        country: "US",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.findByID(id))
        .returns(Promise.resolve(user))
        .object();
      const userUseCase = new UserUseCase(userRepository);
      const result = await userUseCase.findByID(id);

      expect(result).toEqual(user);
    });
  });

  describe("find all", () => {
    it("should find all users without filters", async () => {
      const input: FindUserInput = {
        limit: 10,
        direction: "ASC",
      };
      const users: User[] = [
        {
          id: "1",
          name: "John Doe",
          email: "example@example",
          role: UserRole.User,
          country: "US",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "2",
          name: "Jane Doe",
          email: "example@example",
          role: UserRole.User,
          country: "US",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.find(input))
        .returns(Promise.resolve(users))
        .object();
      const userUseCase = new UserUseCase(userRepository);
      const result = await userUseCase.findAll(input);

      expect(result).toEqual(users);
    });

    it("should find all users with filters", async () => {
      const input: FindUserInput = {
        name: "John Doe",
        limit: 10,
        direction: "ASC",
      };
      const users: User[] = [
        {
          id: "1",
          name: "John Doe",
          email: "example@example",
          role: UserRole.User,
          country: "US",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.find(input))
        .returns(Promise.resolve(users))
        .object();
      const userUseCase = new UserUseCase(userRepository);
      const result = await userUseCase.findAll(input);

      expect(result).toEqual(users);
    });

    it("should throw an error if the input is invalid", async () => {
      const input: FindUserInput = {
        limit: 0,
        direction: "ASC",
      };
      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.find(input))
        .returns(Promise.resolve([]))
        .object();
      const userUseCase = new UserUseCase(userRepository);

      await expect(userUseCase.findAll(input)).rejects.toThrow(ValidationError);
    });
  });

  describe("checkCredentials", () => {
    it("should check credentials", async () => {
      const user: User = {
        id: "1",
        name: "John Doe",
        email: "example@example",
        role: UserRole.User,
        country: "US",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.checkCredentials("example@example", "password"))
        .returns(Promise.resolve(user))
        .object();
      const userUseCase = new UserUseCase(userRepository);
      const result = await userUseCase.checkCredentials("example@example", "password");

      expect(result).toEqual(user);
    });

    it("should throw an error if the input is invalid", async () => {
      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.checkCredentials("exampl", "password"))
        .returns(Promise.resolve({} as User))
        .object();
      const userUseCase = new UserUseCase(userRepository);

      await expect(userUseCase.checkCredentials("exampl", "password")).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
