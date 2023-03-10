/* eslint-disable no-undef */
const migrations = require("node-pg-migrate");

exports.shorthands = {
  id: {
    type: "varchar(40)",
    notNull: true,
    primaryKey: true,
  },
  created_at: {
    type: "timestamp with time zone",
    notNull: true,
    default: new migrations.PgLiteral("current_timestamp"),
  },
  updated_at: {
    type: "timestamp with time zone",
    notNull: true,
    default: new migrations.PgLiteral("current_timestamp"),
  },
  deleted_at: {
    type: "timestamp with time zone",
    notNull: false,
  },
};

exports.up = (pgm) => {
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
    tax_id: { type: "varchar(255)", notNull: false },
    email: { type: "varchar(255)", notNull: false },
    street: { type: "varchar(255)", notNull: false },
    number: { type: "varchar(255)", notNull: false },
    comment: { type: "varchar(255)", notNull: false },
    zipcode: { type: "varchar(255)", notNull: false },
    city: { type: "varchar(255)", notNull: false },
    state: { type: "varchar(255)", notNull: false },
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
};

// eslint-disable-next-line no-undef
exports.down = (pgm) => {
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
};
