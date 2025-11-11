import PDFDocument from "pdfkit";
import { Response } from "express";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactions: Array<{
    date: Date;
    type: "income" | "expense";
    category: string;
    amount: number;
    description?: string;
  }>;
  period: {
    start: Date;
    end: Date;
  };
}

interface ESGData {
  score: number;
  badge: "bronze" | "silver" | "gold" | null;
  responses: Array<{
    category: string;
    question: string;
    response: boolean;
    points: number;
  }>;
  suggestions: string[];
}

interface ProductionData {
  totalAnimals: number;
  averageGMD: number;
  milkProduction: Array<{
    date: Date;
    quantity: number;
    animal: string;
  }>;
  weighings: Array<{
    date: Date;
    weight: number;
    animal: string;
  }>;
}

/**
 * Gerar relatório financeiro em PDF
 */
export async function generateFinancialReport(data: FinancialData, res: Response) {
  const doc = new PDFDocument({ margin: 50 });

  // Configurar headers HTTP
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=relatorio-financeiro-${Date.now()}.pdf`
  );

  // Pipe do PDF para a resposta HTTP
  doc.pipe(res);

  // Cabeçalho
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("Relatório Financeiro", { align: "center" });

  doc.moveDown();
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(
      `Período: ${data.period.start.toLocaleDateString("pt-BR")} a ${data.period.end.toLocaleDateString("pt-BR")}`,
      { align: "center" }
    );

  doc.moveDown(2);

  // Resumo Financeiro
  doc.fontSize(16).font("Helvetica-Bold").text("Resumo Financeiro");
  doc.moveDown();

  const summaryY = doc.y;
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Receitas: R$ ${data.totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, {
      continued: false,
    });
   doc.text(`Despesas: R$ ${data.totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);  
  doc.fillColor(data.balance >= 0 ? "green" : "red");
  doc.text(`Saldo: R$ ${data.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
  doc.fillColor("black");

  doc.moveDown(2);

  // Gerar gráfico de receitas vs despesas
  try {
    const chartWidth = 500;
    const chartHeight = 300;
    const chartCanvas = new ChartJSNodeCanvas({ width: chartWidth, height: chartHeight });
    
    const chartConfig: any = {
      type: "bar",
      data: {
        labels: ["Receitas", "Despesas", "Saldo"],
        datasets: [
          {
            label: "Valores (R$)",
            data: [data.totalIncome, data.totalExpenses, data.balance],
            backgroundColor: ["#10b981", "#ef4444", data.balance >= 0 ? "#3b82f6" : "#ef4444"],
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: "Resumo Financeiro" },
        },
      },
    };
    
    const chartBuffer = await chartCanvas.renderToBuffer(chartConfig);
    doc.moveDown();
    doc.image(chartBuffer, { width: 400 });
  } catch (error) {
    console.error("Erro ao gerar gráfico:", error);
  }

  doc.addPage();

  // Tabela de Transações
  doc.fontSize(14).font("Helvetica-Bold").fillColor("black").text("Transações");
  doc.moveDown();

  // Cabeçalho da tabela
  const tableTop = doc.y;
  const colWidths = [80, 80, 120, 100, 120];
  const headers = ["Data", "Tipo", "Categoria", "Valor", "Descrição"];

  doc.fontSize(10).font("Helvetica-Bold");
  let xPos = 50;
  headers.forEach((header, i) => {
    doc.text(header, xPos, tableTop, { width: colWidths[i], align: "left" });
    xPos += colWidths[i];
  });

  // Linha horizontal
  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  // Dados da tabela
  doc.font("Helvetica").fontSize(9);
  let yPos = tableTop + 20;

  data.transactions.slice(0, 30).forEach((transaction) => {
    if (yPos > 700) {
      doc.addPage();
      yPos = 50;
    }

    xPos = 50;
    const row = [
      transaction.date.toLocaleDateString("pt-BR"),
      transaction.type === "income" ? "Receita" : "Despesa",
      transaction.category,
      `R$ ${transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      transaction.description || "-",
    ];

    row.forEach((cell, i) => {
      doc.text(cell, xPos, yPos, { width: colWidths[i], align: "left" });
      xPos += colWidths[i];
    });

    yPos += 20;
  });

  // Rodapé
  doc
    .fontSize(8)
    .font("Helvetica")
    .text(
      `Gerado em ${new Date().toLocaleString("pt-BR")} - Oryum Tauros ERP`,
      50,
      750,
      { align: "center" }
    );

  doc.end();
}

/**
 * Gerar relatório ESG em PDF
 */
