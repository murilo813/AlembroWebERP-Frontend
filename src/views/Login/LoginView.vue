<template>
  <div class="login-container">
    <div class="login-card">

      <div class="logo-placeholder">
        <img src="/favicon.png" alt="AgroZecão Logo" class="logo-image" />
      </div>

      <h1 class="title">AgroZecão</h1>
      <p class="subtitle">Faça login para continuar</p>

      <form @submit.prevent="handleLogin" style="width: 100%;">

        <div class="input-group">
          <label>Nome de usuário</label>
          <div class="input-wrapper">
            <input type="text" v-model="username" placeholder="Digite seu usuário" required />
          </div>
        </div>

        <div class="input-group">
          <label>Senha</label>
          <div class="input-wrapper">
            <input type="password" v-model="password" placeholder="Digite sua senha" required />
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          {{ isLoading ? 'Carregando...' : 'Entrar' }}
        </button>

      </form>
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
      const { userId, companyId, nomenclature } = response.data;

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