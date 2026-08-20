<template>
  <div>
    <!-- Page Title -->
    <v-row class="mb-2 align-center">
      <v-col cols="12" md="6">
        <span class="text-body-1 font-weight-medium text-medium-emphasis">Master Catalog Manager</span>
      </v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn prepend-icon="mdi-plus" color="teal-darken-1" class="glow-btn font-weight-bold" @click="openAddDialog">
          Add Catalog Item
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filter Card -->
    <v-card class="mb-6" border>
      <v-card-text class="pa-4">
        <v-row density="compact">
          <v-col cols="12" md="8">
            <v-text-field v-model="search" prepend-inner-icon="mdi-magnify"
              label="Search items by name or description..." variant="outlined" density="compact" hide-details
              clearable></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select v-model="categoryFilter" label="Filter by Category" :items="['All', ...categories]"
              variant="outlined" density="compact" hide-details
              :input-props="{ autocomplete: 'new-password', role: 'presentation' }"></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select v-model="typeFilter" label="Filter by Asset Type" :items="['All', 'Material', 'Equipment']"
              variant="outlined" density="compact" hide-details
              :input-props="{ autocomplete: 'new-password', role: 'presentation' }"></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Catalog Datatable -->
    <v-card border elevation="0" class="hover-card">
      <v-card-text class="pa-0">
        <v-table class="catalog-table" density="compact">
          <thead>
            <tr>
              <th class="font-weight-bold">ID</th>
              <th class="font-weight-bold">Asset Type</th>
              <th class="font-weight-bold">Category</th>
              <th class="font-weight-bold">Name</th>
              <th class="font-weight-bold">Unit</th>
              <th class="font-weight-bold text-right">Net Price</th>
              <th class="font-weight-bold text-right">Tax %</th>
              <th class="font-weight-bold text-right">Markup %</th>
              <th class="font-weight-bold text-right">Allowance Price</th>
              <th class="font-weight-bold text-right">Gross Price</th>
              <th class="font-weight-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedItems.length === 0">
              <td colspan="11" class="text-center py-6 text-medium-emphasis">
                No catalog items found matching your filters.
              </td>
            </tr>
            <tr v-for="item in paginatedItems" :key="item.id">
              <td>{{ item.id }}</td>
              <td>
                <v-chip size="x-small" :color="item.id.startsWith('E') ? 'blue-darken-1' : 'amber-darken-2'"
                  variant="flat" class="font-weight-bold">
                  {{ item.id.startsWith('E') ? 'Equipment' : 'Material' }}
                </v-chip>
              </td>
              <td>{{ item.category }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.unit }}</td>
              <td class="text-right">${{ formatMoney(item.netPrice) }}</td>
              <td class="text-right">{{ ((item.tax || 0) * 100).toFixed(0) }}%</td>
              <td class="text-right">{{ ((item.markup || 0.25) * 100).toFixed(0) }}%</td>
              <td class="text-right font-weight-medium">${{ formatMoney(item.netPrice * (1 + (item.tax || 0))) }}</td>
              <td class="text-right font-weight-bold text-teal">${{ formatMoney(item.grossPrice || (item.netPrice * (1 +
                (item.tax || 0)) * (1 + (item.markup || 0.25)))) }}</td>
              <td class="text-center">
                <v-btn icon="mdi-pencil" variant="text" color="blue" size="small" @click="openEditDialog(item)"></v-btn>
                <v-btn icon="mdi-delete" variant="text" color="red" size="small" @click="confirmDelete(item)"></v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Pagination Footer -->
        <v-divider></v-divider>
        <v-row class="pa-4 align-center justify-space-between flex-wrap gap-2">
          <v-col cols="auto" class="text-caption text-medium-emphasis">
            Showing {{ startRange }} to {{ endRange }} of {{ filteredItems.length }} items
          </v-col>
          <v-col cols="auto">
            <v-pagination v-model="page" :length="totalPages" total-visible="5" density="compact"
              color="teal"></v-pagination>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Dialog for Add / Edit Item -->
    <v-dialog v-model="catalogDialog" max-width="600px">
      <v-card border elevation="10" class="rounded-xl pa-2">
        <v-card-title class="d-flex align-center justify-space-between px-4 pt-4 pb-2">
          <span class="text-h6 font-weight-bold text-teal-darken-2">
            {{ isEdit ? 'Edit Catalog Item' : 'Add New Catalog Item' }}
          </span>
          <v-btn icon="mdi-close" variant="text" size="small" density="comfortable" color="grey-darken-1"
            @click="catalogDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="px-4 py-2">
          <v-row density="compact">
            <v-col cols="12" sm="6">
              <v-select v-model="form.type" label="Asset Type" :items="['Material', 'Equipment']" :disabled="isEdit"
                variant="outlined" density="compact"></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-combobox v-model="form.category" label="Category" :items="categories" variant="outlined"
                density="compact"></v-combobox>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.name" label="Item Name *" variant="outlined" density="compact"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.desc" label="Description" variant="outlined" density="compact"
                rows="2"></v-textarea>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model.number="form.netPrice" type="number" label="Net Price ($)" variant="outlined"
                density="compact"></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model.number="form.taxPercent" type="number" label="Tax (%)" variant="outlined"
                density="compact" :hint="'= $' + formatMoney(computedTaxAbs)" persistent-hint></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model.number="form.markupPercent" type="number" label="Markup (%)" variant="outlined"
                density="compact" :hint="'= $' + formatMoney(computedMarkupAbs)" persistent-hint></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select v-model="form.unit" label="Unit Type" :items="appStore.settings.unitTypes" variant="outlined"
                density="compact"></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.note" label="Note" variant="outlined" density="compact"></v-text-field>
            </v-col>
            <v-col cols="12" class="pt-2">
              <v-card variant="flat" color="teal-lighten-5" class="pa-3 rounded-lg border border-teal-lighten-4">
                <v-row density="compact" class="align-center text-center">
                  <v-col cols="6">
                    <div
                      class="d-flex align-center justify-center text-caption text-medium-emphasis font-weight-medium mb-1">
                      <span>Allowance Price</span>
                      <v-icon icon="mdi-information-outline" size="x-small" color="grey-darken-1"
                        class="ml-1 cursor-pointer"></v-icon>
                      <v-tooltip activator="parent" location="top">
                        Allowance Price = Net Price + Tax
                      </v-tooltip>
                    </div>
                    <div class="text-subtitle-1 font-weight-bold text-amber-darken-3">
                      ${{ formatMoney(computedAllowancePrice) }}
                    </div>
                  </v-col>
                  <v-col cols="6" class="border-s">
                    <div
                      class="d-flex align-center justify-center text-caption text-medium-emphasis font-weight-medium mb-1">
                      <span>Gross Price</span>
                      <v-icon icon="mdi-information-outline" size="x-small" color="grey-darken-1"
                        class="ml-1 cursor-pointer"></v-icon>
                      <v-tooltip activator="parent" location="top">
                        Gross Price = Net Price + Tax + Markup
                      </v-tooltip>
                    </div>
                    <div class="text-subtitle-1 font-weight-bold text-teal-darken-3">
                      ${{ formatMoney(computedGrossPrice) }}
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4 pt-2 justify-end">
          <v-btn variant="tonal" color="grey-darken-1" density="comfortable" class="text-none px-4 rounded-lg mr-2"
            @click="catalogDialog = false">Cancel</v-btn>
          <v-btn color="teal" variant="flat" density="comfortable" class="text-none px-4 rounded-lg font-weight-medium"
            elevation="1" @click="saveCatalogItem">Save Item</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Modal -->
    <v-dialog v-model="deleteDialog" max-width="440" transition="dialog-bottom-transition">
      <v-card class="rounded-xl pa-2" elevation="10" border>
        <div class="d-flex align-center pa-4 pb-2">
          <v-avatar color="red-lighten-5" size="44" class="mr-3">
            <v-icon icon="mdi-delete-outline" color="red-darken-1" size="24"></v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-slate-800">Remove Catalog Item</div>
            <div class="text-caption text-medium-emphasis">This action cannot be undone</div>
          </div>
        </div>

        <v-card-text class="px-4 py-3 text-body-2 text-slate-700">
          Are you sure you want to permanently delete <span class="font-weight-bold text-slate-900">"{{
            itemToDelete?.name }}"</span> from the master catalog?
        </v-card-text>

        <v-card-actions class="pa-4 pt-2 justify-end">
          <v-btn variant="tonal" color="grey-darken-1" density="comfortable" class="text-none px-4 rounded-lg mr-2"
            @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="red-darken-1" variant="flat" density="comfortable"
            class="text-none px-4 rounded-lg font-weight-medium" elevation="1" @click="executeDelete">Delete
            Item</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

