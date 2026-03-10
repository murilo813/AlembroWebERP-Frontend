import api from '@/api/api';

export default {
    async getCollectionsStats() { 
        const response = await api.get('/stats/collections'); 
        return response.data;
    },

    async getExpensesStats() {
        const response = await api.get('/stats/expenses');
        return response.data;
    },
    
    async getBillsStats() {
        const response = await api.get('/stats/bills');
        return response.data;
    }
};