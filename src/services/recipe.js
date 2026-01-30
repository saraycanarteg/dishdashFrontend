import { axiosInstance, axiosBusinessInstance } from "./api";

const recipeService = {
  // ========== CRUD ENDPOINTS ==========
  
  getAll: async () => {
    return await axiosInstance.get("/recipes");
  },
  
  getByCategory: async (category) => {
    return await axiosInstance.get(
      `/recipes/category/${encodeURIComponent(category)}`
    );
  },
  
  getByName: async (name) => {
    return await axiosInstance.get(
      `/recipes/name/${encodeURIComponent(name)}`
    );
  },
  
  getById: async (id) => {
    return await axiosInstance.get(`/recipes/${encodeURIComponent(id)}`);
  },
  
  create: async (data) => {
    return await axiosInstance.post("/recipe", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Actualización simple SIN cálculos automáticos (CRUD puro)
  update: async (id, data) => {
    return await axiosInstance.put(
      `/recipe/${encodeURIComponent(id)}`,
      data
    );
  },

  remove: async (id) => {
    return await axiosInstance.delete(
      `/recipe/${encodeURIComponent(id)}`
    );
  },
  
  forceDelete: async (id) => {
    return await axiosInstance.delete(
      `/recipe/${encodeURIComponent(id)}/force`
    );
  },

  restore: async (id) => {
    return await axiosInstance.patch(
      `/recipe/${encodeURIComponent(id)}/restore`
    );
  },

  // ========== BUSINESS LOGIC ENDPOINTS ==========
  
  // NUEVO: Actualización CON recálculo automático de costos
  updateWithCalculations: async (id, data) => {
    return await axiosBusinessInstance.put(
      `/recipe/${encodeURIComponent(id)}/with-calculations`,
      data
    );
  },
};

export default recipeService;
