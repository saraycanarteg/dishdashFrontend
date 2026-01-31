import axios from 'axios';

const API_CRUD_URL = import.meta.env.VITE_API_CRUD_URL || '/api/crud';
const API_BUSINESS_URL = import.meta.env.VITE_API_BUSINESS_URL || '/api/business';

const axiosInstance = axios.create({
  baseURL: API_CRUD_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosBusinessInstance = axios.create({
  baseURL: API_BUSINESS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      return await axiosBusinessInstance.post('/auth/login', { email, password });
    },
    register: async (email, password, name) => {
      return await axiosBusinessInstance.post('/auth/register', { email, password, name });
    },
    googleAuth: () => {
      window.location.href = `${API_BUSINESS_URL}/auth/google`;
    },
    verify: async () => {
      return await axiosBusinessInstance.get('/auth/verify');
    },
  }
};

export { axiosInstance, axiosBusinessInstance };
export default api;
