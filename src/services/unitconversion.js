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
  getUnits: async () => {
    return await axiosInstance.get('/units');
  },
  getAllUnits: async () => {
    return await axiosInstance.get('/unitsall');
  },
  update: async (id, data) => {
    return await axiosInstance.put(`/conversion/${id}`, data);
  },
  delete: async (id) => {
    return await axiosInstance.delete(`/conversion/${id}`);
  }
};

export default unitConversionService;