import * as argon2 from "argon2";
import { createId } from "@paralleldrive/cuid2";
import { DatabasePool, sql, UniqueIntegrityConstraintViolationError } from "slonik";

import { User, UserRole } from "../../../entities/models/users";
import {
  CreateUserInput,
  FindUserInput,
  UpdateUserInput,
  UserRepositoryPort,
} from "../../../usecases/users/interfaces";
import { UnauthorizedError, UnknownError, ValidationError } from "../../../entities/errors";

function mapUser(user: Record<string, string>): User {
  const user_mapped: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    country: user.country,
    role: user.role as UserRole,
    created_at: new Date(user.created_at),
    updated_at: new Date(user.updated_at),
  };

  if (user.deleted_at) {
    user_mapped.deleted_at = new Date(user.deleted_at);
  }

  return user_mapped;
}

export class UserRepository implements UserRepositoryPort {
  private dbPool: DatabasePool;

  constructor(dbPool: DatabasePool) {
    this.dbPool = dbPool;
  }

  async findByID(id: string): Promise<User> {
    const user = await this.dbPool.one(sql.unsafe`SELECT * FROM users WHERE id = ${id}`);

    return mapUser(user);
  }

  async find(input: FindUserInput): Promise<User[]> {
    const whereClauses = [];

    if (input.name) {
      whereClauses.push(sql.unsafe`name ilike ${sql.literalValue(`%${input.name}%`)}`);
    }
    if (input.email) {
      whereClauses.push(sql.unsafe`email ilike ${sql.literalValue(`%${input.email}%`)}`);
    }
    if (input.cursor) {
      const direction =
        input.cursorDirection === undefined || input.cursorDirection === "ASC"
          ? sql.fragment`>`
          : sql.fragment`<`;
      whereClauses.push(sql.unsafe`created_at ${direction} ${input.cursor}`);
    }

    const sqlQueryArray = [
      sql.fragment`SELECT * FROM users`,
      whereClauses.length > 0
        ? sql.fragment`WHERE ${sql.join(whereClauses, sql.unsafe` AND `)}`
        : sql.fragment``,
      sql.fragment`ORDER BY created_at ${
        input.direction === "ASC" ? sql.fragment`ASC` : sql.fragment`DESC`
      } LIMIT ${input.limit}`,
    ];

    const sqlQuery = sql.unsafe`${sql.join(sqlQueryArray, sql.fragment` `)}`;

    const users = await this.dbPool.query(sqlQuery);

    return users.rows.map(mapUser);
  }

  async checkCredentials(email: string, password: string): Promise<User> {
    const user = await this.dbPool.one(sql.unsafe`SELECT * FROM users WHERE email = ${email}`);

    if (!(await argon2.verify(user.password, password))) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return mapUser(user);
  }

  async save(user: CreateUserInput): Promise<User> {
    const id = createId();
    const password = await argon2.hash(user.password);

    try {
      const newUser = await this.dbPool.query(sql.unsafe`
        INSERT INTO users (id, name, email, password, country)
        VALUES (${id}, ${user.name}, ${user.email}, ${password}, ${user.country}) RETURNING *
      `);

      return mapUser(newUser.rows[0]);
    } catch (error) {
      if (error instanceof UniqueIntegrityConstraintViolationError) {
        throw new ValidationError(
          "Email already exists",
          new Map([["email", "Email already exists"]]),
        );
      }

      throw new UnknownError("Unknown error");
    }
  }

  async update(user: UpdateUserInput): Promise<User> {
    if (user.password) {
      user.password = await argon2.hash(user.password);
    }

    try {
      const fieldsToUpdate = Object.keys(user).filter(
        (key) => key !== "id" && user[key as keyof typeof user] !== undefined,
      );
      const sqlFields = fieldsToUpdate.map(
        (field) =>
          sql.fragment`${sql.identifier([field])} = ${user[field as keyof typeof user] || ""}`,
      );
      const newUser = await this.dbPool.query(sql.unsafe`
        UPDATE users SET ${sql.join(
          sqlFields,
          sql.fragment`, `,
        )}, updated_at = current_timestamp WHERE id = ${user.id} RETURNING *
      `);

      return mapUser(newUser.rows[0]);
    } catch (error) {
      if (error instanceof UniqueIntegrityConstraintViolationError) {
        throw new ValidationError(
          "Email already exists",
          new Map([["email", "Email already exists"]]),
        );
      }

      throw new UnknownError("Unknown error");
    }
  }

  async delete(id: string): Promise<void> {
    await this.dbPool.query(sql.unsafe`
      DELETE FROM users WHERE id = ${id}
    `);
  }
}
