import { axiosBusinessInstance } from "./api";

const costAnalysisService = {
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

  calculateAndSave: async (data) => {
    return await axiosBusinessInstance.post(
      "/costanalysis/calculate-and-save",
      data
    );
  },

  recalculate: async (id, data) => {
    return await axiosBusinessInstance.put(
      `/costanalysis/${encodeURIComponent(id)}/recalculate`,
      data
    );
  },

  getIngredientsOptions: async (recipeId) => {
    return await axiosBusinessInstance.get(
      `/costanalysis/recipe/${encodeURIComponent(recipeId)}/ingredients-options`
    );
  },

  create: async (data) => {
    return await axiosBusinessInstance.post("/costanalysis", data);
  },

  getAll: async () => {
    return await axiosBusinessInstance.get("/costanalysis");
  },

  getById: async (id) => {
    return await axiosBusinessInstance.get(
      `/costanalysis/${encodeURIComponent(id)}`
    );
  },

  update: async (id, data) => {
    return await axiosBusinessInstance.put(
      `/costanalysis/${encodeURIComponent(id)}`,
      data
    );
  },

  remove: async (id) => {
    return await axiosBusinessInstance.delete(
      `/costanalysis/${encodeURIComponent(id)}`
    );
  },
};

export default costAnalysisService;