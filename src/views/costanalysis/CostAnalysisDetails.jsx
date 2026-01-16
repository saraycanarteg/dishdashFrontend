import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import costAnalysisService from "../../services/costAnalysis";
import Toast from "../../components/ui/Toast";
import { jsPDF } from "jspdf";

const CostAnalysisDetails = ({ analysis }) => {
  const [toast, setToast] = useState(null);

  const exportPDF = () => {
    if (!analysis) return;

    const doc = new jsPDF();
    let y = 15;

    // ================= Título principal =================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text("Detalle de Análisis de Costos", 105, y, { align: "center" });
    y += 15;

    // ================= Receta =================
    doc.setFillColor(173, 196, 188); // verde suave
    doc.rect(10, y, 190, 10, "F");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Receta", 15, y + 7);
    y += 17;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Nombre: ${analysis.recipeName}`, 15, y);
    y += 7;
    doc.text(`Porciones: ${analysis.servings}`, 15, y);
    y += 10;

    // ================= Ingredientes =================
    doc.setFillColor(239, 239, 239); // gris claro
    doc.rect(10, y, 190, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Ingredientes", 15, y + 7);
    y += 15;

    doc.setFont("helvetica", "normal");
    analysis.ingredients.forEach((ing, idx) => {
      doc.text(
        `${idx + 1}. ${ing.ingredientName} - ${ing.selectedQuantity} ${
          ing.selectedUnit
        }`,
        15,
        y
      );
      y += 7;
    });
    y += 5;

    // ================= Costos en tabla =================
    doc.setFillColor(173, 196, 188); // verde suave encabezado
    doc.rect(10, y, 190, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Costos", 15, y + 7);
    y += 15;

    doc.setFont("helvetica", "normal");
    const tableData = [
      ["Concepto", "Monto ($)"],
      ["Costo de ingredientes", analysis.ingredientsCost.toFixed(2)],
      ["Costo total del producto", analysis.totalCost.toFixed(2)],
      ["Costo por porción", analysis.costPerServing.toFixed(2)],
      [
        "Precio sugerido por porción",
        analysis.suggestedPricePerServing.toFixed(2),
      ],
    ];

    // Dibujar tabla
    const colX = [15, 120];
    const rowHeight = 7;

    tableData.forEach((row, i) => {
      if (i === 0) doc.setFont("helvetica", "bold"); // encabezado
      else doc.setFont("helvetica", "normal");

      row.forEach((text, j) => {
        doc.text(text.toString(), colX[j], y);
      });

      // líneas de separación
      doc.setDrawColor(200);
      doc.line(10, y + 2, 200, y + 2);
      y += rowHeight;
    });

    y += 5;

    // ================= Impuestos =================
    doc.setFillColor(239, 239, 239);
    doc.rect(10, y, 190, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Impuestos", 15, y + 7);
    y += 15;

    doc.setFont("helvetica", "normal");
    const taxData = [
      [
        "IVA",
        `${analysis.taxes.ivaAmount.toFixed(2)} (${
          analysis.taxes.ivaPercent
        }%)`,
      ],
      [
        "Servicio",
        `${analysis.taxes.serviceAmount.toFixed(2)} (${
          analysis.taxes.servicePercent
        }%)`,
      ],
      ["Total impuestos", analysis.taxes.totalTaxes.toFixed(2)],
    ];

    taxData.forEach((row, i) => {
      row.forEach((text, j) => {
        doc.text(text.toString(), colX[j], y);
      });
      doc.line(10, y + 2, 200, y + 2);
      y += rowHeight;
    });

    y += 5;

    // ================= Precio final =================
    doc.setFillColor(173, 196, 188);
    doc.rect(10, y, 190, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Precio final: $${(
        analysis.suggestedPricePerServing + analysis.taxes.totalTaxes
      ).toFixed(2)}`,
      105,
      y + 8,
      { align: "center" }
    );

    doc.save(`analisis_${analysis.recipeName}.pdf`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Detalle de Análisis de Costos</h1>
      <p>
        <strong>Receta:</strong> {analysis.recipeName}
      </p>
      <p>
        <strong>Porciones:</strong> {analysis.servings}
      </p>

      <h2 className="text-xl font-semibold mt-4">Costos</h2>
      <p>Costo de ingredientes: ${analysis.ingredientsCost.toFixed(2)}</p>
      <p>Costo total del producto: ${analysis.totalCost.toFixed(2)}</p>
      <p>Costo por porción: ${analysis.costPerServing.toFixed(2)}</p>
      <p>
        Precio sugerido por porción: $
        {analysis.suggestedPricePerServing.toFixed(2)}
      </p>

      <h2 className="text-xl font-semibold mt-4">Impuestos</h2>
      <p>
        IVA ({analysis.taxes.ivaPercent}%): $
        {analysis.taxes.ivaAmount.toFixed(2)}
      </p>
      <p>
        Servicio ({analysis.taxes.servicePercent}%): $
        {analysis.taxes.serviceAmount.toFixed(2)}
      </p>
      <p>Total impuestos: ${analysis.taxes.totalTaxes.toFixed(2)}</p>

      <h2 className="text-xl font-semibold mt-4">Precio final</h2>
      <p>
        $
        {(
          analysis.suggestedPricePerServing + analysis.taxes.totalTaxes
        ).toFixed(2)}
      </p>

      <div className="mt-4 flex gap-4">
        <button
          onClick={exportPDF}
          className="bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Exportar PDF
        </button>
      </div>
    </div>
  );
};

export default CostAnalysisDetails;
