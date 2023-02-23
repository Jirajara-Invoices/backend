import { BaseUseCase } from "../common/base";
import { InvoiceRepositoryPort } from "../invoices/interfaces";
import { PDFInvoicePrinterPort, PDFInvoiceUseCasePort } from "./interfaces";
import { ValidationError } from "../../entities/errors";
import { LoggerUseCasePort, TranslationUseCasePort } from "../common/interfaces";
import { User } from "../../entities/models/users";

export class PDFInvoiceUseCase extends BaseUseCase implements PDFInvoiceUseCasePort {
  constructor(
    private readonly invoiceRepository: InvoiceRepositoryPort,
    private readonly printerRepository: PDFInvoicePrinterPort,
    private readonly logger: LoggerUseCasePort,
    translator: TranslationUseCasePort,
    currentUser: User | null,
  ) {
    super(translator, currentUser);
  }

  public async generatePDFInvoice(id: string): Promise<Blob> {
    const invoice = await this.invoiceRepository.findByID(id);
    if (!this.isCurrentUserAuthorized(invoice.user_id)) {
      throw new ValidationError(this.translator.translate("generatePdfError"), new Map());
    }

    return this.printerRepository.generate(invoice);
  }
}
