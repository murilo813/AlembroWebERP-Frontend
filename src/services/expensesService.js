import api from '@/api/api';

const expensesService = {
  async getStats() {
    try {
      const response = await api.get('/expenses/stats');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas de gastos:", error);
      throw error;
    }
  }
};

export default expensesService;