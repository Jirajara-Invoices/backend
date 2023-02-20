import { InvoiceItemType } from "../../entities/models/invoice_items";
import { CreateItemInput, UpdateItemInput } from "./interfaces";

export function validateCreateItemInput(input: CreateItemInput): Map<string, string> {
  const errors: Map<string, string> = new Map();
  if (!input.invoice_id) {
    errors.set("invoice_id", "An invoice id is required");
  }
  if (!input.type || !(Object.values(InvoiceItemType) as string[]).includes(input.type)) {
    errors.set("type", "A type is required");
  }
  if (!input.name) {
    errors.set("name", "A name is required");
  }
  if (Number.isNaN(input.price)) {
    errors.set("price", "The price is required and must be a number");
  }
  if (!input.quantity || input.quantity <= 0) {
    errors.set("quantity", "A quantity is required and must be greater than 0");
  }

  if (
    (input.type === InvoiceItemType.Tax || input.type === InvoiceItemType.Discount) &&
    input.quantity !== 1
  ) {
    errors.set("quantity", "Tax or discount items must have a quantity of 1");
  }

  return errors;
}

export function validateUpdateItemInput(input: UpdateItemInput): Map<string, string> {
  const errors: Map<string, string> = new Map();
  if (!input.id) {
    errors.set("id", "An id is required");
  }

  if (input.type && !(Object.values(InvoiceItemType) as string[]).includes(input.type)) {
    errors.set("type", "A type is required");
  }

  if (input.price && Number.isNaN(input.price)) {
    errors.set("price", "The price must be a number");
  }

  if (input.quantity && input.quantity <= 0) {
    errors.set("quantity", "Quantity must be greater than 0");
  }

  return errors;
}
