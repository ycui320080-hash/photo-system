import { createRouter, createWebHashHistory } from 'vue-router';

function hasSession() {
  return Boolean(
    (sessionStorage.getItem('token') || localStorage.getItem('token')) &&
      (sessionStorage.getItem('role') || localStorage.getItem('role')),
  );
}

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/login', component: () => import('./modules/auth/Index.vue'), meta: { public: true } },
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: () => import('./modules/dashboard/Index.vue') },
    { path: '/calendar', component: () => import('./modules/calendar/Index.vue') },
    { path: '/orders', component: () => import('./modules/orders/Index.vue') },
    { path: '/packages', component: () => import('./modules/packages/Index.vue') },
    { path: '/photo-import', component: () => import('./modules/photo-import/Index.vue') },
    { path: '/photo-selection', component: () => import('./modules/photo-selection/Index.vue') },
    { path: '/printing', component: () => import('./modules/printing/Index.vue') },
    { path: '/delivery', component: () => import('./modules/delivery/Index.vue') },
    { path: '/customers', component: () => import('./modules/customers/Index.vue') },
    { path: '/statistics', component: () => import('./modules/statistics/Index.vue') },
    { path: '/settings', component: () => import('./modules/settings/Index.vue') },
  ],
});

router.beforeEach((to) => {
  const signedIn = hasSession();
  if (!signedIn && !to.meta.public) return { path: '/login', query: { redirect: to.fullPath } };
  if (signedIn && to.path === '/login') return '/dashboard';
  return true;
});