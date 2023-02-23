import { createId } from "@paralleldrive/cuid2";
import DataLoader from "dataloader";
import { DatabasePool, sql } from "slonik";
import { z } from "zod";
import {
  CreateTaxInput,
  TaxesFilterInput,
  TaxesRepositoryPort,
  UpdateTaxInput,
} from "../../../usecases/taxes/interfaces";
import { Tax, TaxCalcType } from "../../../entities/models/taxes";
import { TranslationUseCasePort } from "../../../usecases/common/interfaces";

const taxZodSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  calc_type: z.enum<TaxCalcType, [TaxCalcType.Percentage, TaxCalcType.Fixed]>([
    TaxCalcType.Percentage,
    TaxCalcType.Fixed,
  ]),
  name: z.string(),
  rate: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().optional(),
});
type TaxZodSchema = z.infer<typeof taxZodSchema>;

const mapTax = (tax: TaxZodSchema): Tax => {
  return {
    id: tax.id,
    user_id: tax.user_id,
    calc_type: tax.calc_type,
    name: tax.name,
    rate: tax.rate,
    created_at: new Date(tax.created_at),
    updated_at: new Date(tax.updated_at),
    deleted_at: tax.deleted_at ? new Date(tax.deleted_at) : undefined,
  };
};

export class TaxRepository implements TaxesRepositoryPort {
  private taxLoader: DataLoader<string, Tax>;

  constructor(private dbPool: DatabasePool, private readonly translator: TranslationUseCasePort) {
    this.taxLoader = new DataLoader(async (ids: readonly string[]) => {
      const taxes = await this.dbPool.any(
        sql.type(taxZodSchema)`SELECT * FROM taxes WHERE id IN (${sql.join(
          ids,
          sql.fragment`, `,
        )})`,
      );

      const taxesMapped: (Tax | Error)[] = [];
      for (const id of ids) {
        const tax = taxes.find((tax) => tax.id === id);
        if (tax) {
          taxesMapped.push(mapTax(tax));
        } else {
          taxesMapped.push(new Error(this.translator.translate("notFoundError")));
        }
      }

      return taxesMapped;
    });
  }

  async findByID(id: string): Promise<Tax> {
    return this.taxLoader.load(id);
  }

  async findAll(filter: TaxesFilterInput): Promise<Tax[]> {
    const whereClauses = [];
    if (filter.userId) whereClauses.push(sql.unsafe`user_id = ${filter.userId}`);
    if (filter.calcType) whereClauses.push(sql.unsafe`calc_type = ${filter.calcType}`);
    if (filter.name) whereClauses.push(sql.unsafe`name = ${filter.name}`);
    if (filter.rate) whereClauses.push(sql.unsafe`rate = ${filter.rate}`);

    if (filter.cursor) {
      const direction =
        filter.cursorDirection === undefined || filter.cursorDirection === "ASC"
          ? sql.fragment`>`
          : sql.fragment`<`;
      whereClauses.push(sql.unsafe`created_at ${direction} ${filter.cursor}`);
    }

    const sqlQueryArray = [
      sql.fragment`SELECT * FROM taxes`,
      whereClauses.length > 0
        ? sql.fragment`WHERE ${sql.join(whereClauses, sql.fragment` AND `)}`
        : sql.fragment``,
      sql.fragment`ORDER BY created_at ${
        filter.direction === "ASC" ? sql.fragment`ASC` : sql.fragment`DESC`
      }`,
      sql.fragment`LIMIT ${filter.limit}`,
    ];

    const sqlQuery = sql.type(taxZodSchema)`${sql.join(sqlQueryArray, sql.fragment` `)}`;
    const result = await this.dbPool.query(sqlQuery);

    return result.rows.map(mapTax);
  }

  async create(input: CreateTaxInput, userId: string): Promise<Tax> {
    const tax_id = createId();
    const result = await this.dbPool.query(
      sql.type(taxZodSchema)`
        INSERT INTO taxes (id, user_id, calc_type, name, rate)
        VALUES (${tax_id}, ${userId}, ${input.calc_type}, ${input.name}, ${input.rate})
        RETURNING *
      `,
    );

    return mapTax(result.rows[0]);
  }

  async update(input: UpdateTaxInput, userId: string): Promise<Tax> {
    const fieldsToUpdate = Object.keys(input).filter(
      (key) => key !== "id" && input[key as keyof typeof input] !== undefined,
    );
    const sqlFields = fieldsToUpdate.map(
      (field) =>
        sql.fragment`${sql.identifier([field])} = ${input[field as keyof typeof input] || ""}`,
    );

    const result = await this.dbPool.query(
      sql.type(taxZodSchema)`
        UPDATE taxes
        SET ${sql.join(sqlFields, sql.fragment`, `)}, updated_at = current_timestamp WHERE id = ${
        input.id
      } AND user_id = ${userId}
        RETURNING *
      `,
    );

    return mapTax(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.dbPool.query(
      sql.type(taxZodSchema)`
        DELETE FROM taxes WHERE id = ${id}
      `,
    );
  }
}
