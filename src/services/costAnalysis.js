import { axiosInstance, axiosBusinessInstance } from "./api";

const costAnalysisService = {
  // ========== BUSINESS LOGIC ENDPOINTS ==========
  
  // Cálculos individuales (Business Logic)
  calculateIngredientsCost: async (selectedIngredients) => {
    return await axiosBusinessInstance.post(
      "/costanalysis/calculate/ingredients-cost",
      { selectedIngredients }
    );
  },

  calculateProductCost: async (data) => {
    return await axiosBusinessInstance.post(
      "/costanalysis/calculate/product-cost",
      data
    );
  },

  calculateTaxes: async (data) => {
    return await axiosBusinessInstance.post(
      "/costanalysis/calculate/taxes",
      data
    );
  },

  // NUEVO: Calcular y guardar en un solo paso (Business Logic)
  calculateAndSave: async (data) => {
    return await axiosBusinessInstance.post(
      "/costanalysis/calculate-and-save",
      data
    );
  },

  // NUEVO: Recalcular análisis existente (Business Logic)
  recalculate: async (id, data) => {
    return await axiosBusinessInstance.put(
      `/costanalysis/${encodeURIComponent(id)}/recalculate`,
      data
    );
  },

  // ========== CRUD ENDPOINTS ==========

  getIngredientsOptions: async (recipeId) => {
    return await axiosInstance.get(
      `/costanalysis/recipe/${encodeURIComponent(recipeId)}/ingredients-options`
    );
  },

  // Guardar análisis PRE-CALCULADO (CRUD puro, sin cálculos)
  create: async (data) => {
    return await axiosInstance.post("/costanalysis", data);
  },

  getAll: async () => {
    return await axiosInstance.get("/costanalysis");
  },

  getById: async (id) => {
    return await axiosInstance.get(
      `/costanalysis/${encodeURIComponent(id)}`
    );
  },

  // Actualizar análisis con datos PRE-CALCULADOS (CRUD puro)
  update: async (id, data) => {
    return await axiosInstance.put(
      `/costanalysis/${encodeURIComponent(id)}`,
      data
    );
  },

  remove: async (id) => {
    return await axiosInstance.delete(
      `/costanalysis/${encodeURIComponent(id)}`
    );
  },
};

export default costAnalysisService;