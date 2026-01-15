import { axiosInstance } from "./api";

const recipeService = {
  // Obtener todas las recetas
  getAll: async () => {
    return await axiosInstance.get("/recipes");
  },

  // Obtener por categoría
  getByCategory: async (category) => {
    return await axiosInstance.get(
      `/recipes/category/${encodeURIComponent(category)}`
    );
  },

  // Obtener por nombre
  getByName: async (name) => {
    return await axiosInstance.get(
      `/recipes/name/${encodeURIComponent(name)}`
    );
  },

  // Obtener por ID
  getById: async (id) => {
    return await axiosInstance.get(`/recipes/${encodeURIComponent(id)}`);
  },
  create: async (data) => {
    return await axiosInstance.post("/recipe", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Actualizar receta
  update: async (id, data) => {
    return await axiosInstance.put(
      `/recipe/${encodeURIComponent(id)}`,
      data
    );
  },

  // Eliminar (soft delete)
  remove: async (id) => {
    return await axiosInstance.delete(
      `/recipe/${encodeURIComponent(id)}`
    );
  },


  // Eliminar definitivo
  forceDelete: async (id) => {
    return await axiosInstance.delete(
      `/recipe/${encodeURIComponent(id)}/force`
    );
  },

  // Restaurar
  restore: async (id) => {
    return await axiosInstance.patch(
      `/recipe/${encodeURIComponent(id)}/restore`
    );
  },
};

export default recipeService;
