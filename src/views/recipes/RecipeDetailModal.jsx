import React from "react";
const BACKEND_URL = import.meta.env.VITE_ASSETS_URL;

const RecipeDetailModal = ({ recipe, onClose }) => {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Image */}
        {recipe.imageUrl && (
          <div className="relative h-56 w-full">
            <img
              src={`${BACKEND_URL}${recipe.imageUrl}`}
              alt={recipe.name}
              className="w-full h-48 object-cover rounded-md"
            />

            <button
              onClick={onClose}
              className="absolute top-3 right-3 bg-black/50 text-white rounded-full px-3 py-1 text-lg hover:bg-black/70"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-semibold text-gray-800">
              {recipe.name}
            </h2>

            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#9FB9B3]/20 text-[#5a7f78]">
              {recipe.category}
            </span>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <p>
              <strong>Porciones:</strong> {recipe.servings}
            </p>
            <p>
              <strong>Precio:</strong> ${recipe.pricePerServing}
            </p>
            <p>
              <strong>Costo:</strong> ${recipe.costPerServing}
            </p>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Descripción</h4>
            <p className="text-gray-700">
              {recipe.description || "Sin descripción"}
            </p>
          </div>

          {/* Ingredients */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Ingredientes</h4>
            <ul className="space-y-1">
              {recipe.ingredients?.length > 0 ? (
                recipe.ingredients.map((ing, i) => (
                  <li
                    key={ing._id || ing.productId || i}
                    className="flex justify-between bg-gray-50 px-3 py-2 rounded-md text-sm"
                  >
                    <span>{ing.ingredientName || ing.name}</span>
                    <span className="text-gray-600">
                      {ing.quantity} {ing.unit}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">Sin ingredientes</p>
              )}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Instrucciones</h4>
            <ol className="space-y-2 list-decimal list-inside text-gray-700">
              {recipe.instructions?.length > 0 ? (
                recipe.instructions.map((step, i) => (
                  <li key={i}>{typeof step === "string" ? step : step.step}</li>
                ))
              ) : (
                <p className="text-gray-500">Sin instrucciones</p>
              )}
            </ol>
          </div>

          {/* Footer */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-md text-white font-medium bg-[#9FB9B3] hover:opacity-90"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal;
