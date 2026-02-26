<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="brand-title">Alembro</h1>
        <p class="brand-subtitle">Business Management System</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label>Usuário</label>
          <input type="text" v-model="username" placeholder="Digite seu usuário" :disabled="isLoading" required />
        </div>

        <div class="input-group">
          <label>Senha</label>
          <input type="password" v-model="password" placeholder="••••••••" :disabled="isLoading" required />
        </div>

        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

        <button type="submit" class="btn-login" :disabled="isLoading">
          <span v-if="!isLoading">Acessar Sistema</span>
          <span v-else>Carregando...</span>
        </button>
      </form>

      <footer class="login-footer">
        <p>&copy; 2026 Agro Zecão. Todos os direitos reservados.</p>
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
      const { userId, nomenclature } = response.data;

      localStorage.setItem('userId', userId);
      localStorage.setItem('nomenclature', nomenclature);
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