import { axiosInstance } from './api';

const unitConversionService = {
  convertAndSave: async (data) => {
    return await axiosInstance.post('/conversion', data);
  },

  kitchenConversion: async (data) => {
    return await axiosInstance.post('/conversion/kitchen', data);
  },

  getAll: async () => {
    return await axiosInstance.get('/conversions');
  },

  getAllUnits: async () => {
    return await axiosInstance.get('/unitsall'); // ← Este endpoint devuelve el array completo
  },

  delete: async (id) => {
    return await axiosInstance.delete(`/conversion/${id}`);
  }
};

export default unitConversionService;