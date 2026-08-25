import { createRouter, createWebHistory } from 'vue-router';

import QuoteList from '@/components/QuoteList.vue';
import QuoteBuilder from '@/components/QuoteBuilder.vue';
import LineItems from '@/components/LineItems.vue';
import CatalogManager from '@/components/CatalogManager.vue';
import LaborRates from '@/components/LaborRates.vue';
import SettingsManager from '@/components/SettingsManager.vue';

const routes = [
  {
    path: '/',
    redirect: '/quotes'
  },
  {
    path: '/quotes',
    name: 'quotes',
    component: QuoteList
  },
  {
    path: '/builder/:id?',
    name: 'quote-builder',
    component: QuoteBuilder,
    props: true
  },
  {
    path: '/line-items',
    name: 'line-items',
    component: LineItems
  },
  {
    path: '/catalog',
    name: 'catalog',
    component: CatalogManager
  },
  {
    path: '/labor',
    name: 'labor',
    component: LaborRates
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsManager
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/quotes'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
