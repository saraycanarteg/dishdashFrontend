import { useState, useEffect } from "react";
import { ChevronLeft, Search, Loader2 } from "lucide-react";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import recipeService from "../../services/recipe";
import ingredientService from "../../services/ingredient";
import costAnalysisService from "../../services/costAnalysis";
import Toast from "../../components/ui/Toast";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

const CreateAnalysisPage = ({ onBack, onSuccess }) => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const [ingredients, setIngredients] = useState([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, loading: false });

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        handleSearch();
      } else {
        setRecipes([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await recipeService.getByName(searchTerm);
      const recipesData = Array.isArray(response) ? response : [response];
      setRecipes(recipesData);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching recipes:", error);
      showToast("Error al buscar recetas", "error");
      setRecipes([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRecipe = async (recipe) => {
    setSelectedRecipe(recipe);
    setShowResults(false);
    setIsLoadingIngredients(true);

    try {
      const ingredientsList = recipe.ingredients.map(ing => ({
        ...ing,
        selectedIngredient: null,
        selectedQuantity: ing.quantity || 1,
        selectedUnit: ing.unit || 'g'
      }));
      setIngredients(ingredientsList);
    } catch (error) {
      console.error("Error loading ingredients:", error);
      showToast("Error al cargar ingredientes", "error");
    } finally {
      setIsLoadingIngredients(false);
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleSubmit = async () => {
    setConfirm({ open: true, loading: false });
  };

  const confirmCreate = async () => {
    setConfirm(prev => ({ ...prev, loading: true }));
    try {
      const data = {
        recipeId: selectedRecipe._id,
        recipeName: selectedRecipe.name,
        servings: selectedRecipe.servings,
        ingredients: ingredients.map(ing => ({
          ingredientName: ing.ingredientName,
          quantity: ing.selectedQuantity,
          unit: ing.selectedUnit,
          price: ing.price || 0
        }))
      };

      await costAnalysisService.create(data);
      showToast("Análisis creado exitosamente", "success");
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error("Error creating analysis:", error);
      showToast("Error al crear el análisis", "error");
      setConfirm(prev => ({ ...prev, loading: false }));
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f2eb] to-white p-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Análisis de Costos", onClick: onBack },
            { label: "Nuevo Análisis" }
          ]}
        />

        <div className="bg-white rounded-lg border p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Crear Análisis de Costos
          </h1>
          <p className="text-gray-600 mb-8">
            Selecciona una receta y verifica los ingredientes para crear un análisis
          </p>

          {!selectedRecipe ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Buscar Receta:
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Escribe el nombre de la receta..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#c8d0d2] rounded-lg focus:ring-2 focus:ring-[#adc4bc] focus:border-[#adc4bc] transition-all"
                  />
                  {isSearching && (
                    <Loader2
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#adc4bc] animate-spin"
                      size={20}
                    />
                  )}
                </div>
              </div>

              {showResults && recipes.length > 0 && (
                <div className="border-2 border-[#c8d0d2] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {recipes.map((recipe) => (
                    <button
                      key={recipe._id}
                      onClick={() => handleSelectRecipe(recipe)}
                      className="w-full text-left px-5 py-4 hover:bg-[#f5f2eb] transition-colors border-b border-[#e7c78a] last:border-b-0"
                    >
                      <div className="font-medium text-gray-800">
                        {recipe.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {recipe.servings} porciones
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showResults && recipes.length === 0 && !isSearching && searchTerm.length >= 2 && (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron recetas
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Recipe Display */}
              <div className="p-4 bg-[#f5f2eb] border-2 border-[#e7c78a] rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">
                    {selectedRecipe.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedRecipe.servings} porciones
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedRecipe(null);
                    setIngredients([]);
                    setSearchTerm("");
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cambiar receta
                </button>
              </div>

              {/* Loading Ingredients */}
              {isLoadingIngredients && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-[#adc4bc]" size={40} />
                </div>
              )}

              {/* Ingredients List */}
              {!isLoadingIngredients && ingredients.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Ingredientes
                  </h3>
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="p-4 border border-[#c8d0d2] rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ingrediente
                          </label>
                          <input
                            type="text"
                            value={ingredient.ingredientName}
                            readOnly
                            className="w-full px-3 py-2 border rounded-md bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            value={ingredient.selectedQuantity}
                            onChange={(e) =>
                              handleIngredientChange(index, "selectedQuantity", parseFloat(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-[#c8d0d2] rounded-md focus:ring-2 focus:ring-[#adc4bc]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unidad
                          </label>
                          <input
                            type="text"
                            value={ingredient.selectedUnit}
                            readOnly
                            className="w-full px-3 py-2 border rounded-md bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-6">
                <button
                  onClick={onBack}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoadingIngredients || isSubmitting}
                  className="px-6 py-2 bg-[#adc4bc] text-white rounded-md hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Creando..." : "Crear Análisis"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirm.open}
        title="Crear Análisis"
        message={`¿Deseas crear un análisis de costos para "${selectedRecipe?.name}"?`}
        confirmText="Crear"
        cancelText="Cancelar"
        onConfirm={confirmCreate}
        onCancel={() => setConfirm({ open: false, loading: false })}
        loading={confirm.loading}
      />

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
};

export default CreateAnalysisPage;
