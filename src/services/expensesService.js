import api from '@/api/api';

const expensesService = {
  async getStats() {
    try {
      const userId = localStorage.getItem('userId');

      const response = await api.get('/expenses/stats', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas de gastos:", error);
      throw error;
    }
  },

  async searchFleet(query, searchType) {
    try {
      const response = await api.get('/expenses/fleet/search', {
        params: { q: query, search_type: searchType }
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar frota (${searchType}):`, error);
      throw error;
    }
  },

  async registerExpense(payload) {
    try {
      const response = await api.post('/expenses', payload);
      return response.data;
    } catch (error) {
      console.error("Erro ao registrar vínculo de gasto:", error);
      throw error;
    }
  },

  async getPendingNotes(userId) {
    try {
      const response = await api.get('/expenses/pending', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar entradas pendentes:", error);
      throw error;
    }
  },

  async getExpenses(filters) {
    try {
      const response = await api.get('/expenses', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar a lista de gastos:", error);
      throw error;
    }
  },

  async getExpenseDetails(entryId) {
    try {
      const response = await api.get(`/expenses/${entryId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar detalhes da entrada:", error);
      throw error;
    }
  }
};

export default expensesService;