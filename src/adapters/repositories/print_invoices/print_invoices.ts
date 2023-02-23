import isoCountries from "i18n-iso-countries";
import { readFileSync } from "fs";
import { CellConfig, jsPDF } from "jspdf";
import { Address } from "../../../entities/models/addresses";
import { Invoice } from "../../../entities/models/invoice";
import { InvoiceRepositoryPort } from "../../../usecases/invoices/interfaces";
import { PDFInvoicePrinterPort } from "../../../usecases/pdf_invoices/interfaces";
import { AddressRepositoryPort } from "../../../usecases/addresses/interfaces";
import { InvoiceItem } from "../../../entities/models/invoice_items";
import { Tax, TaxCalcType } from "../../../entities/models/taxes";
import { TranslationUseCasePort } from "../../../usecases/common/interfaces";

export class PDFInvoicePrinter implements PDFInvoicePrinterPort {
  private readonly NORMAL_COLOR = "#303030";
  private readonly SUBTITLE_COLOR = "#585858";
  private readonly TITLE_COLOR = "#d97903";
  private readonly HEADER_BACKGROUND_COLOR = "#f5f5f5";
  private doc: jsPDF | null = null;
  private invoice: Invoice | null = null;
  private address: Address | null = null;
  private clientAddress: Address | null = null;
  private items: InvoiceItem[] = [];
  private taxes: Tax[] = [];
  private subtotal = 0;
  private total = 0;
  private dateIntl = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Caracas",
  });
  private numIntl = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  private rowPointer = 110;
  private currentPage = 1;
  private readonly ROW_ADD_HEIGHT = 8;

  private readonly tableHeaders: CellConfig[];

  constructor(
    private readonly addressRepository: AddressRepositoryPort,
    private readonly invoiceRepository: InvoiceRepositoryPort,
    private readonly translator: TranslationUseCasePort,
  ) {
    this.tableHeaders = [
      {
        name: "concept",
        width: 150,
        align: "left",
        prompt: this.translator.translate("invoicePDFInvoiceItemsConcept"),
        padding: 0,
      },
      {
        name: "quantity",
        width: 35,
        align: "center",
        prompt: this.translator.translate("invoicePDFInvoiceItemsQuantity"),
        padding: 0,
      },
      {
        name: "price",
        width: 35,
        align: "left",
        prompt: this.translator.translate("invoicePDFInvoiceItemsPrice"),
        padding: 0,
      },
      {
        name: "total",
        width: 40,
        align: "left",
        prompt: this.translator.translate("invoicePDFInvoiceItemsTotal"),
        padding: 0,
      },
    ];
  }

  public async generate(invoice: Invoice): Promise<Blob> {
    this.invoice = invoice;
    this.address = await this.addressRepository.findByID(this.invoice.address_id);
    this.clientAddress = await this.addressRepository.findByID(this.invoice.client_address_id);
    this.items = await this.invoiceRepository.getInvoiceItems(this.invoice.id);
    this.taxes = await this.invoiceRepository.getInvoiceTaxes(this.invoice.id);
    this.subtotal = await this.invoiceRepository.getSubtotal(this.invoice.id);
    this.total = await this.invoiceRepository.getTotal(this.invoice.id);
    this.createPDF();
    this.addTitlesAndHeaders();
    this.addInvoiceDetails();
    this.addInvoiceItems();
    this.addInvoiceTotals();

    this.doc?.setDocumentProperties({
      author: this.address?.name,
      title: this.translator.translate("invoicePDFTitleWithNumber", {
        invoiceNumber: this.invoice?.number.toString() ?? 0,
      }),
      creator: "Jirajara Invoice Generator",
      subject: this.translator.translate("invoicePDFTitle"),
    });

    const blob = this.doc?.output("blob");
    if (!blob) {
      throw new Error(this.translator.translate("invoicePDFError"));
    }

    return blob;
  }

  private createPDF() {
    this.doc = new jsPDF({
      format: "letter",
      putOnlyUsedFonts: true,
    });
    this.loadFonts();
  }

  private loadFonts() {
    if (!this.doc) {
      throw new Error(this.translator.translate("invoicePDFDocError"));
    }
    const { pathname } = new URL("../../../../", import.meta.url);
    const robotoLight = readFileSync(`${pathname}assets/fonts/Roboto/Roboto-Light.ttf`, {
      encoding: "latin1",
    });
    const robotoRegular = readFileSync(`${pathname}assets/fonts/Roboto/Roboto-Regular.ttf`, {
      encoding: "latin1",
    });
    const robotoMedium = readFileSync(`${pathname}assets/fonts/Roboto/Roboto-Medium.ttf`, {
      encoding: "latin1",
    });
    const robotoBold = readFileSync(`${pathname}assets/fonts/Roboto/Roboto-Bold.ttf`, {
      encoding: "latin1",
    });
    this.doc.addFileToVFS("Roboto-Light.ttf", robotoLight);
    this.doc.addFont("Roboto-Light.ttf", "Roboto", "normal", 300);
    this.doc.addFileToVFS("Roboto-Regular.ttf", robotoRegular);
    this.doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    this.doc.addFileToVFS("Roboto-Medium.ttf", robotoMedium);
    this.doc.addFont("Roboto-Medium.ttf", "Roboto", "normal", 500);
    this.doc.addFileToVFS("Roboto-Bold.ttf", robotoBold);
    this.doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  }

  private addTitlesAndHeaders() {
    if (!this.doc || !this.address) {
      throw new Error(this.translator.translate("invoicePDFFieldsError"));
    }

    this.doc.setFont("Roboto", "bold");
    this.doc.setFontSize(20);
    this.doc.setTextColor("#585858");
    this.doc.text(this.translator.translate("invoicePDFTitle"), 10, 10, { baseline: "top" });

    // Add titles and headers
    this.doc.setFont("Roboto", "500normal");
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.TITLE_COLOR);
    this.doc.setDrawColor(this.TITLE_COLOR);
    this.doc.text(this.address.name || "", 10, 25, { baseline: "top" });
    this.doc.text(this.translator.translate("invoicePDFDate"), 140, 25, {
      baseline: "top",
      maxWidth: 30,
    });
    this.doc.line(140, 30, 205, 30);
    this.doc.text(this.translator.translate("invoicePDFDueDate"), 140, 32, {
      baseline: "top",
      maxWidth: 30,
    });
    this.doc.line(140, 42, 205, 42);
    this.doc.text(this.translator.translate("invoicePDFInvoiceNumber"), 140, 44, {
      baseline: "top",
      maxWidth: 30,
    });
    this.doc.line(140, 49, 205, 49);
    this.doc.text(this.translator.translate("invoicePDFInvoiceControlNumber"), 140, 51, {
      baseline: "top",
      maxWidth: 30,
    });
    this.doc.line(140, 56, 205, 56);

    this.doc.text(this.translator.translate("invoicePDFInvoiceBillTo"), 10, 64, {
      baseline: "top",
    });
    this.doc.line(10, 68, 115, 68);
    this.doc.text(this.translator.translate("invoicePDFInvoiceComments"), 120, 64, {
      baseline: "top",
    });
    this.doc.line(120, 68, 205, 68);
  }

  private addInvoiceDetails() {
    if (!this.doc || !this.invoice || !this.address || !this.clientAddress) {
      throw new Error(this.translator.translate("invoicePDFFieldsError"));
    }

    this.doc.setFont("Roboto", "normal");

    // Add address
    this.doc.setFontSize(9);
    this.doc.text(this._generateAddressLines(this.address), 10, 32, {
      baseline: "top",
      lineHeightFactor: 1.5,
      maxWidth: 150,
    });

    // Add invoice details
    this.doc.setTextColor(this.NORMAL_COLOR);
    this.doc.text(this.dateIntl.format(this.invoice.date), 205, 25, {
      baseline: "top",
      maxWidth: 30,
      align: "right",
    });
    this.doc.text(this.dateIntl.format(this.invoice.due_date), 205, 32, {
      baseline: "top",
      maxWidth: 30,
      align: "right",
    });
    this.doc.text(this.invoice.number, 205, 44, { baseline: "top", maxWidth: 30, align: "right" });
    this.doc.text(this.invoice.number, 205, 51, { baseline: "top", maxWidth: 30, align: "right" });

    this.doc.text(this._generateAddressLines(this.clientAddress), 10, 70, {
      baseline: "top",
      maxWidth: 100,
      lineHeightFactor: 1.5,
    });

    if (this.clientAddress.comment) {
      // Add comments
      this.doc.setFont("Roboto", "300normal");
      this.doc.setFontSize(8);
      this.doc.text(this.clientAddress.comment, 120, 70, {
        baseline: "top",
        lineHeightFactor: 1.5,
        maxWidth: 80,
      });
    }
  }

  private _generateAddressLines(address: Address) {
    if (!this.doc) {
      throw new Error(this.translator.translate("invoicePDFFieldsError"));
    }
    const clientData: string[] = this.doc.splitTextToSize(`${address.name}`, 150);
    if (address.tax_id) {
      clientData.push(...this.doc.splitTextToSize(`${address.tax_id}`, 150));
    }
    if (address.street) {
      clientData.push(...this.doc.splitTextToSize(`${address.street}, ${address.zipcode}`, 150));
    }
    if (address.city && address.state) {
      clientData.push(
        ...this.doc.splitTextToSize(
          `${address.city} ${address.state} - ${isoCountries.getName(address.country, "en")}`,
          150,
        ),
      );
    } else {
      clientData.push(
        ...this.doc.splitTextToSize(`${isoCountries.getName(address.country, "en")}`, 150),
      );
    }
    if (address.email) {
      clientData.push(...this.doc.splitTextToSize(address.email, 150));
    }
    if (address.number) {
      clientData.push(...this.doc.splitTextToSize(address.number, 150));
    }

    return clientData;
  }

  private addInvoiceItems() {
    if (!this.doc || !this.invoice) {
      throw new Error(this.translator.translate("invoicePDFFieldsError"));
    }

    const itemsData = this.items.map((item) => ({
      concept: `${item.name} - ${item.description}`,
      quantity: item.quantity.toString(),
      price: this.numIntl.format(item.price),
      total: this.numIntl.format(item.price * item.quantity),
    }));

    if (itemsData.length < 10) {
      const length = itemsData.length;
      for (let i = 0; i < 10 - length; i++) {
        itemsData.push({
          concept: " ",
          quantity: " ",
          price: " ",
          total: " ",
        });
      }
    }

    this.doc.table(10, 110, itemsData, this.tableHeaders, {
      headerTextColor: this.TITLE_COLOR,
      headerBackgroundColor: this.HEADER_BACKGROUND_COLOR,
      fontSize: 9,
      // @ts-ignore
      margins: { top: 10, left: 10, bottom: 10, right: 10 },
      rowStart: (r, doc) => {
        if (doc.getCurrentPageInfo().pageNumber !== this.currentPage) {
          this.rowPointer = 0;
          this.currentPage = doc.getCurrentPageInfo().pageNumber;
        }
        if (r.data) {
          // @ts-ignore
          const d = doc.getTextDimensions(r.data.concept, { maxWidth: 150 });
          this.rowPointer += d.h + this.ROW_ADD_HEIGHT;
        }
      },
    });

    if (this.rowPointer > 240) {
      this.rowPointer = 0;
      this.doc.addPage();
    }
  }

  private addInvoiceTotals() {
    if (!this.doc || !this.invoice) {
      throw new Error(this.translator.translate("invoicePDFFieldsError"));
    }

    // add subtitles
    this.doc.setFont("Roboto", "bold");
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.SUBTITLE_COLOR);
    this.doc.text(this.translator.translate("invoicePDFInvoiceTerms"), 10, this.rowPointer + 10, {
      baseline: "top",
      maxWidth: 100,
    });
    this.doc.text(
      this.translator.translate("invoicePDFInvoiceSubtotal"),
      140,
      this.rowPointer + 10,
      { baseline: "top", maxWidth: 50 },
    );
    this.doc.text(this.translator.translate("invoicePDFInvoiceVAT"), 140, this.rowPointer + 18, {
      baseline: "top",
      maxWidth: 50,
    });
    this.doc.text(this.translator.translate("invoicePDFInvoiceTaxes"), 140, this.rowPointer + 26, {
      baseline: "top",
      maxWidth: 50,
    });
    this.doc.text(this.translator.translate("invoicePDFInvoiceTotal"), 140, this.rowPointer + 34, {
      baseline: "top",
      maxWidth: 50,
    });

    this.doc.setFont("Roboto", "normal");
    this.doc.setTextColor(this.NORMAL_COLOR);

    if (this.invoice.terms) {
      this.doc.text(this.invoice.terms, 10, this.rowPointer + 15, {
        baseline: "top",
        maxWidth: 120,
      });
    }

    const ivaTax = this.taxes.find((tax) =>
      tax.name.includes(this.translator.translate("invoicePDFInvoiceVAT")),
    );
    const otherTaxes = this.taxes.filter(
      (tax) => !tax.name.includes(this.translator.translate("invoicePDFInvoiceVAT")),
    );

    // The iva tax is always calculated as a percentage of each item that has the iva tax
    const ivaTaxAmount = ivaTax
      ? this.items
          .filter((item) => item.tax_id === ivaTax.id)
          .reduce((acc, item) => acc + item.price * item.quantity * (ivaTax.rate / 100), 0)
      : 0;

    const otherTaxesAmount = otherTaxes.reduce((acc, tax) => {
      const itemsWithTax = this.items.filter((item) => item.tax_id === tax.id);
      const taxAmount = itemsWithTax.reduce((acc, item) => {
        if (tax.calc_type === TaxCalcType.Percentage) {
          return acc + item.price * item.quantity * (tax.rate / 100);
        }

        return acc + tax.rate;
      }, 0);
      return acc + taxAmount;
    }, 0);

    this.doc.text(this.numIntl.format(this.subtotal), 205, this.rowPointer + 10, {
      baseline: "top",
      maxWidth: 50,
      align: "right",
    });
    this.doc.text(this.numIntl.format(ivaTaxAmount), 205, this.rowPointer + 18, {
      baseline: "top",
      maxWidth: 50,
      align: "right",
    });
    this.doc.text(this.numIntl.format(otherTaxesAmount), 205, this.rowPointer + 26, {
      baseline: "top",
      maxWidth: 50,
      align: "right",
    });
    this.doc.text(this.numIntl.format(this.subtotal), 205, this.rowPointer + 34, {
      baseline: "top",
      maxWidth: 50,
      align: "right",
    });
  }
}
