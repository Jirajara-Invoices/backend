import { Invoice } from "../../entities/models/invoice";
import { BaseUseCase } from "../common/base";

export interface PDFInvoiceUseCasePort extends BaseUseCase {
  generatePDFInvoice(id: string): Promise<Blob>;
}

export interface PDFInvoicePrinterPort {
  generate(invoice: Invoice): Promise<Blob>;
}
