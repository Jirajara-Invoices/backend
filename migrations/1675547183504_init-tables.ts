/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions, PgLiteral } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = {
  id: {
    type: "varchar(40)",
    notNull: true,
    primaryKey: true,
  },
  created_at: {
    type: "timestamp with time zone",
    notNull: true,
    default: new PgLiteral("current_timestamp"),
  },
  updated_at: {
    type: "timestamp with time zone",
    notNull: true,
    default: new PgLiteral("current_timestamp"),
  },
  deleted_at: {
    type: "timestamp with time zone",
    notNull: false,
  },
};

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType("user_role", ["admin", "user"]);
  pgm.createTable("users", {
    id: "id",
    email: { type: "varchar(255)", notNull: true, unique: true },
    password: { type: "varchar(255)", notNull: true },
    name: { type: "varchar(255)", notNull: true },
    role: { type: "user_role", notNull: true, default: "user" },
    country: { type: "varchar(2)", notNull: true },
    created_at: "created_at",
    updated_at: "updated_at",
    deleted_at: "deleted_at",
  });

  pgm.createType("address_type", ["personal", "clients"]);
  pgm.createTable("addresses", {
    id: "id",
    user_id: {
      type: "varchar(40)",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    type: { type: "address_type", notNull: true },
    name: { type: "varchar(255)", notNull: true },
    taxId: { type: "varchar(255)", notNull: true },
    email: { type: "varchar(255)", notNull: true },
    street: { type: "varchar(255)", notNull: true },
    number: { type: "varchar(255)", notNull: true },
    comment: { type: "varchar(255)", notNull: false },
    zipcode: { type: "varchar(255)", notNull: true },
    city: { type: "varchar(255)", notNull: true },
    state: { type: "varchar(255)", notNull: true },
    country: { type: "varchar(2)", notNull: true },
    created_at: "created_at",
    updated_at: "updated_at",
    deleted_at: "deleted_at",
  });

  pgm.createType("tax_calc_type", ["percentage", "fixed"]);
  pgm.createTable("taxes", {
    id: "id",
    user_id: {
      type: "varchar(40)",
      notNull: false,
      references: '"users"',
      onDelete: "CASCADE",
    },
    name: { type: "varchar(255)", notNull: true },
    rate: { type: "numeric(15,5)", notNull: true },
    calc_type: { type: "tax_calc_type", notNull: true, default: "percentage" },
    created_at: "created_at",
    updated_at: "updated_at",
    deleted_at: "deleted_at",
  });

  pgm.createType("invoice_type", [
    "invoice",
    "proforma",
    "debit",
    "credit",
    "estimate",
    "bill",
    "quote",
    "receipt",
    "delivery_note",
    "purchase_order",
  ]);
  pgm.createType("invoice_status", ["draft", "sent", "paid", "canceled", "overdue"]);
  pgm.createTable("invoices", {
    id: "id",
    user_id: {
      type: "varchar(40)",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    address_id: {
      type: "varchar(40)",
      notNull: true,
      references: '"addresses"',
      onDelete: "RESTRICT",
    },
    client_address_id: {
      type: "varchar(40)",
      notNull: true,
      references: '"addresses"',
      onDelete: "RESTRICT",
    },
    type: { type: "invoice_type", notNull: true, default: "invoice" },
    number: { type: "varchar(255)", notNull: true },
    date: { type: "timestamp with time zone", notNull: true },
    due_date: { type: "timestamp with time zone", notNull: false },
    status: { type: "invoice_status", notNull: true, default: "draft" },
    terms: { type: "varchar(255)", notNull: true },
    created_at: "created_at",
    updated_at: "updated_at",
    deleted_at: "deleted_at",
  });

  pgm.createType("invoice_item_type", ["product", "service", "discount", "shipping", "tax"]);
  pgm.createTable("invoice_items", {
    id: "id",
    invoice_id: {
      type: "varchar(40)",
      notNull: true,
      references: '"invoices"',
      onDelete: "CASCADE",
    },
    tax_id: {
      type: "varchar(40)",
      notNull: false,
      references: '"taxes"',
      onDelete: "RESTRICT",
    },
    type: { type: "invoice_item_type", notNull: true, default: "product" },
    name: { type: "varchar(255)", notNull: true },
    description: { type: "varchar(255)", notNull: false },
    quantity: { type: "integer", notNull: true },
    price: { type: "numeric(15,5)", notNull: true },
    created_at: "created_at",
    updated_at: "updated_at",
    deleted_at: "deleted_at",
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("invoice_items");
  pgm.dropType("invoice_item_type");

  pgm.dropTable("invoices");
  pgm.dropType("invoice_status");
  pgm.dropType("invoice_type");

  pgm.dropTable("taxes");
  pgm.dropType("tax_calc_type");

  pgm.dropTable("addresses");
  pgm.dropType("address_type");

  pgm.dropTable("users");
  pgm.dropType("user_role");
}