const search = ref('');
const categoryFilter = ref('All');
const typeFilter = ref('All');

// Pagination
const page = ref(1);
const itemsPerPage = 15;

// Dialog States
const catalogDialog = ref(false);
const isEdit = ref(false);
const deleteDialog = ref(false);
const itemToDelete = ref(null);

// Form Fields
const form = ref({
  id: '',
  type: 'Material',
  category: '',
  name: '',
  desc: '',
  netPrice: 0,
  allowancePercent: appStore.settings.defaults?.materialAllowance ?? 6,
  taxPercent: appStore.settings.defaults?.materialTax ?? 25,
  unit: 'each',
  note: ''
});

const categories = computed(() => appStore.settings?.categories || []);

// Computed Allowance & Gross Prices inside dialog
const computedAllowancePrice = computed(() => {
  const net = parseFloat(form.value.netPrice) || 0;
  const tax = (parseFloat(form.value.taxPercent) || 0) / 100;
  return net * (1 + tax);
});

const computedGrossPrice = computed(() => {
  const net = parseFloat(form.value.netPrice) || 0;
  const tax = (parseFloat(form.value.taxPercent) || 0) / 100;
  const markup = (parseFloat(form.value.markupPercent) || 0) / 100;
  return net * (1 + tax) * (1 + markup);
});

