import { DatabasePool, sql } from "slonik";
import { z } from "zod";
import { InvoiceItem, InvoiceItemType } from "../../../entities/models/invoice_items";
import {
  CreateItemInput,
  InvoiceItemRepositoryPort,
  ItemsFilterInput,
  UpdateItemInput,
} from "../../../usecases/invoice_items/interfaces";
import { createId } from "@paralleldrive/cuid2";

const invoiceItemZodSchema = z.object({
  id: z.string(),
  invoice_id: z.string(),
  type: z.enum<
    InvoiceItemType,
    [
      InvoiceItemType.Service,
      InvoiceItemType.Product,
      InvoiceItemType.Shipping,
      InvoiceItemType.Discount,
      InvoiceItemType.Tax,
    ]
  >([
    InvoiceItemType.Service,
    InvoiceItemType.Product,
    InvoiceItemType.Shipping,
    InvoiceItemType.Discount,
    InvoiceItemType.Tax,
  ]),
  name: z.string(),
  description: z.string(),
  quantity: z.number(),
  price: z.number(),
  tax_id: z.string().optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().optional(),
});
type InvoiceItemZodSchema = z.infer<typeof invoiceItemZodSchema>;

const mapInvoiceItem = (invoiceItem: InvoiceItemZodSchema): InvoiceItem => ({
  id: invoiceItem.id,
  invoice_id: invoiceItem.invoice_id,
  type: invoiceItem.type,
  name: invoiceItem.name,
  description: invoiceItem.description,
  quantity: invoiceItem.quantity,
  price: invoiceItem.price,
  tax_id: invoiceItem.tax_id ?? undefined,
  created_at: new Date(invoiceItem.created_at),
  updated_at: new Date(invoiceItem.updated_at),
  deleted_at: invoiceItem.deleted_at ? new Date(invoiceItem.deleted_at) : undefined,
});

export class InvoiceItemRepository implements InvoiceItemRepositoryPort {
  constructor(private dbPool: DatabasePool) {}

  async findByID(id: string, userId: string | null): Promise<InvoiceItem> {
    const result: InvoiceItemZodSchema = await this.dbPool.one(
      sql.type(invoiceItemZodSchema)`
        SELECT ii.*
        FROM invoice_items ii
        INNER JOIN invoices iv ON iv.id = ii.invoice_id
        WHERE id = ${id}${userId ? sql.fragment` AND user_id = ${userId}` : sql.fragment``}
      `,
    );

    return mapInvoiceItem(result);
  }

  async findAll(filter: ItemsFilterInput, userId: string | null): Promise<InvoiceItem[]> {
    const whereClauses = [];
    if (filter.invoiceId) whereClauses.push(sql.unsafe`ii.invoice_id = ${filter.invoiceId}`);
    if (filter.type) whereClauses.push(sql.unsafe`ii.type = ${filter.type}`);
    if (filter.name) whereClauses.push(sql.unsafe`ii.name = ${filter.name}`);
    if (filter.taxId) whereClauses.push(sql.unsafe`ii.description = ${filter.taxId}`);
    if (userId) whereClauses.push(sql.unsafe`iv.user_id = ${userId}`);

    if (filter.cursor) {
      const direction =
        filter.cursorDirection === undefined || filter.cursorDirection === "ASC"
          ? sql.fragment`>`
          : sql.fragment`<`;
      whereClauses.push(sql.unsafe`ii.created_at ${direction} ${filter.cursor}`);
    }

    const sqlQueryArray = [
      sql.fragment`
        SELECT
            ii.*
        FROM invoice_items ii
      `,
      sql.fragment`JOIN invoices iv ON ii.invoice_id = iv.id`,
      whereClauses.length > 0
        ? sql.fragment`WHERE ${sql.join(whereClauses, sql.fragment` AND `)}`
        : sql.fragment``,
      sql.fragment`ORDER BY ii.created_at ${
        filter.direction === "ASC" ? sql.fragment`ASC` : sql.fragment`DESC`
      }`,
      sql.fragment`LIMIT ${filter.limit}`,
    ];

    const sqlQuery = sql.type(invoiceItemZodSchema)`${sql.join(sqlQueryArray, sql.fragment` `)}`;
    const result = await this.dbPool.query(sqlQuery);

    return result.rows.map(mapInvoiceItem);
  }

  async create(input: CreateItemInput): Promise<InvoiceItem> {
    const id = createId();
    const fieldsToUpdate = Object.keys(input).filter(
      (key) => input[key as keyof typeof input] !== undefined,
    );
    const identifiers = [
      sql.identifier(["id"]),
      ...fieldsToUpdate.map((field) => sql.identifier([field])),
    ];
    const values = [id, ...fieldsToUpdate.map((field) => input[field as keyof typeof input] || "")];

    const result = await this.dbPool.query(
      sql.type(invoiceItemZodSchema)`
        INSERT INTO invoice_items (${sql.join(identifiers, sql.fragment`, `)})
        VALUES (${sql.join(values, sql.fragment`, `)})
        RETURNING *
      `,
    );

    return mapInvoiceItem(result.rows[0]);
  }

  async update(input: UpdateItemInput, userId: string): Promise<InvoiceItem> {
    const fieldsToUpdate = Object.keys(input).filter(
      (key) => key !== "id" && input[key as keyof typeof input] !== undefined,
    );
    const sqlFields = fieldsToUpdate.map(
      (field) =>
        sql.fragment`${sql.identifier([field])} = ${input[field as keyof typeof input] || ""}`,
    );

    const result = await this.dbPool.query(
      sql.type(invoiceItemZodSchema)`
        UPDATE invoice_items
        SET ${sql.join(sqlFields, sql.fragment`, `)}, updated_at = current_timestamp
        FROM invoices
        WHERE invoices.id = invoice_items.invoice_id AND invoice_items.id = ${
          input.id
        } AND invoices.user_id = ${userId}
        RETURNING invoice_items.*
      `,
    );

    return mapInvoiceItem(result.rows[0]);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.dbPool.query(
      sql.type(invoiceItemZodSchema)`
        DELETE FROM invoice_items
        USING invoices
        WHERE invoice_items.invoice_id = invoices.id AND invoice_items.id = ${id} AND invoices.user_id = ${userId}
        RETURNING *
      `,
    );
  }
}
