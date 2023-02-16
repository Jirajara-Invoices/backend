import { IMock, It, Mock, Times } from "moq.ts";

import { User, UserRole } from "../../entities/models/users";
import { ValidationError } from "../../entities/errors";
import { LoggerUseCasePort } from "../common/interfaces";
import type { CreateUserInput, FindUserInput, UserRepositoryPort } from "./interfaces";
import { UserUseCase } from "./usecase";

describe("UserUseCase tests", () => {
  let mockLogger: IMock<LoggerUseCasePort>;

  beforeEach(() => {
    mockLogger = new Mock<LoggerUseCasePort>()
      .setup((instance) => instance.error(It.IsAny()))
      .returns({} as any);
  });

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
        .setup((instance) => instance.create(input))
        .returns(Promise.resolve(user))
        .object();
      const userUseCase = new UserUseCase(userRepository, mockLogger.object());
      const result = await userUseCase.create(input);

      expect(result).toEqual(user);
      mockLogger.verify((instance) => instance.error, Times.Never());
    });

    it("should throw an error if the input is invalid", async () => {
      const input: CreateUserInput = {
        name: "j",
        email: "exampl",
        password: "passwor",
        country: "U",
      };

      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.create(input))
        .returns(Promise.resolve({} as User))
        .object();
      const userUseCase = new UserUseCase(userRepository, mockLogger.object());

      await expect(userUseCase.create(input)).rejects.toThrow(ValidationError);
      mockLogger.verify((instance) => instance.error, Times.Once());
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
      const userUseCase = new UserUseCase(userRepository, mockLogger.object());
      userUseCase.setCurrentUser(user);
      const result = await userUseCase.update(input);

      expect(result).toEqual(user);
      mockLogger.verify((instance) => instance.error, Times.Never());
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
      const userUseCase = new UserUseCase(userRepository, mockLogger.object());

      await expect(userUseCase.update(input)).rejects.toThrow(ValidationError);
      mockLogger.verify((instance) => instance.error, Times.Once());
    });

    it("should throw an error if the user is not the same", async () => {
      const input = {
        id: "1",
        name: "John Doe",
      };

      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.update(input))
        .returns(Promise.resolve({} as User))
        .object();
      const userUseCase = new UserUseCase(userRepository, mockLogger.object());

      await expect(userUseCase.update(input)).rejects.toThrow(ValidationError);
      mockLogger.verify((instance) => instance.error, Times.Once());
    });
  });

  describe("delete", () => {
    it("should throw an error if current user is not logged", async () => {
      const id = "1";

      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.delete(id))
        .returns(Promise.resolve())
        .object();
      const userUseCase = new UserUseCase(userRepository, mockLogger.object());

      await expect(userUseCase.delete(id)).rejects.toThrow(ValidationError);
      mockLogger.verify((instance) => instance.error, Times.Once());
    });

    it("should delete a user", async () => {
      const id = "1";

      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.delete(id))
        .returns(Promise.resolve())
        .object();
      const userUseCase = new UserUseCase(userRepository, mockLogger.object());
      const user: User = {
        id: "1",
        name: "John Doe",
        email: "example@example",
        role: UserRole.User,
        country: "US",
        created_at: new Date(),
        updated_at: new Date(),
      };
      userUseCase.setCurrentUser(user);

      await expect(userUseCase.delete(id)).resolves.toBeUndefined();
      await mockLogger.verify((instance) => instance.error, Times.Never());
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
      const userUseCase = new UserUseCase(userRepository, mockLogger.object());
      const adminUser: User = { ...user, role: UserRole.Admin };
      userUseCase.setCurrentUser(adminUser);
      const result = await userUseCase.findByID(id);

      expect(result).toEqual(user);
      mockLogger.verify((instance) => instance.error, Times.Never());
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
      const userUseCase = new UserUseCase(userRepository, mockLogger.object());
      const adminUser: User = { ...users[0], role: UserRole.Admin };
      userUseCase.setCurrentUser(adminUser);
      const result = await userUseCase.findAll(input);

      expect(result).toEqual(users);
      mockLogger.verify((instance) => instance.error, Times.Never());
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
      const userUseCase = new UserUseCase(userRepository, mockLogger.object());
      const adminUser: User = { ...users[0], role: UserRole.Admin };
      userUseCase.setCurrentUser(adminUser);
      const result = await userUseCase.findAll(input);

      expect(result).toEqual(users);
      mockLogger.verify((instance) => instance.error, Times.Never());
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
      const userUseCase = new UserUseCase(userRepository, mockLogger.object());

      await expect(userUseCase.findAll(input)).rejects.toThrow(ValidationError);
      mockLogger.verify((instance) => instance.error, Times.Once());
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
      const userUseCase = new UserUseCase(userRepository, mockLogger.object());
      const result = await userUseCase.checkCredentials("example@example", "password");

      expect(result).toEqual(user);
      mockLogger.verify((instance) => instance.error, Times.Never());
    });

    it("should throw an error if the input is invalid", async () => {
      const userRepository = new Mock<UserRepositoryPort>()
        .setup((instance) => instance.checkCredentials("exampl", "password"))
        .returns(Promise.resolve({} as User))
        .object();
      const userUseCase = new UserUseCase(userRepository, mockLogger.object());

      await expect(userUseCase.checkCredentials("exampl", "password")).rejects.toThrow(
        ValidationError,
      );
      mockLogger.verify((instance) => instance.error, Times.Once());
    });
  });
});
