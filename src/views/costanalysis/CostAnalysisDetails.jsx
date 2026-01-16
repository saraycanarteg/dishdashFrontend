import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import costAnalysisService from "../../services/costAnalysis";
import Toast from "../../components/ui/Toast";
import { Button } from "../../components/ui/Button";
import { jsPDF } from "jspdf";

const CostAnalysisDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [toast, setToast] = useState(null);
  const contentRef = useRef();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const result = await costAnalysisService.getById(id);
        setAnalysis(result);
      } catch (error) {
        console.error(error);
        showToast("Error al cargar análisis", "error");
      }
    };

    fetchAnalysis();
  }, [id]);

  const showToast = (message, type = "success") =>
    setToast({ id: Date.now(), message, type });

  const exportPDF = () => {
    if (!analysis) return;

    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(16);
    doc.text("Detalle de Análisis de Costos", 10, y);
    y += 10;
    doc.setFontSize(12);

    doc.text(`Receta: ${analysis.recipeName}`, 10, y);
    y += 7;
    doc.text(`Porciones: ${analysis.servings}`, 10, y);
    y += 10;

    doc.text("Ingredientes:", 10, y);
    y += 7;

    analysis.ingredients.forEach((ing, idx) => {
      doc.text(
        `${idx + 1}. ${ing.ingredientName} - ${ing.selectedQuantity} ${ing.selectedUnit}`,
        12,
        y
      );
      y += 7;
    });

    y += 5;
    doc.text(`Costo de ingredientes: $${analysis.ingredientsCost.toFixed(2)}`, 10, y);
    y += 7;
    doc.text(`Costo total del producto: $${analysis.totalCost.toFixed(2)}`, 10, y);
    y += 7;
    doc.text(`Costo por porción: $${analysis.costPerServing.toFixed(2)}`, 10, y);
    y += 7;
    doc.text(`Precio sugerido por porción: $${analysis.suggestedPricePerServing.toFixed(2)}`, 10, y);
    y += 10;

    doc.text("Impuestos:", 10, y);
    y += 7;
    doc.text(`IVA (${analysis.taxes.ivaPercent}%): $${analysis.taxes.ivaAmount.toFixed(2)}`, 12, y);
    y += 7;
    doc.text(`Servicio (${analysis.taxes.servicePercent}%): $${analysis.taxes.serviceAmount.toFixed(2)}`, 12, y);
    y += 7;
    doc.text(`Total impuestos: $${analysis.taxes.totalTaxes.toFixed(2)}`, 12, y);
    y += 10;
    doc.text(`Precio final: $${(analysis.suggestedPricePerServing + analysis.taxes.totalTaxes).toFixed(2)}`, 10, y);

    doc.save(`analisis_${analysis.recipeName}.pdf`);
  };

  if (!analysis) return <p>Cargando análisis...</p>;

  return (
    <div className="min-h-screen p-8 bg-[#f5f2eb]">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg border">
        <h1 className="text-3xl font-bold mb-4">Detalle de Análisis de Costos</h1>

        <p><strong>Receta:</strong> {analysis.recipeName}</p>
        <p><strong>Porciones:</strong> {analysis.servings}</p>

        <h2 className="text-xl font-semibold mt-4">Ingredientes</h2>
        <ul className="list-disc list-inside">
          {analysis.ingredients.map((ing, idx) => (
            <li key={idx}>
              {ing.ingredientName} - {ing.selectedQuantity} {ing.selectedUnit}
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold mt-4">Costos</h2>
        <p>Costo de ingredientes: ${analysis.ingredientsCost.toFixed(2)}</p>
        <p>Costo total del producto: ${analysis.totalCost.toFixed(2)}</p>
        <p>Costo por porción: ${analysis.costPerServing.toFixed(2)}</p>
        <p>Precio sugerido por porción: ${analysis.suggestedPricePerServing.toFixed(2)}</p>

        <h2 className="text-xl font-semibold mt-4">Impuestos</h2>
        <p>IVA ({analysis.taxes.ivaPercent}%): ${analysis.taxes.ivaAmount.toFixed(2)}</p>
        <p>Servicio ({analysis.taxes.servicePercent}%): ${analysis.taxes.serviceAmount.toFixed(2)}</p>
        <p>Total impuestos: ${analysis.taxes.totalTaxes.toFixed(2)}</p>

        <h2 className="text-xl font-semibold mt-4">Precio final</h2>
        <p>${(analysis.suggestedPricePerServing + analysis.taxes.totalTaxes).toFixed(2)}</p>

        <div className="mt-6 flex gap-4">
          <Button onClick={() => navigate(-1)}>Volver</Button>
          <Button onClick={exportPDF} className="bg-green-600 text-white">Exportar PDF</Button>
        </div>

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
};

export default CostAnalysisDetails;
