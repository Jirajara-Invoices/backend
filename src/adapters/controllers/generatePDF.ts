import { Request, Response } from "express";
import Redis from "ioredis";
import { DatabasePool } from "slonik";
import { getAuthUser } from "../../utilities/context";
import { logger } from "../../utilities/winston";
import { UserRepository } from "../repositories/users/users";
import { LoggerAdapter } from "../common/logger";
import { UserUseCase } from "../../usecases/users/usecase";
import { AddressRepository } from "../repositories/addresses/addresses";
import { InvoiceRepository } from "../repositories/invoices/invoices";
import { PDFInvoicePrinter } from "../repositories/print_invoices/print_invoices";
import { PDFInvoiceUseCase } from "../../usecases/pdf_invoices/usecase";
import { TranslatorAdapter } from "../common/i18n";

export const generatePDF =
  (dbPool: DatabasePool, redis: Redis) => async (req: Request, res: Response) => {
    const translator = new TranslatorAdapter(req.i18n.t);

    const userRepository = new UserRepository(dbPool, translator);
    const userUseCase = new UserUseCase(userRepository, logger, translator);
    const loggerAdapter = new LoggerAdapter(logger.child({ session: req.session.id }));
    const user = await getAuthUser(req.session, userUseCase, redis, loggerAdapter);

    if (!user) {
      res.status(401).send("You are not authorized to perform this action");
    }

    const addressRepository = new AddressRepository(dbPool, translator);
    const invoiceRepository = new InvoiceRepository(dbPool, translator);
    const pdfRepository = new PDFInvoicePrinter(addressRepository, invoiceRepository);
    const pdfUseCase = new PDFInvoiceUseCase(
      invoiceRepository,
      pdfRepository,
      loggerAdapter,
      translator,
      user,
    );

    const invoice = await pdfUseCase.generatePDFInvoice(req.params.id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${req.params.id}.pdf`);
    res.type(invoice.type);
    res.send(Buffer.from(await invoice.arrayBuffer()));
  };
