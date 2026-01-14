import React from "react";

const RecipeDetailModal = ({ recipe, onClose }) => {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {recipe.name || "Detalle de receta"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-sm">
          <p><strong>Categoría:</strong> {recipe.category || "—"}</p>
          <p><strong>Porciones:</strong> {recipe.servings || "—"}</p>

          <div>
            <strong>Descripción:</strong>
            <p className="text-gray-700 mt-1">
              {recipe.description || "Sin descripción"}
            </p>
          </div>

          <div>
            <strong>Ingredientes:</strong>
            <ul className="list-disc list-inside text-gray-700 mt-1">
              {(recipe.ingredients && recipe.ingredients.length > 0) ? (
                recipe.ingredients.map((ing, i) => (
                  <li key={ing._id || ing.productId || i}>
                    {ing.ingredientName || ing.name || "Ingrediente"} - {ing.quantity || 0} {ing.unit || ""}
                  </li>
                ))
              ) : (
                <p>Sin ingredientes</p>
              )}
            </ul>
          </div>

          <div>
            <strong>Instrucciones:</strong>
            <ol className="list-decimal list-inside text-gray-700 mt-1">
              {(recipe.instructions && recipe.instructions.length > 0) ? (
                recipe.instructions.map((step, i) => (
                  <li key={i}>
                    {typeof step === "string" ? step : step.step || ""}
                  </li>
                ))
              ) : (
                <p>Sin instrucciones</p>
              )}
            </ol>
          </div>
            <p><strong>Costo por Porciones:</strong> {recipe.costPerServing || "—"}</p>
            <p><strong>Precio por porciones:</strong> {recipe.pricePerServing|| "—"}</p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-white font-medium"
            style={{ backgroundColor: "#9FB9B3" }}
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

export default RecipeDetailModal;
