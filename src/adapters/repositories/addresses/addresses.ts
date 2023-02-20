import { createId } from "@paralleldrive/cuid2";
import DataLoader from "dataloader";
import { DatabasePool, sql } from "slonik";
import { z } from "zod";

import { Address, AddressType } from "../../../entities/models/addresses";
import {
  AddressFilterInput,
  AddressRepositoryPort,
  CreateAddressInput,
  UpdateAddressInput,
} from "../../../usecases/addresses/interfaces";

const addressZodSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: z.enum<AddressType, [AddressType.Personal, AddressType.Clients]>([
    AddressType.Personal,
    AddressType.Clients,
  ]),
  name: z.string(),
  tax_id: z.string().optional(),
  email: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  comment: z.string().optional(),
  zipcode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullish(),
});
type AddressZodSchema = z.infer<typeof addressZodSchema>;

function mapAddress(address: AddressZodSchema): Address {
  return {
    id: address.id,
    user_id: address.user_id,
    type: address.type,
    name: address.name,
    tax_id: address.tax_id,
    email: address.email,
    street: address.street,
    number: address.number,
    comment: address.comment,
    zipcode: address.zipcode,
    city: address.city,
    state: address.state,
    country: address.country,
    created_at: new Date(address.created_at),
    updated_at: new Date(address.updated_at),
    deleted_at: address.deleted_at ? new Date(address.deleted_at) : undefined,
  };
}

export class AddressRepository implements AddressRepositoryPort {
  private addressLoader: DataLoader<string, Address>;
  constructor(private dbPool: DatabasePool) {
    this.addressLoader = new DataLoader(async (ids: readonly string[]) => {
      const addresses = await this.dbPool.any(
        sql.type(addressZodSchema)`SELECT * FROM addresses WHERE id IN (${sql.join(
          ids,
          sql.fragment`, `,
        )})`,
      );

      const addressesMapped: (Address | Error)[] = [];
      for (const id of ids) {
        const address = addresses.find((address) => address.id === id);
        if (address) {
          addressesMapped.push(mapAddress(address));
        } else {
          addressesMapped.push(new Error(`Address with id ${id} not found`));
        }
      }

      return addressesMapped;
    });
  }

  async findByID(id: string): Promise<Address> {
    return await this.addressLoader.load(id);
  }

  async find(filter: AddressFilterInput) {
    const whereClauses = [];
    if (filter.name) {
      whereClauses.push(sql.unsafe`name ilike ${sql.literalValue(`%${filter.name}%`)}`);
    }
    if (filter.email) {
      whereClauses.push(sql.unsafe`email ilike ${sql.literalValue(`%${filter.email}%`)}`);
    }
    if (filter.type) {
      whereClauses.push(sql.unsafe`type = ${filter.type}`);
    }
    if (filter.taxId) {
      whereClauses.push(sql.unsafe`tax_id = ${filter.taxId}`);
    }
    if (filter.userId) {
      whereClauses.push(sql.unsafe`user_id = ${filter.userId}`);
    }

    if (filter.cursor) {
      const direction =
        filter.cursorDirection === undefined || filter.cursorDirection === "ASC"
          ? sql.fragment`>`
          : sql.fragment`<`;
      whereClauses.push(sql.unsafe`created_at ${direction} ${filter.cursor}`);
    }

    const sqlQueryArray = [
      sql.fragment`SELECT * FROM addresses`,
      whereClauses.length > 0
        ? sql.fragment`WHERE ${sql.join(whereClauses, sql.unsafe`AND`)}`
        : sql.fragment``,
      sql.fragment`ORDER BY created_at ${
        filter.direction === "ASC" ? sql.fragment`ASC` : sql.fragment`DESC`
      }`,
      sql.fragment`LIMIT ${filter.limit}`,
    ];

    const sqlQuery = sql.type(addressZodSchema)`${sql.join(sqlQueryArray, sql.fragment` `)}`;
    const addresses = await this.dbPool.query(sqlQuery);

    return addresses.rows.map(mapAddress);
  }

  async create(input: CreateAddressInput, userId: string): Promise<Address> {
    const id = createId();
    const fieldsToUpdate = Object.keys(input).filter(
      (key) => input[key as keyof typeof input] !== undefined,
    );
    const identifiers = [
      sql.identifier(["id"]),
      sql.identifier(["user_id"]),
      ...fieldsToUpdate.map((field) => sql.identifier([field])),
    ];
    const values = [
      id,
      userId,
      ...fieldsToUpdate.map((field) => input[field as keyof typeof input] || ""),
    ];

    const address = await this.dbPool.query(
      sql.type(addressZodSchema)`
        INSERT INTO addresses (${sql.join(identifiers, sql.fragment`, `)})
        VALUES (${sql.join(values, sql.fragment`, `)})
        RETURNING *
      `,
    );

    return mapAddress(address.rows[0]);
  }

  async update(input: UpdateAddressInput, userId: string): Promise<Address> {
    const fieldsToUpdate = Object.keys(input).filter(
      (key) => key !== "id" && input[key as keyof typeof input] !== undefined,
    );
    const sqlFields = fieldsToUpdate.map(
      (field) =>
        sql.fragment`${sql.identifier([field])} = ${input[field as keyof typeof input] || ""}`,
    );

    const address = await this.dbPool.query(
      sql.type(addressZodSchema)`
        UPDATE addresses
        SET ${sql.join(sqlFields, sql.fragment`, `)}, updated_at = current_timestamp WHERE id = ${
        input.id
      } AND user_id = ${userId}
        RETURNING *
      `,
    );

    return mapAddress(address.rows[0]);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.dbPool.query(
      sql.unsafe`DELETE FROM addresses WHERE id = ${id} AND user_id = ${userId}`,
    );
  }
}
