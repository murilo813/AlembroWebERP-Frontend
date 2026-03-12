import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/Login/LoginView.vue';
import HomeView from '@/views/Home/HomeView.vue';
import FinanceView from '@/views/Finance/FinanceView.vue';
import ContractsView from '@/views/Contracts/ContractsView.vue';
import StockView from '@/views/Stock/StockView.vue';
import ExpensesView from '@/views/Expenses/ExpensesView.vue';
import ExpensesBind from '@/views/Expenses/ExpensesBind.vue';
import ExpensesData from '@/views/Expenses/ExpensesData.vue';
import ManagementView from '@/views/Management/ManagementView.vue';
import { ROLE_PERMISSIONS } from '@/utils/constants';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/home', component: HomeView, meta: { requiresAuth: true } },
  {
    path: '/finance',
    component: FinanceView,
    meta: { module: 'finance', requiresAuth: true }
  },
  {
    path: '/contracts',
    component: ContractsView,
    meta: { module: 'contracts', requiresAuth: true }
  },
  {
    path: '/stock',
    component: StockView,
    meta: { module: 'stock', requiresAuth: true }
  },
  {
    path: '/expenses',
    component: ExpensesView,
    meta: { module: 'expenses', requiresAuth: true }
  },
  {
    path: '/expenses/bind', 
    component: ExpensesBind,
    meta: { module: 'expenses', requiresAuth: true } 
  },
  {
    path: '/expenses/data', 
    component: ExpensesData,
    meta: { module: 'expenses', requiresAuth: true } 
  },
  {
    path: '/management',
    component: ManagementView,
    meta: { module: 'management', requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const hasSessionCookie = document.cookie.split(';').some(c => c.trim().startsWith('session='));
  
  const userType = localStorage.getItem('userType');

  if (to.path !== '/login' && !hasSessionCookie) {
    console.warn("Sessão expirada no navegador. Redirecionando...");
    localStorage.clear(); 
    return next('/login');
  }

  if (to.path === '/login' && hasSessionCookie) {
    return next('/home');
  }

  if (to.meta.module && userType) {
    const userPermissions = ROLE_PERMISSIONS[userType] || [];
    if (!userPermissions.includes(to.meta.module)) {
      return next('/home');
    }
  }

  next();
});

export default router;