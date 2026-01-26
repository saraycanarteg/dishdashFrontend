import { axiosInstance } from './api';

const unitConversionService = {
  convert: async (data) => {
    // Intenta usar el endpoint de cálculo, si no existe fallback a convertAndSave
    try {
      return await axiosInstance.post('/conversion/calculate', data);
    } catch (err) {
      // Si el endpoint no existe, usar convertAndSave que devuelve el resultado
      // pero ignora los errores de guardado
      try {
        return await axiosInstance.post('/conversion', data);
      } catch (saveErr) {
        // Si falla por validación (ej: result es required), es normal
        // ya que intentamos guardar sin todos los datos requeridos
        // Devolver los datos que sí tenemos del error
        if (saveErr.result) {
          return {
            from: `${data.value} ${data.fromUnit}`,
            to: saveErr.result,
            densityUsed: data.density
          };
        }
        throw saveErr;
      }
    }
  },

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