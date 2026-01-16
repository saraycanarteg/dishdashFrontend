import { useState, useEffect } from "react";
import { ChevronLeft, Search, Loader2 } from "lucide-react";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import recipeService from "../../services/recipe";
import costAnalysisService from "../../services/costAnalysis";
import Toast from "../../components/ui/Toast";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

const CreateAnalysisPage = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState(1);

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [ingredients, setIngredients] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, loading: false });

  // Results from backend
  const [ingredientsCostResult, setIngredientsCostResult] = useState(null);
  const [productCostResult, setProductCostResult] = useState(null);
  const [taxesResult, setTaxesResult] = useState(null);

  /* ================= SEARCH RECIPE ================= */
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm.trim().length >= 2) handleSearch();
      else {
        setRecipes([]);
        setShowResults(false);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await recipeService.getByName(searchTerm);
      setRecipes(Array.isArray(response) ? response : [response]);
      setShowResults(true);
    } catch {
      showToast("Error al buscar recetas", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setShowResults(false);
    setIngredients(
      recipe.ingredients.map((ing) => ({
        ingredientName: ing.ingredientName,
        productId: ing.productId,
        selectedQuantity: ing.quantity,
        selectedUnit: ing.unit,
      }))
    );
  };

  /* ================= STEP 1 ================= */
  const handleCalculateIngredients = async () => {
    try {
      const response = await costAnalysisService.calculateIngredientsCost(
        ingredients.map((i) => ({
          ingredientName: i.ingredientName,
          productId: i.productId,
          quantity: i.selectedQuantity,
          unit: i.selectedUnit,
        }))
      );
      setIngredientsCostResult(response);
      setStep(2);
    } catch {
      showToast("Error al calcular ingredientes", "error");
    }
  };

  /* ================= STEP 2 ================= */
  const handleCalculateProduct = async () => {
    try {
      const response = await costAnalysisService.calculateProductCost({
        ingredientsCost: Number(ingredientsCostResult?.ingredientsCost) || 0,
        indirectCost: Number(ingredientsCostResult?.indirectCost) || 0,
        servings: Number(selectedRecipe?.servings) || 1,
        margin: 30,
      });
      console.log("BACKEND productCostResult", response);

      setProductCostResult(response);
      setStep(3);
    } catch (error) {
      console.error(error);
      showToast("Error al calcular costo del producto", "error");
    }
  };

  /* ================= STEP 3 ================= */
  const handleCalculateTaxes = async () => {
    const price = Number(productCostResult?.suggestedPricePerServing);

    console.log("Precio para taxes 👉", price, typeof price);

    if (!price || isNaN(price) || price <= 0) {
      showToast("El precio por porción no es válido", "error");
      return;
    }

    try {
      const response = await costAnalysisService.calculateTaxes({
        suggestedPricePerServing: price,
        ivaPercent: 15,
        servicePercent: 10,
      });

      console.log("BACKEND taxesResult", response);

      setTaxesResult(response.data);
      setStep(4);
    } catch (error) {
      console.error(error);
      showToast("Error al calcular impuestos", "error");
    }
  };

  /* ================= SAVE ================= */
  const confirmCreate = async () => {
    setConfirm({ open: true, loading: true });
    try {
      await costAnalysisService.create({
        recipeId: selectedRecipe._id,
        recipeName: selectedRecipe.name,
        ingredients,
        ingredientsCost: ingredientsCostResult,
        productCost: productCostResult,
        taxes: taxesResult,
      });
      showToast("Análisis creado correctamente", "success");
      onSuccess();
    } catch {
      showToast("Error al guardar análisis", "error");
      setConfirm({ open: false, loading: false });
    }
  };

  const showToast = (message, type = "success") =>
    setToast({ id: Date.now(), message, type });

  /* ================= UI ================= */
  return (
    <div className="min-h-screen p-8 bg-[#f5f2eb]">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg border">
        <Breadcrumbs
          items={[
            { label: "Análisis de Costos", onClick: onBack },
            { label: "Nuevo Análisis" },
            { label: "Costo de ingredientes" },
          ]}
        />

        <div className="bg-white rounded-lg border p-8">
          {" "}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {" "}
            Crear Análisis de Costos{" "}
          </h1>{" "}
          <p className="text-gray-600 mb-8">
            {" "}
            Selecciona una receta y verifica los ingredientes para crear un
            análisis{" "}
          </p>
          {!selectedRecipe ? (
            <>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar receta..."
                className="w-full border p-3 rounded-md mt-4"
              />
              {showResults &&
                recipes.map((r) => (
                  <button
                    key={r._id}
                    onClick={() => handleSelectRecipe(r)}
                    className="block w-full text-left p-3 border-b hover:bg-gray-50"
                  >
                    {r.name}
                  </button>
                ))}
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mt-4">
                {selectedRecipe.name}
              </h2>

              {step === 1 && (
                <>
                  {ingredients.map((i, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-3 mt-3">
                      <input value={i.ingredientName} readOnly />
                      <input
                        type="number"
                        value={i.selectedQuantity}
                        onChange={(e) => {
                          const copy = [...ingredients];
                          copy[idx].selectedQuantity = +e.target.value;
                          setIngredients(copy);
                        }}
                      />
                      <input value={i.selectedUnit} readOnly />
                    </div>
                  ))}
                  <button
                    onClick={handleCalculateIngredients}
                    className="mt-6 bg-[#adc4bc] text-white px-6 py-2 rounded-md"
                  >
                    Siguiente
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <p>
                    Costo ingredientes: ${ingredientsCostResult.ingredientsCost}
                  </p>
                  <button
                    onClick={handleCalculateProduct}
                    className="mt-6 bg-[#adc4bc] text-white px-6 py-2 rounded-md"
                  >
                    Siguiente
                  </button>
                </>
              )}

              {step === 3 && (
                <>
                  <p>
                    Precio por porción: $
                    {(
                      Number(productCostResult?.suggestedPricePerServing) || 0
                    ).toFixed(2)}
                  </p>
                  <button
                    onClick={handleCalculateTaxes}
                    className="mt-6 bg-[#adc4bc] text-white px-6 py-2 rounded-md"
                  >
                    Siguiente
                  </button>
                </>
              )}

              {step === 4 && (
                <>
                  <p>Impuestos: ${taxesResult.totalTaxes}</p>
                  <button
                    onClick={() => setConfirm({ open: true, loading: false })}
                    className="mt-6 bg-green-600 text-white px-6 py-2 rounded-md"
                  >
                    Guardar análisis
                  </button>
                </>
              )}
            </>
          )}
        </div>

        <ConfirmationModal
          isOpen={confirm.open}
          title="Guardar análisis"
          message="¿Deseas guardar este análisis de costos?"
          confirmText="Guardar"
          onConfirm={confirmCreate}
          onCancel={() => setConfirm({ open: false, loading: false })}
          loading={confirm.loading}
        />

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
};

export default CreateAnalysisPage;
