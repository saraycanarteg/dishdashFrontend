import { useState, useEffect } from "react";
import { Plus, Trash2, Eye, RefreshCw } from "lucide-react";
import CreateAnalysisModal from "../../views/costanalysis/CreateAnalysisModal";
import costAnalysisService from "../../services/costAnalysis";

const Costs = () => {
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    setIsLoading(true);
    try {
      const response = await costAnalysisService.getAll();
      setAnalyses(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error loading analyses:", error);
      setAnalyses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este análisis?")) return;

    try {
      await costAnalysisService.remove(id);
      setAnalyses(analyses.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Error deleting analysis:", error);
      alert("Error al eliminar el análisis");
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadAnalyses();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f2eb] to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Análisis de Costos
              </h1>
              <p className="text-gray-600">
                Gestiona y analiza los costos de tus recetas
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#adc4bc] text-white rounded-xl hover:bg-[#9ab3ab] transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <Plus size={20} />
              Nuevo Análisis
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border-2 border-[#e7c78a] shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Total de Análisis</div>
            <div className="text-3xl font-bold text-gray-800">
              {analyses.length}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-[#edcab4] shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Costo Promedio</div>
            <div className="text-3xl font-bold text-gray-800">
              $
              {analyses.length > 0
                ? (
                    analyses.reduce((sum, a) => sum + (a.costPerServing || 0), 0) /
                    analyses.length
                  ).toFixed(2)
                : "0.00"}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-[#adc4bc] shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Precio Sugerido Promedio</div>
            <div className="text-3xl font-bold text-gray-800">
              $
              {analyses.length > 0
                ? (
                    analyses.reduce(
                      (sum, a) => sum + (a.suggestedPricePerServing || 0),
                      0
                    ) / analyses.length
                  ).toFixed(2)
                : "0.00"}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-[#adc4bc]" size={40} />
            <span className="ml-3 text-gray-600">Cargando análisis...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && analyses.length === 0 && (
          <div className="bg-white rounded-2xl border-2 border-[#c8d0d2] p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-24 w-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay análisis de costos
            </h3>
            <p className="text-gray-500 mb-6">
              Comienza creando tu primer análisis de costos
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#adc4bc] text-white rounded-xl hover:bg-[#9ab3ab] transition-all font-medium"
            >
              <Plus size={20} />
              Crear Primer Análisis
            </button>
          </div>
        )}

        {/* Analyses List */}
        {!isLoading && analyses.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-[#c8d0d2] shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f5f2eb] border-b-2 border-[#e7c78a]">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Receta
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Porciones
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Costo/Porción
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Precio Sugerido
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Total
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((analysis) => (
                    <tr
                      key={analysis._id}
                      className="border-b border-[#e7c78a] hover:bg-[#f5f2eb] transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-800">
                          {analysis.recipeName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(analysis.createdAt).toLocaleDateString("es-ES")}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {analysis.servings}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-800">
                        ${analysis.costPerServing?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#adc4bc]">
                        ${analysis.suggestedPricePerServing?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-800">
                        ${analysis.totalCost?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedAnalysis(analysis)}
                            className="p-2 text-[#adc4bc] hover:bg-[#f5f2eb] rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(analysis._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Analysis Modal */}
      <CreateAnalysisModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Costs;