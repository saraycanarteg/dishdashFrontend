import axios from 'axios';

// Configurar baseURL desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3007/dishdash';

// Crear instancia de axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const { status, data } = error.response;

      if (status === 401) {
        // Token inválido o expirado
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      if (status === 403) {
        // Sin permisos
        console.error('Access forbidden:', data.message);
      }

      return Promise.reject({
        status,
        message: data.message || 'An error occurred',
        ...data,
      });
    } else if (error.request) {
      // La petición se hizo pero no se recibió respuesta
      return Promise.reject({
        message: 'No response from server',
      });
    } else {
      // Algo pasó al configurar la petición
      return Promise.reject({
        message: error.message || 'Request error',
      });
    }
  }
);

// API methods
const api = {
  // Autenticación
  auth: {
    login: async (email, password) => {
      return await axiosInstance.post('/auth/login', { email, password });
    },
    register: async (email, password, name) => {
      return await axiosInstance.post('/auth/register', { email, password, name });
    },
    googleAuth: () => {
      // Redirigir a la URL de Google OAuth
      window.location.href = `${API_BASE_URL}/auth/google`;
    },
  },

  // Recetas
  recipes: {
    getAll: async () => {
      return await axiosInstance.get('/recipes');
    },
    getById: async (id) => {
      return await axiosInstance.get(`/recipe/${id}`);
    },
    create: async (recipeData) => {
      return await axiosInstance.post('/recipe', recipeData);
    },
    update: async (id, recipeData) => {
      return await axiosInstance.put(`/recipe/${id}`, recipeData);
    },
    delete: async (id) => {
      return await axiosInstance.delete(`/recipe/${id}`);
    },
  },

  // Cotizaciones
  quotations: {
    getAll: async () => {
      return await axiosInstance.get('/quotations');
    },
    getById: async (id) => {
      return await axiosInstance.get(`/quotation/${id}`);
    },
    create: async (quotationData) => {
      return await axiosInstance.post('/quotations', quotationData);
    },
    update: async (id, quotationData) => {
      return await axiosInstance.put(`/quotation/${id}`, quotationData);
    },
    delete: async (id) => {
      return await axiosInstance.delete(`/quotation/${id}`);
    },
  },
};

export default api;