const computedTaxAbs = computed(() => {
  const net = parseFloat(form.value.netPrice) || 0;
  const tax = (parseFloat(form.value.taxPercent) || 0) / 100;
  return net * tax;
});

const computedMarkupAbs = computed(() => {
  const net = parseFloat(form.value.netPrice) || 0;
  const tax = (parseFloat(form.value.taxPercent) || 0) / 100;
  const markup = (parseFloat(form.value.markupPercent) || 0) / 100;
  return net * (1 + tax) * markup;
});

// Compile total items
const combinedCatalogItems = computed(() => {
  const mats = appStore.materials.map(m => ({ ...m, type: 'Material' }));
  const eqs = appStore.equipments.map(e => ({ ...e, type: 'Equipment' }));
  return [...mats, ...eqs];
});

// Filter items
const filteredItems = computed(() => {
  let list = combinedCatalogItems.value;

  if (typeFilter.value !== 'All') {
    list = list.filter(i => i.type === typeFilter.value);
  }

  if (categoryFilter.value !== 'All') {
    list = list.filter(i => i.category === categoryFilter.value);
  }

  if (search.value) {
    const query = search.value.toLowerCase();
    list = list.filter(i =>
      (i.name && i.name.toLowerCase().includes(query)) ||
      (i.desc && i.desc.toLowerCase().includes(query)) ||
      (i.id && i.id.toLowerCase().includes(query))
    );
  }

  return list;
});

// Paginated items
const paginatedItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredItems.value.slice(start, end);
});

// Pagination Calculations
const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage));
const startRange = computed(() => filteredItems.value.length === 0 ? 0 : (page.value - 1) * itemsPerPage + 1);
const endRange = computed(() => Math.min(page.value * itemsPerPage, filteredItems.value.length));

