import { axiosInstance, axiosBusinessInstance } from "./api";

const quotationService = {
  getForCalendar: async () => {
    const response = await axiosInstance.get("/quotations/calendar");
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await axiosInstance.get("/quotations", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/quotations/${encodeURIComponent(id)}`);
    return response.data;
  },

  createChefQuotation: async (payload) => {
    const response = await axiosInstance.post("/quotations/chef-quotation", payload);
    return response.data;
  },

  create: async (payload) => {
    const response = await axiosInstance.post("/quotations", payload);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/quotations/${encodeURIComponent(id)}`, data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axiosInstance.patch(
      `/quotations/${encodeURIComponent(id)}/status`,
      { status }
    );
    return response.data;
  },

  remove: async (id) => {
    const response = await axiosInstance.delete(`/quotations/${encodeURIComponent(id)}`);
    return response.data;
  },

  approveAndSchedule: async (id) => {
    const response = await axiosBusinessInstance.patch(
      `/quotations/${encodeURIComponent(id)}/approve-and-schedule`
    );
    return response.data; 
  },

  createClientRequest: async (payload) => {
    const response = await axiosInstance.post("/quotations/client-request", payload);
    return response.data;
  },

  estimateClientRequest: async (payload) => {
    const response = await axiosBusinessInstance.post(
      "/quotations/client-request/estimate",
      payload
    );
    return response.data;
  },

  calculateChefQuotation: async (payload) => {
    const response = await axiosBusinessInstance.post(
      "/quotations/chef-calculate",
      payload
    );
    return response.data;
  }
};

export default quotationService;