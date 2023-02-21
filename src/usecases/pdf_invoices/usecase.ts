import { BaseUseCase } from "../common/base";
import { InvoiceRepositoryPort } from "../invoices/interfaces";
import { PDFInvoicePrinterPort, PDFInvoiceUseCasePort } from "./interfaces";
import { ValidationError } from "../../entities/errors";
import { LoggerUseCasePort } from "../common/interfaces";
import { User } from "../../entities/models/users";

export class PDFInvoiceUseCase extends BaseUseCase implements PDFInvoiceUseCasePort {
  constructor(
    private readonly invoiceRepository: InvoiceRepositoryPort,
    private readonly printerRepository: PDFInvoicePrinterPort,
    private readonly logger: LoggerUseCasePort,
    currentUser: User | null,
  ) {
    super(currentUser);
  }

  public async generatePDFInvoice(id: string): Promise<Blob> {
    const invoice = await this.invoiceRepository.findByID(id);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      this.logger.error(`User is not authorized to generate this invoice`);
      throw new ValidationError("User is not authorized to generate this invoice", new Map());
    }

    return this.printerRepository.generate(invoice);
  }
}