// Modal Form Actions
const openAddDialog = () => {
  isEdit.value = false;
  form.value = {
    id: '',
    type: 'Material',
    category: 'Hardware',
    name: '',
    desc: '',
    netPrice: 0,
    taxPercent: appStore.settings.defaults?.materialTax ?? 6,
    markupPercent: appStore.settings.defaults?.materialMarkup ?? 25,
    unit: 'each',
    note: ''
  };
  catalogDialog.value = true;
};

const openEditDialog = (item) => {
  isEdit.value = true;
  form.value = {
    id: item.id,
    type: item.type,
    category: item.category,
    name: item.name,
    desc: item.desc,
    netPrice: item.netPrice,
    taxPercent: Math.round((item.tax !== undefined ? item.tax : (item.type === 'Equipment' ? 0 : 0.06)) * 100),
    markupPercent: Math.round((item.markup !== undefined ? item.markup : 0.25) * 100),
    unit: item.unit,
    note: item.note || ''
  };
  catalogDialog.value = true;
};

const saveCatalogItem = async () => {
  if (!form.value.name.trim()) return;

  const targetArray = form.value.type === 'Material' ? appStore.materials : appStore.equipments;
  const itemTax = (parseFloat(form.value.taxPercent) || 0) / 100;
  const itemMarkup = (parseFloat(form.value.markupPercent) || 0) / 100;
  const itemNet = parseFloat(form.value.netPrice) || 0;

  const updatedItem = {
    id: form.value.id || (form.value.type === 'Material'
      ? `M${appStore.materials.length + 1001}`
      : `E${appStore.equipments.length + 1001}`),
    category: form.value.category,
    name: form.value.name,
    desc: form.value.desc,
    defaultQty: 1,
    unit: form.value.unit,
    netPrice: itemNet,
    tax: itemTax,
    markup: itemMarkup,
    grossPrice: Math.round(itemNet * (1 + itemTax) * (1 + itemMarkup) * 100) / 100,
    note: form.value.note
  };

  if (isEdit.value) {
    const idx = targetArray.findIndex(i => i.id === form.value.id);
    if (idx !== -1) {
      targetArray[idx] = updatedItem;
    }
  } else {
    targetArray.push(updatedItem);
  }

  try {
    const catalogType = form.value.type === 'Material' ? 'materials' : 'equipment';
    await appStore.upsertCatalog(catalogType, targetArray);
    catalogDialog.value = false;
  } catch (err) {
    appStore.error = `Error saving catalog item: ${err.message}`;
  }
};

const confirmDelete = (item) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

const executeDelete = async () => {
  if (!itemToDelete.value) return;

  const catalogType = itemToDelete.value.type === 'Material' ? 'materials' : 'equipments';
  if (itemToDelete.value.type === 'Material') {
    appStore.materials = appStore.materials.filter(i => i.id !== itemToDelete.value.id);
  } else {
    appStore.equipments = appStore.equipments.filter(i => i.id !== itemToDelete.value.id);
  }

  try {
    const targetArray = itemToDelete.value.type === 'Material' ? appStore.materials : appStore.equipments;
    await appStore.upsertCatalog(catalogType, targetArray);
    deleteDialog.value = false;
    itemToDelete.value = null;
  } catch (err) {
    appStore.error = `Error deleting catalog item: ${err.message}`;
  }
};

// Auto-switch defaults when type changes
watch(() => form.value.type, (newType) => {
  if (newType === 'Equipment') {
    form.value.taxPercent = appStore.settings.defaults?.equipmentTax ?? 0;
    form.value.markupPercent = appStore.settings.defaults?.equipmentMarkup ?? 25;
  } else {
    form.value.taxPercent = appStore.settings.defaults?.materialTax ?? 6;
    form.value.markupPercent = appStore.settings.defaults?.materialMarkup ?? 25;
  }
});

const formatMoney = (val) => {
  return (parseFloat(val) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
