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
import { Tax, TaxCalcType } from "../../../entities/models/taxes";
import { InvoiceItem, InvoiceItemType } from "../../../entities/models/invoice_items";

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

const invoiceItemAndTaxSchema = z.object({
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
  tax_id: z.ostring(),
  item_created_at: z.coerce.date(),
  item_updated_at: z.coerce.date(),
  item_deleted_at: z.coerce.date().optional(),
  tax_user_id: z.ostring(),
  tax_calc_type: z
    .enum<TaxCalcType, [TaxCalcType.Percentage, TaxCalcType.Fixed]>([
      TaxCalcType.Percentage,
      TaxCalcType.Fixed,
    ])
    .optional(),
  tax_name: z.ostring(),
  tax_rate: z.onumber(),
  tax_created_at: z.coerce.date().optional(),
  tax_updated_at: z.coerce.date().optional(),
  tax_deleted_at: z.coerce.date().optional(),
});
type InvoiceItemAndTax = z.infer<typeof invoiceItemAndTaxSchema>;

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
    const sqlFields = fieldsToUpdate.map((field) => {
      const value = input[field as keyof typeof input] || "";
      if (value instanceof Date) {
        return sql.fragment`${sql.identifier([field])} = ${sql.date(value)}}`;
      }
      return sql.fragment`${sql.identifier([field])} = ${value}}`;
    });

    const invoice = await this.dbPool.query(
      sql.type(invoiceZodSchema)`
        UPDATE invoices
        SET ${sql.join(sqlFields, sql.fragment`, `)}, updated_at = current_timestamp
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

  async getDiscount(invoiceId: string): Promise<number> {
    const discounts = await this.getInvoiceItemsAndTaxes(invoiceId, {
      itemType: InvoiceItemType.Discount,
    });

    return discounts.reduce((acc, item) => acc + item.price, 0);
  }

  async getInvoiceTaxes(invoiceId: string): Promise<Tax[]> {
    const taxes = await this.getInvoiceItemsAndTaxes(invoiceId);
    const invoiceTaxes = taxes.filter((tax) => tax.tax_id !== undefined);

    return invoiceTaxes.map((tax) => ({
      id: tax.tax_id!,
      user_id: tax.tax_user_id!,
      name: tax.tax_name!,
      rate: tax.tax_rate!,
      calc_type: tax.tax_calc_type!,
      created_at: new Date(tax.tax_created_at!),
      updated_at: new Date(tax.tax_updated_at!),
      deleted_at: tax.tax_deleted_at ? new Date(tax.tax_deleted_at) : undefined,
    }));
  }

  async getNonTaxableAmount(invoiceId: string): Promise<number> {
    const items = await this.getInvoiceItemsAndTaxes(invoiceId);

    return items.reduce((acc, item) => {
      if (!item.tax_rate || item.tax_rate === 0) {
        return acc + item.price;
      }

      return acc;
    }, 0);
  }

  async getSubtotal(invoiceId: string): Promise<number> {
    const items = await this.getInvoiceItemsAndTaxes(invoiceId);

    return items.reduce((acc, item) => {
      if (item.type === InvoiceItemType.Discount) {
        return acc - item.price;
      }

      return acc + item.price * item.quantity;
    }, 0);
  }

  async getTaxAmount(invoiceId: string): Promise<number> {
    const taxes = await this.getInvoiceItemsAndTaxes(invoiceId);

    return taxes.reduce((acc, item) => {
      if (item.tax_rate) {
        const taxRate = item.tax_rate;
        if (item.tax_calc_type === TaxCalcType.Percentage) {
          return acc + item.price * item.quantity * (taxRate / 100);
        } else if (item.tax_calc_type === TaxCalcType.Fixed) {
          return acc + taxRate;
        }
      } else if (item.type === InvoiceItemType.Tax) {
        return acc + item.price;
      }

      return acc;
    }, 0);
  }

  async getTaxableAmount(invoiceId: string): Promise<number> {
    const taxes = await this.getInvoiceItemsAndTaxes(invoiceId);

    return taxes.reduce((acc, item) => {
      if (item.tax_rate) {
        return acc + item.price * item.quantity;
      }

      return acc;
    }, 0);
  }

  async getTotal(invoiceId: string): Promise<number> {
    const items = await this.getInvoiceItemsAndTaxes(invoiceId);

    return items.reduce((acc, item) => {
      if (item.type === InvoiceItemType.Discount) {
        return acc - item.price;
      }
      let taxAmount = 0;
      if (item.tax_rate) {
        const taxRate = item.tax_rate;
        if (item.tax_calc_type === TaxCalcType.Percentage) {
          taxAmount += item.price * item.quantity * (taxRate / 100);
        } else if (item.tax_calc_type === TaxCalcType.Fixed) {
          taxAmount += taxRate;
        }
      }

      return acc + item.price * item.quantity + taxAmount;
    }, 0);
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    const items = await this.getInvoiceItemsAndTaxes(invoiceId);

    return items.map((item) => ({
      id: item.id,
      invoice_id: item.invoice_id,
      type: item.type,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
      tax_id: item.tax_id,
      created_at: new Date(item.item_created_at),
      updated_at: new Date(item.item_updated_at),
      deleted_at: item.item_deleted_at ? new Date(item.item_deleted_at) : undefined,
    }));
  }

  private async getInvoiceItemsAndTaxes(
    invoiceId: string,
    filters?: {
      itemType: InvoiceItemType;
    },
  ): Promise<readonly InvoiceItemAndTax[]> {
    const result = await this.dbPool.query(
      sql.type(invoiceItemAndTaxSchema)`
        SELECT (
          ii.id,
          ii.invoice_id,
          ii.name,
          ii.description,
          ii.quantity,
          ii.price,
          ii.tax_id,
          ii.created_at AS item_created_at,
          ii.updated_at AS item_updated_at,
          ii.deleted_at AS item_deleted_at,
          t.user_id AS tax_user_id,
          t.name AS tax_name,
          t.rate AS tax_rate,
          t.type AS tax_type,
          t.created_at AS tax_created_at,
          t.updated_at AS tax_updated_at
          t.deleted_at AS tax_deleted_at
        ) 
        FROM invoice_items ii
        LEFT JOIN taxes t ON t.id = ii.tax_id
        WHERE ii.invoice_id = ${invoiceId}${
        filters?.itemType ? sql.fragment` AND ii.type = ${filters.itemType}` : sql.fragment``
      }
      `,
    );

    return result.rows;
  }
}
