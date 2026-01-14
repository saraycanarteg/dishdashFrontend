import React, { useEffect, useState } from "react";
import ingredientService from "../../services/ingredient";
import IngredientModal from "../ingredients/IngredientsModal";

const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const RecipeModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [form, setForm] = useState({
    name: "",
    category: "cocktail",
    servings: 1,
    description: "",
    ingredients: [],
    instructions: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allIngredients, setAllIngredients] = useState([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [showIngredientModal, setShowIngredientModal] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        category: initialData.category || "cocktail",
        servings: initialData.servings || 1,
        description: initialData.description || "",
        ingredients: (initialData.ingredients || []).map((i) => ({
          _id: i._id || i.ingredientId?._id || "",
          productId: i.productId || i.ingredientId?.productId || "",
          ingredientName:
            i.ingredientName || i.ingredientId?.name || i.name || "",
          quantity: i.quantity || 0,
          unit: i.unit || "",
          price: i.price || 0,
        })),
        instructions: (initialData.instructions || []).map((s) =>
          typeof s === "string" ? s : s.step || ""
        ),
      });
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      ingredientService
        .getAll()
        .then((data) => setAllIngredients(data))
        .catch((err) => {
          console.error("Error cargando ingredientes:", err);
          setAllIngredients([]);
        });
    }
  }, [isOpen]);

  const addSelectedIngredient = () => {
    if (!selectedIngredientId) return;
    const ingredient = allIngredients.find(
      (i) => i._id === selectedIngredientId
    );
    if (!ingredient) return;

    setForm((p) => ({
      ...p,
      ingredients: [
        ...p.ingredients,
        {
          _id: ingredient._id || "",
          productId: ingredient.productId || "",
          ingredientName: ingredient.name,
          quantity: 0,
          unit: ingredient.sizeUnit || "",
          price: ingredient.price || 0,
        },
      ],
    }));
    setSelectedIngredientId("");
  };

  const resetForm = () => {
    setForm({
      name: "",
      category: "cocktail",
      servings: 1,
      description: "",
      ingredients: [],
      instructions: [],
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "servings") {
      const numberValue = Number(value);
      if (!isNaN(numberValue) && numberValue > 0) {
        setForm((p) => ({ ...p, [name]: numberValue }));
      }
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const addIngredient = () => {
    setForm((p) => ({
      ...p,
      ingredients: [
        ...p.ingredients,
        { _id: "", productId: "", ingredientName: "", quantity: 0, unit: "" },
      ],
    }));
  };

  const updateIngredient = (i, field, value) => {
    const copy = [...form.ingredients];
    copy[i][field] = field === "quantity" ? Number(value) : value;
    setForm((p) => ({ ...p, ingredients: copy }));
  };

  const removeIngredient = (i) => {
    const copy = [...form.ingredients];
    copy.splice(i, 1);
    setForm((p) => ({ ...p, ingredients: copy }));
  };

  const addInstruction = () => {
    setForm((p) => ({
      ...p,
      instructions: [...p.instructions, ""],
    }));
  };

  const updateInstruction = (i, value) => {
    const copy = [...form.instructions];
    copy[i] = value;
    setForm((p) => ({ ...p, instructions: copy }));
  };

  const removeInstruction = (i) => {
    const copy = [...form.instructions];
    copy.splice(i, 1);
    setForm((p) => ({ ...p, instructions: copy }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validar ingredientes: no vacíos, con productId, nombre y cantidad numérica
    const validIngredients = form.ingredients
      .filter(
        (ing) =>
          ing.productId &&
          ing.productId.trim() !== "" &&
          ing.ingredientName &&
          ing.ingredientName.trim() !== "" &&
          !isNaN(ing.quantity) &&
          Number(ing.quantity) > 0 &&
          ing.unit &&
          ing.unit.trim() !== ""
      )
      .map(({ _id, productId, ingredientName, quantity, unit }) => ({
        _id: _id || "",
        productId,
        ingredientName,
        quantity,
        unit,
      }));

    // Validar instrucciones: que no estén vacías y sean strings
    const validInstructions = form.instructions
      .map((instr) => (typeof instr === "string" ? instr.trim() : ""))
      .filter((instr) => instr !== "");

    if (validIngredients.length === 0) {
      alert("Debes agregar al menos un ingrediente válido.");
      setIsSubmitting(false);
      return;
    }

    if (validInstructions.length === 0) {
      alert("Debes agregar al menos una instrucción válida.");
      setIsSubmitting(false);
      return;
    }

    // Preparar objeto para enviar
    const dataToSend = {
      name: form.name,
      category: form.category,
      servings: form.servings,
      description: form.description,
      ingredients: validIngredients,
      instructions: validInstructions,
    };

    try {
      console.log("Datos a enviar:", JSON.stringify(dataToSend, null, 2));
      await onSubmit(dataToSend);
      onClose();
    } catch (error) {
      console.error("Error al guardar receta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onNewIngredientCreated = (newIngredient) => {
    setForm((p) => ({
      ...p,
      ingredients: [
        ...p.ingredients,
        {
          _id: newIngredient._id || "",
          productId: newIngredient.productId || "",
          ingredientName: newIngredient.name,
          quantity: 0,
          unit: newIngredient.sizeUnit || "",
          price: newIngredient.price || 0,
        },
      ],
    }));
    setShowIngredientModal(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between">
          <h2 className="text-xl font-semibold text-[#9FB9B3]">
            {initialData ? "Editar Receta" : "Nueva Receta"}
          </h2>
          <button onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <label htmlFor="name" className="block font-medium mb-1">
            Nombre de la receta *
          </label>
          <input
            id="name"
            name="name"
            placeholder="Nombre de la receta *"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <label htmlFor="category" className="block font-medium">
              Categoría
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="border rounded-md px-3 py-2"
            >
              <option value="cocktail">Cocktail</option>
              <option value="appetizer">Aperitivo</option>
              <option value="main_course">Plato principal</option>
              <option value="dessert">Postre</option>
              <option value="beverage">Bebida</option>
            </select>

            <label htmlFor="servings" className="block font-medium ">
              Porciones
            </label>
            <input
              id="servings"
              type="number"
              name="servings"
              min="1"
              value={form.servings}
              onChange={handleChange}
              className="border rounded-md px-3 py-2"
            />
          </div>

          <label htmlFor="description" className="block font-medium mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            placeholder="Descripción"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
          />

          <div>
            <h4 className="font-medium mb-2">Ingredientes</h4>

            <label
              htmlFor="select-ingredient"
              className="block font-medium mb-1"
            >
              Seleccionar ingrediente
            </label>
            <div className="flex gap-2 mb-3">
              <select
                id="select-ingredient"
                value={selectedIngredientId}
                onChange={(e) => setSelectedIngredientId(e.target.value)}
                className="border rounded-md px-3 py-2 flex-grow"
              >
                <option value="">Selecciona un ingrediente</option>
                {allIngredients.map((ing) => (
                  <option key={ing._id} value={ing._id}>
                    {ing.name} {ing.brand ? `- ${ing.brand}` : ""}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addSelectedIngredient}
                className="px-4 py-2 bg-[#9FB9B3] text-white rounded"
              >
                + Agregar
              </button>
            </div>

            {form.ingredients.map((ing, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <input
                  id={`ingredient-name-${i}`}
                  value={ing.ingredientName}
                  disabled
                  className="border px-2 py-1 rounded bg-gray-100"
                />
                <label htmlFor={`quantity-${i}`} className="sr-only">
                  Cantidad
                </label>
                <input
                  id={`quantity-${i}`}
                  type="number"
                  placeholder="Cantidad"
                  value={ing.quantity}
                  onChange={(e) =>
                    updateIngredient(i, "quantity", e.target.value)
                  }
                  className="border px-2 py-1 rounded"
                />
                <label htmlFor={`unit-${i}`} className="sr-only">
                  Unidad
                </label>
                <input
                  id={`unit-${i}`}
                  placeholder="Unidad"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  className="text-red-500 font-bold"
                  title="Eliminar ingrediente"
                >
                  X
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setShowIngredientModal(true)}
              className="ml-4 text-sm text-[#D4B5A5]"
            >
              + Nuevo Ingrediente
            </button>
          </div>

          <div>
            <h4 className="font-medium mb-2">Instrucciones</h4>
            {form.instructions.map((s, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <label
                  htmlFor={`instruction-${i}`}
                  className="sr-only"
                >{`Paso ${i + 1}`}</label>
                <input
                  id={`instruction-${i}`}
                  placeholder={`Paso ${i + 1}`}
                  value={s}
                  onChange={(e) => updateInstruction(i, e.target.value)}
                  className="flex-grow border rounded-md px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => removeInstruction(i)}
                  className="text-red-500 font-bold px-2"
                  title="Eliminar paso"
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addInstruction}
              className="text-sm text-[#9FB9B3]"
            >
              + Agregar paso
            </button>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white rounded bg-[#D4B5A5]"
            >
              {isSubmitting ? "Guardando..." : "Guardar Receta"}
            </button>
          </div>
        </form>
      </div>

      {showIngredientModal && (
        <IngredientModal
          isOpen={showIngredientModal}
          onClose={() => setShowIngredientModal(false)}
          onSubmit={onNewIngredientCreated}
        />
      )}
    </div>
  );
};

export default RecipeModal;
