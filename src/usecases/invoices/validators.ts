import { Invoice, InvoiceStatus, InvoiceType } from "../../entities/models/invoice";
import { CreateInvoiceInput, UpdateInvoiceInput } from "./interfaces";

export function validateCreateInvoiceInput(input: CreateInvoiceInput): Map<string, string> {
  const errors: Map<string, string> = new Map();
  if (!input.user_id) {
    errors.set("user_id", "A user id is required");
  }
  if (!input.address_id) {
    errors.set("address_id", "An address id is required");
  }
  if (!input.client_address_id) {
    errors.set("client_address_id", "A client address id is required");
  }
  if (!input.type || !(Object.values(InvoiceType) as string[]).includes(input.type)) {
    errors.set("type", "An invoice type is required");
  }
  if (!input.number) {
    errors.set("number", "An invoice number is required");
  }
  if (!input.date) {
    errors.set("date", "An invoice date is required");
  }
  if (!input.due_date || input.due_date < input.date) {
    errors.set("due_date", "An invoice due date is required");
  }
  if (!input.status || !(Object.values(InvoiceStatus) as string[]).includes(input.status)) {
    errors.set("status", "An invoice status is required");
  }

  return errors;
}

export function validateUpdateInvoiceInput(
  invoice: Invoice,
  input: UpdateInvoiceInput,
): Map<string, string> {
  const errors: Map<string, string> = new Map();
  if (!input.id) {
    errors.set("id", "An id is required");
  }

  if (input.type && !(Object.values(InvoiceType) as string[]).includes(input.type)) {
    errors.set("type", "An invoice type is required");
  }

  if (input.status && !(Object.values(InvoiceStatus) as string[]).includes(input.status)) {
    errors.set("status", "An invoice status is required");
  }
  if (
    input.date &&
    (input.date > invoice.due_date || (input.due_date && input.date > input.due_date))
  ) {
    errors.set("date", "Is not possible to set the invoice date after the due date");
  }
  if (
    input.due_date &&
    (input.due_date < invoice.date || (input.date && input.due_date < input.date))
  ) {
    errors.set("due_date", "Is not possible to set the invoice due date before the date");
  }

  return errors;
}
