import React, { useEffect, useState } from "react";
import recipeService from "../../services/recipe";
import RecipeFilters from "../../views/recipes/RecipeFilters";
import RecipesGrid from "../../views/recipes/RecipesGrid";
import RecipeModal from "../../views/recipes/RecipeModal";
import RecipeDetailModal from "../../views/recipes/RecipeDetailModal";
import api from "../../services/api";


import Toast from "../../components/ui/Toast";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minServings, setMinServings] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    let data = Array.isArray(recipes) ? [...recipes] : [];

    if (category) {
      data = data.filter((r) => r.category === category);
    }

    if (search.trim().length >= 3) {
      const s = search.toLowerCase();
      data = data.filter((r) => r.name?.toLowerCase().includes(s));
    }

    if (minServings > 0) {
      data = data.filter((r) => r.servings >= minServings);
    }

    setFiltered(data);
  }, [recipes, search, category, minServings]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getAll();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast("Error al cargar recetas", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editing) {
        await recipeService.update(editing._id, formData);
        showToast("Receta actualizada");
      } else {
        const created = await recipeService.create(formData);

        try {
          if (created && created._id) {
            const calcRes = await recipeService.calculateCosts(created._id);

            const updatePayload = {};
            if (calcRes && typeof calcRes === 'object') {
              if (calcRes.costPerServing !== undefined) updatePayload.costPerServing = calcRes.costPerServing;
              if (calcRes.pricePerServing !== undefined) updatePayload.pricePerServing = calcRes.pricePerServing;
            }

            if (Object.keys(updatePayload).length > 0) {
              try {
                await recipeService.update(created._id, updatePayload);
              } catch (updateErr) {
                console.error('Error actualizando receta con costos:', updateErr);
              }
            }
          }
        } catch (calcErr) {
          console.error('Error calculando costos:', calcErr);
          showToast(calcErr && calcErr.message ? calcErr.message : 'Receta creada pero error calculando costos', 'error');
        }

        showToast("Receta creada");
      }
      setModalOpen(false);
      setEditing(null);
      loadRecipes();
    } catch (err) {
      console.error(err);
      showToast(err && err.message ? err.message : "Error al guardar receta", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await recipeService.remove(id);
      showToast("Receta eliminada");
      setRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      showToast("Error al eliminar receta", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  };

  const exportToCSV = () => {
    const recipesToExport = filtered;

    if (recipesToExport.length === 0) {
      alert("No hay recetas para exportar con los filtros seleccionados.");
      return;
    }

    const headers = ["Nombre", "Categoría", "Porciones", "Descripción"];
    const rows = recipesToExport.map((r) => [
      r.name,
      r.category,
      r.servings,
      r.description?.replace(/[\n\r]/g, " ") || "",
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map((field) => `"${field}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "recetas_exportadas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "#9FB9B3" }}
          />
          <p className="text-gray-600">Cargando recetas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RecipeFilters
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
        onNew={() => setModalOpen(true)}
      />


      {/* Filtro adicional y botón exportar */}
      <div className="mb-4 flex gap-4 items-center">
        <label htmlFor="minServings">Mínimo porciones:</label>
        <input
          type="number"
          min="0"
          value={minServings}
          onChange={(e) => setMinServings(Number(e.target.value))}
          placeholder="Mínimo porciones"
          className="border rounded px-3 py-1 w-40"
        />

        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Exportar recetas
        </button>
      </div>

      <RecipesGrid
        recipes={filtered}
        onEdit={(r) => {
          setEditing(r);
          setModalOpen(true);
        }}
        onView={setDetail}
        onDelete={handleDelete}
      />

      <RecipeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
        initialData={editing}
      />

      <RecipeDetailModal recipe={detail} onClose={() => setDetail(null)} />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
};

export default Recipes;
