import { createId } from "@paralleldrive/cuid2";
import { DatabasePool, sql } from "slonik";
import { z } from "zod";
import {
  CreateInvoiceInput,
  InvoiceFilterInput,
  InvoiceRepositoryPort,
  UpdateInvoiceInput,
} from "../../../usecases/invoices/interfaces";
import { Invoice, InvoiceStatus, InvoiceType } from "../../../entities/models/invoice";

const invoiceZodSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  address_id: z.string(),
  client_address_id: z.string(),
  type: z.enum<
    InvoiceType,
    [
      InvoiceType.Invoice,
      InvoiceType.Quote,
      InvoiceType.Receipt,
      InvoiceType.Estimate,
      InvoiceType.Proforma,
      InvoiceType.Debit,
      InvoiceType.Credit,
      InvoiceType.Bill,
      InvoiceType.DeliveryNote,
      InvoiceType.PurchaseOrder,
    ]
  >([
    InvoiceType.Invoice,
    InvoiceType.Quote,
    InvoiceType.Receipt,
    InvoiceType.Estimate,
    InvoiceType.Proforma,
    InvoiceType.Debit,
    InvoiceType.Credit,
    InvoiceType.Bill,
    InvoiceType.DeliveryNote,
    InvoiceType.PurchaseOrder,
  ]),
  number: z.string(),
  date: z.coerce.date(),
  due_date: z.coerce.date(),
  status: z.enum<
    InvoiceStatus,
    [
      InvoiceStatus.Draft,
      InvoiceStatus.Sent,
      InvoiceStatus.Paid,
      InvoiceStatus.Canceled,
      InvoiceStatus.Overdue,
    ]
  >([
    InvoiceStatus.Draft,
    InvoiceStatus.Sent,
    InvoiceStatus.Paid,
    InvoiceStatus.Canceled,
    InvoiceStatus.Overdue,
  ]),
  terms: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullish(),
});
type InvoiceZodSchema = z.infer<typeof invoiceZodSchema>;

const mapInvoice = (invoice: InvoiceZodSchema): Invoice => ({
  id: invoice.id,
  user_id: invoice.user_id,
  address_id: invoice.address_id,
  client_address_id: invoice.client_address_id,
  type: invoice.type,
  number: invoice.number,
  date: new Date(invoice.date),
  due_date: new Date(invoice.due_date),
  status: invoice.status,
  terms: invoice.terms,
  created_at: new Date(invoice.created_at),
  updated_at: new Date(invoice.updated_at),
  deleted_at: invoice.deleted_at ? new Date(invoice.deleted_at) : undefined,
});

export class InvoiceRepository implements InvoiceRepositoryPort {
  constructor(private dbPool: DatabasePool) {}

  async findByID(id: string): Promise<Invoice> {
    const invoice: InvoiceZodSchema = await this.dbPool.one(
      sql.type(invoiceZodSchema)`SELECT * FROM invoices WHERE id = ${id}`,
    );

    return mapInvoice(invoice);
  }

  async findAll(filter: InvoiceFilterInput): Promise<Invoice[]> {
    const whereClauses = [];
    if (filter.userId) whereClauses.push(sql.unsafe`user_id = ${filter.userId}`);
    if (filter.addressId) whereClauses.push(sql.unsafe`address_id = ${filter.addressId}`);
    if (filter.clientAddressId)
      whereClauses.push(sql.unsafe`client_address_id = ${filter.clientAddressId}`);
    if (filter.type) whereClauses.push(sql.unsafe`type = ${filter.type}`);
    if (filter.status) whereClauses.push(sql.unsafe`status = ${filter.status}`);
    if (filter.date) whereClauses.push(sql.unsafe`date = ${sql.date(filter.date)}`);
    if (filter.dueDate) whereClauses.push(sql.unsafe`due_date = ${sql.date(filter.dueDate)}`);

    if (filter.cursor) {
      const direction =
        filter.cursorDirection === undefined || filter.cursorDirection === "ASC"
          ? sql.fragment`>`
          : sql.fragment`<`;
      whereClauses.push(sql.unsafe`created_at ${direction} ${filter.cursor}`);
    }

    const sqlQueryArray = [
      sql.fragment`SELECT * FROM invoices`,
      whereClauses.length > 0
        ? sql.fragment`WHERE ${sql.join(whereClauses, sql.fragment` AND `)}`
        : sql.fragment``,
      sql.fragment`ORDER BY created_at ${
        filter.direction === "ASC" ? sql.fragment`ASC` : sql.fragment`DESC`
      }`,
      sql.fragment`LIMIT ${filter.limit}`,
    ];

    const sqlQuery = sql.type(invoiceZodSchema)`${sql.join(sqlQueryArray, sql.fragment` `)}`;
    const invoices = await this.dbPool.query(sqlQuery);

    return invoices.rows.map(mapInvoice);
  }

  async create(input: CreateInvoiceInput, userId: string): Promise<Invoice> {
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
      ...fieldsToUpdate.map((field) => {
        const value = input[field as keyof typeof input] || "";
        if (value instanceof Date) {
          return sql.date(value);
        }

        return value;
      }),
    ];

    const invoice = await this.dbPool.query(
      sql.type(invoiceZodSchema)`
        INSERT INTO invoices (${sql.join(identifiers, sql.fragment`, `)})
        VALUES (${sql.join(values, sql.fragment`, `)})
        RETURNING *
      `,
    );

    return mapInvoice(invoice.rows[0]);
  }

  async update(input: UpdateInvoiceInput, userId: string): Promise<Invoice> {
    const fieldsToUpdate = Object.keys(input).filter(
      (key) => input[key as keyof typeof input] !== undefined,
    );
    const values = [
      ...fieldsToUpdate.map((field) => {
        const value = input[field as keyof typeof input] || "";
        if (value instanceof Date) {
          return sql.date(value);
        }

        return value;
      }),
    ];

    const invoice = await this.dbPool.query(
      sql.type(invoiceZodSchema)`
        UPDATE invoices
        SET (${sql.join(
          fieldsToUpdate.map((field) => sql.identifier([field])),
          sql.fragment`, `,
        )}) = (${sql.join(values, sql.fragment`, `)})
        WHERE id = ${input.id} AND user_id = ${userId}
        RETURNING *
      `,
    );

    return mapInvoice(invoice.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.dbPool.query(
      sql.type(invoiceZodSchema)`
        DELETE FROM invoices
        WHERE id = ${id}
      `,
    );
  }
}
