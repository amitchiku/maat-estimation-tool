<template>
  <v-app :theme="theme">
    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" :rail="rail" class="no-print" border elevation="0">
      <v-list>
        <v-list-item prepend-avatar="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-light.svg"
          title="Estimator Engine" subtitle="v1.0.0"></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-file-document-multiple" title="Quotes Dashboard" value="quotes"
          :to="{ name: 'quotes' }"></v-list-item>
        <v-list-item v-if="appStore.currentQuote" prepend-icon="mdi-hammer-wrench" title="Quote Builder" value="builder"
          :to="{ name: 'quote-builder', params: { id: appStore.currentQuote.id } }"></v-list-item>

        <v-list-item prepend-icon="mdi-playlist-plus" title="Line Items" value="line-items"
          :to="{ name: 'line-items' }"></v-list-item>
        <v-list-item prepend-icon="mdi-format-list-bulleted-triangle" title="Materials and Equipments" value="catalog"
          :to="{ name: 'catalog' }"></v-list-item>
        <v-list-item prepend-icon="mdi-account-cash" title="Labor Rates" value="labor"
          :to="{ name: 'labor' }"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Settings" value="settings"
          :to="{ name: 'settings' }"></v-list-item>
      </v-list>

      <!-- Minimize / Maximize Drawer Footer -->
      <template v-slot:append>
        <v-divider></v-divider>
        <v-list density="compact" nav>
          <v-list-item :prepend-icon="rail ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left'"
            :title="rail ? 'Maximize' : 'Minimize'" @click="toggleRail"></v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Top AppBar -->
    <v-app-bar class="no-print px-4" flat border>
      <v-btn icon="mdi-menu" variant="text" class="mr-2" @click="toggleDrawer" title="Toggle Sidebar Collapse"></v-btn>

      <v-app-bar-title class="font-weight-bold text-teal-darken-2">
        <v-icon icon="mdi-calculator-variant" class="mr-2 text-teal-darken-1"></v-icon>
        Construction Estimating Engine
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <span v-if="appStore.currentQuote" class="text-caption text-medium-emphasis mr-4">
        Active Quote: <strong>{{ appStore.currentQuote.name }}</strong>
      </span>

      <!-- Theme Switcher -->
      <v-btn icon="mdi-theme-light-dark" variant="text" @click="toggleTheme" title="Toggle Light/Dark Theme"></v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-6">
        <!-- Load Status Alert -->
        <v-alert v-if="appStore.error" type="error" variant="tonal" closable class="mb-4 no-print"
          @click:close="appStore.error = null">
          {{ appStore.error }}
        </v-alert>

        <!-- Router View -->
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();
const theme = ref(localStorage.getItem('theme') || 'dark');

// Load drawer states from localStorage
const drawer = ref(localStorage.getItem('sidebar-visible') !== 'false');
const rail = ref(localStorage.getItem('sidebar-rail') === 'true');

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', theme.value);
};

const toggleDrawer = () => {
  drawer.value = !drawer.value;
  localStorage.setItem('sidebar-visible', drawer.value ? 'true' : 'false');
};

const toggleRail = () => {
  rail.value = !rail.value;
  localStorage.setItem('sidebar-rail', rail.value ? 'true' : 'false');
};

onMounted(() => {
  // Load master lists on startup
  appStore.loadCatalog();
  appStore.loadQuotes();
});
</script>

