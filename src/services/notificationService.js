import api from '@/api/api';

const notificationService = {
  async getNotifications() { 
    try {
      const response = await api.get('/notifications'); 
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      return [];
    }
  },

  async markAsRead(id) {
    try {
      const response = await api.patch(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      throw error;
    }
  }
};

export default notificationService;