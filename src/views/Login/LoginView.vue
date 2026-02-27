<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="brand-title">Alembro</h1>
        <p class="brand-subtitle">Sistema de gestão administrativa</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label>Usuário</label>
          <input type="text" v-model="username" placeholder="Digite seu usuário" :disabled="isLoading" required />
        </div>

        <div class="input-group">
          <label>Senha</label>
          <div class="password-wrapper">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="password" 
              placeholder="••••••••" 
              :disabled="isLoading" 
              required 
            />
            <button type="button" @click="showPassword = !showPassword" class="toggle-password">
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

        <button type="submit" class="btn-login" :disabled="isLoading">
          <span v-if="!isLoading">Acessar Sistema</span>
          <span v-else>Carregando...</span>
        </button>
      </form>

      <footer class="login-footer">
        <p>&copy; 2026 Alembro. Todos os direitos reservados.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');
const isLoading = ref(false);

const router = useRouter();

const handleLogin = async () => {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const response = await api.post('/login', {
      username: username.value,
      password: password.value
    });

    if (response.data.success) {
      const { userId, companyId, nomenclature, userType} = response.data;

      localStorage.setItem('userId', userId);
      localStorage.setItem('companyId', companyId);
      localStorage.setItem('nomenclature', nomenclature);
      localStorage.setItem('userType', userType);
      localStorage.setItem('isLogged', 'true');

      router.push('/home');
    } else {
      errorMessage.value = response.data.message || 'Usuário ou senha incorretos.';
    }
  } catch (error) {
    if (!error.response) {
      errorMessage.value = 'Sem conexão com o servidor.';
    } else if (error.response.status === 401 || error.response.status === 404) {
      errorMessage.value = 'Usuário ou senha incorretos.';
    } else {
      errorMessage.value = 'Erro interno do servidor.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style src="./login.css" scoped></style>