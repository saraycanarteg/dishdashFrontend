import axios from 'axios';

// Configuración de URLs base para CRUD y Business Logic
const API_CRUD_URL = import.meta.env.VITE_CRUD_API || 'http://localhost:3007/dishdash';
const API_BUSINESS_URL = import.meta.env.VITE_BUSINESS_API || 'http://localhost:3007/dishdash';

// Instancia para operaciones CRUD
const axiosInstance = axios.create({
  baseURL: API_CRUD_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instancia para operaciones Business Logic
const axiosBusinessInstance = axios.create({
  baseURL: API_BUSINESS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request para ambas instancias
const requestInterceptor = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const requestErrorInterceptor = (error) => {
  return Promise.reject(error);
};

axiosInstance.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
axiosBusinessInstance.interceptors.request.use(requestInterceptor, requestErrorInterceptor);

// Interceptor de response
const responseSuccessInterceptor = (response) => {
  return response.data;
};

const responseErrorInterceptor = (error) => {
  if (error.response) {
    const { status, data } = error.response;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (status === 403) {
      console.error('Access forbidden:', data.message);
    }

    return Promise.reject({
      status,
      message: data.message || 'An error occurred',
      ...data,
    });
  } else if (error.request) {
    return Promise.reject({
      message: 'No response from server',
    });
  } else {
    return Promise.reject({
      message: error.message || 'Request error',
    });
  }
};

axiosInstance.interceptors.response.use(
  responseSuccessInterceptor,
  responseErrorInterceptor
);

axiosBusinessInstance.interceptors.response.use(
  responseSuccessInterceptor,
  responseErrorInterceptor
);

const api = {
  auth: {
    login: async (email, password) => {
      return await axiosInstance.post('/auth/login', { email, password });
    },
    register: async (email, password, name) => {
      return await axiosInstance.post('/auth/register', { email, password, name });
    },
    googleAuth: () => {
      window.location.href = `${API_BASE_URL}/auth/google`;
    },
  },
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

export { axiosInstance, axiosBusinessInstance };
export default api;
