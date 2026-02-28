import api from '@/api/api';

export default {
    async getCollectionsStats(userId) {
        const response = await api.get('/stats/collections', { params: { userId } });
        return response.data;
    },

    async getExpensesStats(userId) {
        const response = await api.get('/stats/expenses', { params: { userId } });
        return response.data;
    },
    
    async getBillsStats(userId) {
        const response = await api.get('/stats/bills', { params: { userId } });
        return response.data;
    }
};