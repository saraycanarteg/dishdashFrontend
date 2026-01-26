import React, { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";
import recipeService from "../../services/recipe";
import recipeScalingService from "../../services/recipeScaling";
import RecipeScalingForm from "../../views/recipescaling/RecipeScalingForm";
import ScaledIngredientsTable from "../../views/recipescaling/ScaledIngredientsTable";
import Toast from "../../components/ui/Toast";

export default function RecipeScaling() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [scaledResult, setScaledResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const res = await recipeService.getAll();
      setRecipes(Array.isArray(res) ? res : res.data);
    } catch (error) {
      showToast({ type: "error", message: "Error cargando recetas" });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (config) => {
    setToast({ ...config, id: Date.now() });
  };

  const handleScale = async ({ recipeId, newServings, profitMargin }) => {
    try {
      const res = await recipeScalingService.scaleRecipe(recipeId, {
        newServings,
        profitMargin
      });

      setScaledResult(res.scaledRecipe);
      showToast({ type: "success", message: "Receta escalada correctamente" });
    } catch (error) {
      showToast({ type: "error", message: "Error al escalar receta" });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Maximize2 />
            Escalado de Recetas
          </h1>
          <p className="text-gray-600">
            Ajusta cantidades, costos y suministros según nuevas porciones
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <RecipeScalingForm
            recipes={recipes}
            onScale={handleScale}
          />
        </div>

        {/* Results */}
        {scaledResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <ScaledIngredientsTable scaledRecipe={scaledResult} />
          </div>
        )}
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
