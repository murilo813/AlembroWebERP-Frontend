import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/Login/LoginView.vue';
import HomeView from '@/views/Home/HomeView.vue';
import FinanceView from '@/views/Finance/FinanceView.vue';
import StockView from '@/views/Stock/StockView.vue';
import ExpensesView from '@/views/Expenses/ExpensesView.vue';
import ManagementView from '@/views/Management/ManagementView.vue';
import { ROLE_PERMISSIONS } from '@/utils/constants';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/home', component: HomeView },
  {
    path: '/finance',
    component: FinanceView,
    meta: { module: 'finance' }
  },
  {
    path: '/stock',
    component: StockView,
    meta: { module: 'stock' }
  },
  {
    path: '/expenses',
    component: ExpensesView,
    meta: { module: 'expenses' }
  },
  {
    path: '/management',
    component: ManagementView,
    meta: { module: 'management' }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('userId');
  const userType = localStorage.getItem('userType');

  if (to.path !== '/login' && !isAuthenticated) {
    return next('/login');
  }

  if (to.meta.module && userType) {
    const userPermissions = ROLE_PERMISSIONS[userType] || [];
    
    if (!userPermissions.includes(to.meta.module)) {
      console.warn(`Acesso negado: Usuário ${userType} tentou acessar ${to.meta.module}`);
      return next('/home');
    }
  }
  next();
});

export default router;