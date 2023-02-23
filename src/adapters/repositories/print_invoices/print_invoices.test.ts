import { It, Mock } from "moq.ts";
import { InvoiceRepositoryPort } from "../../../usecases/invoices/interfaces";
import { PDFInvoicePrinter } from "./print_invoices";
import { AddressRepositoryPort } from "../../../usecases/addresses/interfaces";
import { Invoice, InvoiceStatus, InvoiceType } from "../../../entities/models/invoice";
import { Address, AddressType } from "../../../entities/models/addresses";
import { InvoiceItem, InvoiceItemType } from "../../../entities/models/invoice_items";
import { Tax, TaxCalcType } from "../../../entities/models/taxes";
import { TranslationUseCasePort } from "../../../usecases/common/interfaces";

describe("PrintInvoices", () => {
  const invoice: Invoice = {
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
  let address: Address;
  let clientAddress: Address;
  let addressRepository: AddressRepositoryPort;
  let invoiceRepository: InvoiceRepositoryPort;
  const translator: TranslationUseCasePort = new Mock<TranslationUseCasePort>()
    .setup((x) => x.translate(It.IsAny(), It.IsAny()))
    .returns("translated")
    .setup((x) => x.translate(It.IsAny()))
    .returns("translated")
    .object();

  const items: InvoiceItem[] = [
    {
      id: "1",
      invoice_id: "1",
      type: InvoiceItemType.Product,
      name: "IVA",
      description: "IVA",
      quantity: 1,
      price: 100,
      tax_id: "1",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: undefined,
    },
  ];
  const taxes: Tax[] = [
    {
      id: "1",
      name: "IVA",
      rate: 12,
      calc_type: TaxCalcType.Percentage,
      user_id: "1",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: undefined,
    },
  ];

  it("should print invoices", async () => {
    address = {
      id: "1",
      user_id: "1",
      type: AddressType.Personal,
      name: "name",
      tax_id: "taxId",
      email: "email@example.com",
      number: "number",
      comment: "comment",
      street: "street",
      zipcode: "zipcode",
      city: "city",
      state: "state",
      country: "VE",
      created_at: new Date(),
      updated_at: new Date(),
    };
    clientAddress = {
      id: "2",
      user_id: "1",
      type: AddressType.Clients,
      name: "name",
      tax_id: "taxId",
      email: "email@example.com",
      number: "number 2",
      comment: "comment 2",
      street: "street",
      zipcode: "zipcode",
      city: "city",
      state: "state",
      country: "VE",
      created_at: new Date(),
      updated_at: new Date(),
    };
    addressRepository = new Mock<AddressRepositoryPort>()
      .setup((x) => x.findByID(It.Is((id: string) => id === "1")))
      .returns(Promise.resolve(address))
      .setup((x) => x.findByID(It.Is((id: string) => id === "2")))
      .returns(Promise.resolve(clientAddress))
      .object();
    invoiceRepository = new Mock<InvoiceRepositoryPort>()
      .setup((x) => x.getInvoiceTaxes)
      .returns(() => Promise.resolve(taxes))
      .setup((x) => x.getInvoiceItems)
      .returns(() => Promise.resolve(items))
      .setup((x) => x.getSubtotal)
      .returns(() => Promise.resolve(100))
      .setup((x) => x.getTotal)
      .returns(() => Promise.resolve(112))
      .object();
    const printInvoices = new PDFInvoicePrinter(addressRepository, invoiceRepository, translator);
    const result = await printInvoices.generate(invoice);

    expect(result).toMatchSnapshot();
    expect(result).toBeDefined();
  });
});
