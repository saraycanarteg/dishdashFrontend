import { axiosInstance } from "./api";

const recipeScalingService = {
  // Escala una receta (ya guarda automáticamente en BD)
  scaleRecipe: async (recipeId, data) => {
    return await axiosInstance.post(
      `/recipe/${encodeURIComponent(recipeId)}/scale`,
      data
    );
  },

  // Obtiene todos los escalados guardados
  getAll: async () => {
    return await axiosInstance.get("/scaled-recipes");
  },

  // Obtiene escalados de una receta específica
  getScaledRecipesByRecipe: async (recipeId) => {
    return await axiosInstance.get(
      `/scaled-recipes/recipe/${encodeURIComponent(recipeId)}`
    );
  },

  // Obtiene un escalado específico por ID
  getById: async (id) => {
    return await axiosInstance.get(
      `/scaled-recipes/${encodeURIComponent(id)}`
    );
  },

  // Elimina un escalado (soft delete)
  delete: async (id) => {
    return await axiosInstance.delete(
      `/scaled-recipes/${encodeURIComponent(id)}`
    );
  },
};

export default recipeScalingService;