export function generateESGReport(data: ESGData, res: Response) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=relatorio-esg-${Date.now()}.pdf`
  );

  doc.pipe(res);

  // Cabeçalho
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("Relatório ESG", { align: "center" });

  doc.moveDown(2);

  // Score e Badge
  doc.fontSize(16).font("Helvetica-Bold").text("Score ESG");
  doc.moveDown();

  doc
    .fontSize(36)
    .font("Helvetica-Bold")
    .fillColor(data.score >= 70 ? "green" : data.score >= 40 ? "orange" : "red")
    .text(`${data.score}/100`, { align: "center" });

  doc.moveDown();

  if (data.badge) {
    const badgeColors: Record<string, string> = {
      bronze: "#CD7F32",
      silver: "#C0C0C0",
      gold: "#FFD700",
    };

    doc
      .fontSize(18)
      .fillColor(badgeColors[data.badge])
      .text(`Selo ${data.badge.toUpperCase()}`, { align: "center" });
  }

  doc.moveDown(2);

  // Práticas Implementadas
  doc.fontSize(14).font("Helvetica-Bold").fillColor("black").text("Práticas por Categoria");
  doc.moveDown();

  const categories = ["environmental", "social", "governance"];
  const categoryLabels: Record<string, string> = {
    environmental: "Ambiental",
    social: "Social",
    governance: "Governança",
  };

  categories.forEach((category) => {
    const practices = data.responses.filter((r) => r.category === category);
    const implemented = practices.filter((p) => p.response).length;
    const total = practices.length;

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`${categoryLabels[category]}: ${implemented}/${total} práticas`);

    doc.moveDown(0.5);

    practices.forEach((practice) => {
      const icon = practice.response ? "✓" : "✗";
      const color = practice.response ? "green" : "red";

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor(color)
        .text(`${icon} ${practice.question}`, { indent: 20 });
    });

    doc.moveDown();
  });

  // Sugestões
  if (data.suggestions.length > 0) {
    doc.addPage();
    doc.fontSize(14).font("Helvetica-Bold").fillColor("black").text("Sugestões de Melhoria");
    doc.moveDown();

    data.suggestions.forEach((suggestion, index) => {
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`${index + 1}. ${suggestion}`, { align: "left" });
      doc.moveDown(0.5);
    });
  }

  // Rodapé
  doc
    .fontSize(8)
    .text(
      `Gerado em ${new Date().toLocaleString("pt-BR")} - Oryum Tauros ERP`,
      50,
      750,
      { align: "center" }
    );

  doc.end();
}

/**
 * Gerar relatório de produção em PDF
 */
export function generateProductionReport(data: ProductionData, res: Response) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=relatorio-producao-${Date.now()}.pdf`
  );

  doc.pipe(res);

  // Cabeçalho
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("Relatório de Produção", { align: "center" });

  doc.moveDown(2);

  // Resumo
  doc.fontSize(16).font("Helvetica-Bold").text("Resumo Geral");
  doc.moveDown();

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Total de Animais: ${data.totalAnimals}`);
  doc.text(`GMD Médio: ${data.averageGMD.toFixed(2)} kg/dia`);

  doc.moveDown(2);

  // Produção de Leite
  if (data.milkProduction.length > 0) {
    doc.fontSize(14).font("Helvetica-Bold").text("Produção de Leite");
    doc.moveDown();

    const totalMilk = data.milkProduction.reduce((sum, p) => sum + p.quantity, 0);
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Total Produzido: ${totalMilk.toFixed(2)} litros`);

    doc.moveDown();

    // Tabela de produção
    const tableTop = doc.y;
    const colWidths = [120, 200, 150];
    const headers = ["Data", "Animal", "Quantidade (L)"];

    doc.fontSize(10).font("Helvetica-Bold");
    let xPos = 50;
    headers.forEach((header, i) => {
      doc.text(header, xPos, tableTop, { width: colWidths[i], align: "left" });
      xPos += colWidths[i];
    });

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(520, tableTop + 15)
      .stroke();

    doc.font("Helvetica").fontSize(9);
    let yPos = tableTop + 20;

    data.milkProduction.slice(0, 20).forEach((production) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      xPos = 50;
      const row = [
        production.date.toLocaleDateString("pt-BR"),
        production.animal,
        production.quantity.toFixed(2),
      ];

      row.forEach((cell, i) => {
        doc.text(cell, xPos, yPos, { width: colWidths[i], align: "left" });
        xPos += colWidths[i];
      });

      yPos += 20;
    });
  }

  // Rodapé
  doc
    .fontSize(8)
    .text(
      `Gerado em ${new Date().toLocaleString("pt-BR")} - Oryum Tauros ERP`,
      50,
      750,
      { align: "center" }
    );

  doc.end();
}
