import api from '@/api/api'; 

export default {
  async login(username, password) {
    const response = await api.post('/login', { username, password });

    if (response.data.success) {
      const { userId, companyId, nomenclature, userType } = response.data;

      localStorage.setItem('userId', userId);
      localStorage.setItem('companyId', companyId);
      localStorage.setItem('nomenclature', nomenclature);
      localStorage.setItem('userType', userType);
      localStorage.setItem('isLogged', 'true');

      return response.data;
    }

    const error = new Error(response.data.message || 'Usuário ou senha incorretos.');
    error.isCustom = true;
    throw error;
  },

  logout() {
    localStorage.clear(); 
  }
};