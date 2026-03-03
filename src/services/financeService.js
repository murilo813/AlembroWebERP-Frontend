import api from '@/api/api';

const financeService = {
  async searchClients(query) {
    try {
      const response = await api.get('/finances/clients/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error("Erro na busca de clientes:", error);
      throw error;
    }
  },

  async getClientData(clientId) {
    try {
      const response = await api.get(`/finances/clients/${clientId}/details`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar detalhes do cliente:", error);
      throw error;
    }
  },

  async saveObservation(clientId, payload) {
    try {
      const response = await api.post(`/finances/clients/${clientId}/observations`, payload);
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar atendimento:", error);
      throw error;
    }
  }
};

export default financeService;