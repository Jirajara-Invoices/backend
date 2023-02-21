import { IMock, It, Mock } from "moq.ts";
import { User, UserRole } from "../../entities/models/users";
import { Invoice, InvoiceStatus, InvoiceType } from "../../entities/models/invoice";
import { LoggerUseCasePort } from "../common/interfaces";
import { InvoiceRepositoryPort } from "../invoices/interfaces";
import { PDFInvoicePrinterPort } from "./interfaces";
import { PDFInvoiceUseCase } from "./usecase";

function b64toBlob(dataURI: string) {
  const buffer = Buffer.from(dataURI, "base64");
  return new Blob([buffer], { type: "image/jpeg" });
}

describe("Generate PDF invoice Use Case", () => {
  let invoiceRepository: IMock<InvoiceRepositoryPort>;
  let printerRepository: IMock<PDFInvoicePrinterPort>;
  let currentUser: User;
  let invoice: Invoice;
  let logger: LoggerUseCasePort;
  const blankInvoice =
    '"data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDM4Cj4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVGwMDHUszRSKErlCtfiyuMK5AIAXQ8GCgplbmRzdHJlYW0KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL01lZGlhQm94IFswIDAgNTk1LjQ0IDg0MS45Ml0KL1Jlc291cmNlcyA8PAo+PgovQ29udGVudHMgNSAwIFIKL1BhcmVudCAyIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzQgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL3RyYXBwZWQgKGZhbHNlKQovQ3JlYXRvciAoU2VyaWYgQWZmaW5pdHkgRGVzaWduZXIgMS4xMC40KQovVGl0bGUgKFVudGl0bGVkLnBkZikKL0NyZWF0aW9uRGF0ZSAoRDoyMDIyMDEwNjE0MDg1OCswOScwMCcpCi9Qcm9kdWNlciAoaUxvdmVQREYpCi9Nb2REYXRlIChEOjIwMjIwMTA2MDUwOTA5WikKPj4KZW5kb2JqCjYgMCBvYmoKPDwKL1NpemUgNwovUm9vdCAxIDAgUgovSW5mbyAzIDAgUgovSUQgWzwyODhCM0VENTAyOEU0MDcyNERBNzNCOUE0Nzk4OUEwQT4gPEY1RkJGNjg4NkVERDZBQUNBNDRCNEZDRjBBRDUxRDlDPl0KL1R5cGUgL1hSZWYKL1cgWzEgMiAyXQovRmlsdGVyIC9GbGF0ZURlY29kZQovSW5kZXggWzAgN10KL0xlbmd0aCAzNgo+PgpzdHJlYW0KeJxjYGD4/5+RUZmBgZHhFZBgDAGxakAEP5BgEmFgAABlRwQJCmVuZHN0cmVhbQplbmRvYmoKc3RhcnR4cmVmCjUzMgolJUVPRgo="';

  beforeEach(() => {
    invoiceRepository = new Mock<InvoiceRepositoryPort>();
    printerRepository = new Mock<PDFInvoicePrinterPort>();
    invoice = {
      id: "1",
      user_id: "1",
      address_id: "1",
      client_address_id: "2",
      type: InvoiceType.Invoice,
      date: new Date(),
      due_date: new Date(),
      number: "12345",
      status: InvoiceStatus.Draft,
      terms: "",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: undefined,
    };
    logger = new Mock<LoggerUseCasePort>()
      .setup((x) => x.error(It.IsAny()))
      .returns()
      .object();

    currentUser = {
      id: "1",
      name: "name",
      email: "email",
      role: UserRole.User,
      country: "VE",
      created_at: new Date(),
      updated_at: new Date(),
    };
  });

  it("should generate a PDF invoice", async () => {
    const blob = b64toBlob(blankInvoice);
    invoiceRepository
      .setup((x) => x.findByID(It.IsAny()))
      .returns(Promise.resolve(invoice))
      .object();
    printerRepository
      .setup((x) => x.generate(It.IsAny()))
      .returns(Promise.resolve(b64toBlob(blankInvoice)))
      .object();

    const useCase = new PDFInvoiceUseCase(
      invoiceRepository.object(),
      printerRepository.object(),
      logger,
      currentUser,
    );
    const pdf = await useCase.generatePDFInvoice("1");
    expect(pdf).toEqual(blob);
  });
});
