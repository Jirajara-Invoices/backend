import { jsPDF } from "jspdf";
import { readFileSync } from "fs";

const doc = new jsPDF({
  format: "letter",
  putOnlyUsedFonts: true,
});

const robotoLight = readFileSync("assets/fonts/Roboto/Roboto-Light.ttf", {
  encoding: "latin1",
});
const robotoRegular = readFileSync("assets/fonts/Roboto/Roboto-Regular.ttf", {
  encoding: "latin1",
});
const robotoMedium = readFileSync("assets/fonts/Roboto/Roboto-Medium.ttf", {
  encoding: "latin1",
});
const robotoBold = readFileSync("assets/fonts/Roboto/Roboto-Bold.ttf", {
  encoding: "latin1",
});

doc.addFileToVFS("Roboto-Light.ttf", robotoLight);
doc.addFont("Roboto-Light.ttf", "Roboto", "normal", 300);
doc.addFileToVFS("Roboto-Regular.ttf", robotoRegular);
doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
doc.addFileToVFS("Roboto-Medium.ttf", robotoMedium);
doc.addFont("Roboto-Medium.ttf", "Roboto", "normal", 500);
doc.addFileToVFS("Roboto-Bold.ttf", robotoBold);
doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

doc.setFont("Roboto", "bold");
doc.setFontSize(20);
doc.setTextColor("#585858");
doc.text("Invoice", 10, 10, { baseline: "top" });

// Add titles and headers
doc.setFont("Roboto", "500normal");
doc.setFontSize(10);
doc.setTextColor("#d97903");
doc.setDrawColor("#d97903");
doc.text("Adolfo Abraham Bastardo Duran", 10, 25, { baseline: "top" });
doc.text("Fecha", 140, 25, { baseline: "top", maxWidth: 30 });
doc.line(140, 30, 205, 30);
doc.text("Fecha de vencimiento", 140, 32, { baseline: "top", maxWidth: 30 });
doc.line(140, 42, 205, 42);
doc.text("Factura No. #", 140, 44, { baseline: "top", maxWidth: 30 });
doc.line(140, 49, 205, 49);
doc.text("No. de Control #", 140, 51, { baseline: "top", maxWidth: 30 });
doc.line(140, 56, 205, 56);

doc.text("Cobrar a:", 10, 64, { baseline: "top" });
doc.line(10, 68, 115, 68);
doc.text("Comentarios:", 120, 64, { baseline: "top" });
doc.line(120, 68, 205, 68);

doc.setFont("Roboto", "normal");

// Add address
doc.setFontSize(9);
doc.text(
  [
    "Av Principal de San Miguel, #72-41",
    "Independencia, Yaracuy, Venezuela",
    "adolfo.bastardo@justo.mx",
    "58 (412) 540 6318",
  ],
  10,
  32,
  {
    baseline: "top",
    lineHeightFactor: 1.5,
    maxWidth: 150,
  },
);

// Add invoice details
doc.setTextColor("#303030");
doc.text("01/01/2023", 205, 25, { baseline: "top", maxWidth: 30, align: "right" });
doc.text("01/01/2023", 205, 32, { baseline: "top", maxWidth: 30, align: "right" });
doc.text("1", 205, 44, { baseline: "top", maxWidth: 30, align: "right" });
doc.text("000-000-000000001", 205, 51, { baseline: "top", maxWidth: 30, align: "right" });

doc.text(
  [
    "Poder Justo, S.A.P.I de C.V",
    "Justo",
    "RFC JST-000000-000",
    "Calle Sur 105 No. 1206, Col Aeronáutica Militar",
    "Ciudad de México, México",
    "52 5580946047",
  ],
  10,
  70,
  { baseline: "top", maxWidth: 100, lineHeightFactor: 1.5 },
);

// Add comments
doc.setFont("Roboto", "300normal");
doc.setFontSize(8);
doc.text("Este documento es una representación impresa de una factura.", 120, 70, {
  baseline: "top",
  lineHeightFactor: 1.5,
  maxWidth: 80,
});

const data = [];

for (let i = 0; i < 3; i++) {
  data.push({
    concept: "Concepto " + i,
    quantity: `${i}`,
    price: "$ 100.00",
    total: "$ 100.00",
  });
}

if (data.length < 10) {
  const length = data.length;
  for (let i = 0; i < 10 - length; i++) {
    data.push({
      concept: " ",
      quantity: " ",
      price: " ",
      total: " ",
    });
  }
}

let rowY = 110;
let currentPage = 1;

// Add invoice items
doc.setFont("Roboto", "normal");
doc.table(
  10,
  110,
  data,
  [
    {
      name: "concept",
      width: 150,
      align: "left",
      prompt: "Concepto",
      padding: 0,
    },
    {
      name: "quantity",
      width: 35,
      align: "center",
      prompt: "Cantidad",
      padding: 0,
    },
    {
      name: "price",
      width: 35,
      align: "left",
      prompt: "Precio",
      padding: 0,
    },
    {
      name: "total",
      width: 40,
      align: "left",
      prompt: "Total",
      padding: 0,
    },
  ],
  {
    headerTextColor: "#d97903",
    headerBackgroundColor: "#f5f5f5",
    fontSize: 9,
    // @ts-ignore
    margins: { top: 10, left: 10, bottom: 10, right: 10 },
    rowStart: (r, cdoc) => {
      if (cdoc.getCurrentPageInfo().pageNumber !== currentPage) {
        rowY = 0;
        currentPage = cdoc.getCurrentPageInfo().pageNumber;
      }
      if (r.data) {
        // @ts-ignore
        const d = cdoc.getTextDimensions(r.data.concept, { maxWidth: 150 });
        rowY += d.h + 8;
      }
    },
  },
);

if (rowY > 240) {
  rowY = 0;
  doc.addPage();
}

doc.setFont("Roboto", "bold");
doc.setFontSize(10);
doc.setTextColor("#585858");
doc.text("Términos y condiciones", 10, rowY + 10, { baseline: "top", maxWidth: 100 });
doc.text("Subtotal", 140, rowY + 10, { baseline: "top", maxWidth: 50 });
doc.text("IVA", 140, rowY + 18, { baseline: "top", maxWidth: 50 });
doc.text("Otros Impuestos", 140, rowY + 26, { baseline: "top", maxWidth: 50 });
doc.text("Total", 140, rowY + 34, { baseline: "top", maxWidth: 50 });

doc.setFont("Roboto", "normal");
doc.setTextColor("#303030");

doc.text(
  "Términos y condiciones necesarias para llevar a cabo la cancelación de la factura",
  10,
  rowY + 15,
  { baseline: "top", maxWidth: 120 },
);

doc.text("$ 100.00", 205, rowY + 10, { baseline: "top", maxWidth: 50, align: "right" });
doc.text("$ 100.00", 205, rowY + 18, { baseline: "top", maxWidth: 50, align: "right" });
doc.text("$ 100.00", 205, rowY + 26, { baseline: "top", maxWidth: 50, align: "right" });
doc.text("$ 100.00", 205, rowY + 34, { baseline: "top", maxWidth: 50, align: "right" });

doc.save("invoice.pdf");
