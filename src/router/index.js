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
  { path: '/home', component: HomeView },
  {
    path: '/finance',
    component: FinanceView,
    meta: { module: 'finance' }
  },
    {
    path: '/contracts',
    component: ContractsView,
    meta: { module: 'contracts' }
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
    path: '/expenses/bind', 
    component: ExpensesBind,
    meta: { module: 'expenses' } 
  },
  {
    path: '/expenses/data', 
    component: ExpensesData,
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

router.beforeEach((to) => {
  const hasMirrorCookie = /(^|;)\s*is_logged\s*=/.test(document.cookie);
  const userType = localStorage.getItem('userType');

  if (to.meta.requiresAuth && !hasMirrorCookie) {
    localStorage.clear(); 
    return { path: '/login' }; 
  }

  if (to.path === '/login' && hasMirrorCookie) {
    return { path: '/home' };
  }

  if (to.meta.module && userType) {
    const userPermissions = ROLE_PERMISSIONS[userType] || [];
    if (!userPermissions.includes(to.meta.module)) {
      return { path: '/home' };
    }
  }
});

export default router;