import api from '@/api/api';

const contractsService = {
  async getContracts(userId) {
    try {
      const response = await api.get('/contracts', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error("Erro na busca de contratos:", error);
      throw error;
    }
  },

  async createContract(payload) {
    try {
      const response = await api.post('/contracts', payload);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar contrato:", error);
      throw error;
    }
  },

  async updateContract(contractId, payload) {
    try {
      const response = await api.patch(`/contracts/${contractId}`, payload);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar contrato:", error);
      throw error;
    }
  }
};

export default contractsService;