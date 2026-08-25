<template>
  <div>
    <!-- Search and Actions Bar -->
    <v-row class="mb-4 align-center" density="compact">
      <v-col cols="12" sm="6" md="6">
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search line items..." variant="outlined"
          density="compact" hide-details clearable></v-text-field>
      </v-col>
      <v-col cols="12" sm="2" md="2">
        <v-select v-model="filterRoom" label="Default Room" :items="roomFilterOptions" variant="outlined"
          density="compact" hide-details></v-select>
      </v-col>
      <v-col cols="12" sm="2" md="2">
        <v-select v-model="filterGroup" label="Group" :items="groupFilterOptions" variant="outlined" density="compact"
          hide-details></v-select>
      </v-col>
      <v-col cols="12" sm="2" md="2" class="text-right">
        <v-btn prepend-icon="mdi-plus" color="teal" class="glow-btn text-none" block @click="$emit('create')">
          Create New Item
        </v-btn>
      </v-col>
    </v-row>

    <!-- Custom Line Items Table -->
    <v-card border elevation="0" class="hover-card">
      <v-card-text class="pa-0">
        <v-table density="compact" class="line-items-table">
          <thead>
            <tr>
              <th class="font-weight-bold text-no-wrap cursor-pointer user-select-none" style="width: 140px; min-width: 140px; max-width: 140px;" @click="toggleSort('category')">
                Category
                <v-icon size="x-small" class="ml-1" :color="sortBy === 'category' ? 'teal' : 'grey-lighten-1'">
                  {{ sortBy === 'category' ? (sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up') : 'mdi-swap-vertical' }}
                </v-icon>
              </th>
              <th class="font-weight-bold cursor-pointer user-select-none" style="width: 320px; min-width: 320px; max-width: 320px;" @click="toggleSort('name')">
                Name
                <v-icon size="x-small" class="ml-1" :color="sortBy === 'name' ? 'teal' : 'grey-lighten-1'">
                  {{ sortBy === 'name' ? (sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up') : 'mdi-swap-vertical' }}
                </v-icon>
              </th>
              <th class="font-weight-bold text-right text-no-wrap cursor-pointer user-select-none" style="width: 130px; min-width: 130px; max-width: 130px;" @click="toggleSort('totalPrice')">
                Total Price
                <v-icon size="x-small" class="ml-1" :color="sortBy === 'totalPrice' ? 'teal' : 'grey-lighten-1'">
                  {{ sortBy === 'totalPrice' ? (sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up') : 'mdi-swap-vertical' }}
                </v-icon>
              </th>
              <th class="font-weight-bold text-no-wrap cursor-pointer user-select-none" style="width: 130px; min-width: 130px; max-width: 130px;" @click="toggleSort('activity')">
                Activity
                <v-icon size="x-small" class="ml-1" :color="sortBy === 'activity' ? 'teal' : 'grey-lighten-1'">
                  {{ sortBy === 'activity' ? (sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up') : 'mdi-swap-vertical' }}
                </v-icon>
              </th>
              <th class="font-weight-bold text-no-wrap cursor-pointer user-select-none" style="width: 130px; min-width: 130px; max-width: 130px;" @click="toggleSort('tradePartner')">
                Trade
                <v-icon size="x-small" class="ml-1" :color="sortBy === 'tradePartner' ? 'teal' : 'grey-lighten-1'">
                  {{ sortBy === 'tradePartner' ? (sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up') : 'mdi-swap-vertical' }}
                </v-icon>
              </th>
              <th class="font-weight-bold cursor-pointer user-select-none" style="width: 280px; min-width: 280px; max-width: 280px;" @click="toggleSort('desc')">
                Description
                <v-icon size="x-small" class="ml-1" :color="sortBy === 'desc' ? 'teal' : 'grey-lighten-1'">
                  {{ sortBy === 'desc' ? (sortDesc ? 'mdi-arrow-down' : 'mdi-arrow-up') : 'mdi-swap-vertical' }}
                </v-icon>
              </th>
              <th class="font-weight-bold text-center text-no-wrap" style="width: 100px; min-width: 100px; max-width: 100px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredLineItems.length === 0">
              <td colspan="7" class="text-center py-6 text-medium-emphasis">
                No line items found matching criteria.
              </td>
            </tr>
            <tr v-for="item in paginatedLineItems" :key="item.id">
              <td class="text-no-wrap text-truncate" style="width: 140px; min-width: 140px; max-width: 140px;">{{ item.category || '-' }}</td>
              <td style="width: 320px; min-width: 320px; max-width: 320px; white-space: normal; word-break: break-word;" class="py-2 font-weight-regular">{{ item.name }}</td>
              <td class="text-right text-no-wrap font-weight-regular" style="width: 130px; min-width: 130px; max-width: 130px;">
                ${{ formatMoney(getItemDetails(item).totalPrice) }}
                <v-tooltip activator="parent" location="top">
                  Base Price: ${{ formatMoney(getItemDetails(item).basePrice) }} | Unit Price: ${{
                    formatMoney(getItemDetails(item).unitPrice) }}
                </v-tooltip>
              </td>
              <td class="text-no-wrap text-truncate" style="width: 130px; min-width: 130px; max-width: 130px;">{{ item.activity || '-' }}</td>
              <td class="text-no-wrap text-truncate" style="width: 130px; min-width: 130px; max-width: 130px;">{{ item.tradePartner || '-' }}</td>
              <td class="py-2" style="width: 280px; min-width: 280px; max-width: 280px;">
                <span>{{ item.desc ? (item.desc.length > 55 ? item.desc.substring(0, 55) + '...' : item.desc) : '-' }}</span>
                <v-tooltip v-if="item.desc" activator="parent" location="top" max-width="360">
                  {{ item.desc }}
                </v-tooltip>
              </td>
              <td class="text-center text-no-wrap" style="width: 100px; min-width: 100px; max-width: 100px;">
                <v-btn icon="mdi-pencil" variant="text" color="light-blue" size="small" @click="$emit('edit', item)"
                  title="Edit Line Item"></v-btn>
                <v-btn icon="mdi-delete" variant="text" color="red" size="small" @click="confirmDelete(item)"
                  title="Delete Line Item"></v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Pagination Footer -->
        <v-divider></v-divider>
        <v-row class="pa-4 align-center justify-space-between flex-wrap gap-2">
          <v-col cols="12" sm="4" class="text-caption text-medium-emphasis">
            Showing {{ filteredLineItems.length === 0 ? 0 : (page - 1) * itemsPerPage + 1 }} to
            {{ Math.min(page * itemsPerPage, filteredLineItems.length) }} of {{ filteredLineItems.length }} items
          </v-col>
          <v-col cols="12" sm="8" class="d-flex justify-end align-center">
            <v-pagination v-model="page" :length="totalPages" density="compact" total-visible="7" color="teal"
              class="my-0"></v-pagination>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="440" transition="dialog-bottom-transition">
      <v-card class="rounded-xl pa-2" elevation="10" border>
        <div class="d-flex align-center pa-4 pb-2">
          <v-avatar color="red-lighten-5" size="44" class="mr-3">
            <v-icon icon="mdi-delete-outline" color="red-darken-1" size="24"></v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-slate-800">Delete Line Item</div>
            <div class="text-caption text-medium-emphasis">This action cannot be undone</div>
          </div>
        </div>

        <v-card-text class="px-4 py-3 text-body-2 text-slate-700">
          Are you sure you want to delete <span class="font-weight-bold text-slate-900">"{{ lineItemToDelete?.name
            }}"</span> from the custom line items catalog?
        </v-card-text>

        <v-card-actions class="pa-4 pt-2 justify-end">
          <v-btn variant="tonal" color="grey-darken-1" density="comfortable" class="text-none px-4 rounded-lg mr-2"
            @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn color="red-darken-1" variant="flat" density="comfortable"
            class="text-none px-4 rounded-lg font-weight-medium" elevation="1" @click="executeDelete">
            Delete Item
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAppStore } from '@/stores/app';

const props = defineProps({
  lineItems: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['create', 'edit', 'delete']);

const appStore = useAppStore();
const search = ref('');
const filterRoom = ref('All');
const filterGroup = ref('All');
const deleteDialog = ref(false);
const lineItemToDelete = ref(null);

// Pagination
const page = ref(1);
const itemsPerPage = 10;

// Sorting
const sortBy = ref('name');
const sortDesc = ref(false);

const toggleSort = (key) => {
  if (sortBy.value === key) {
    sortDesc.value = !sortDesc.value;
  } else {
    sortBy.value = key;
    sortDesc.value = false;
  }
  page.value = 1;
};

const roomFilterOptions = computed(() => {
  const set = new Set();
  props.lineItems.forEach(item => {
    if (item.defaultRoom) set.add(item.defaultRoom);
  });
  return ['All', ...Array.from(set).sort()];
});

const groupFilterOptions = computed(() => {
  const set = new Set();
  props.lineItems.forEach(item => {
    if (item.group) set.add(item.group);
  });
  if (appStore.settings?.groups) {
    appStore.settings.groups.forEach(g => set.add(g));
  }
  return ['All', ...Array.from(set).sort()];
});

const filteredLineItems = computed(() => {
  return props.lineItems.filter(item => {
    // Room Filter
    if (filterRoom.value !== 'All' && item.defaultRoom !== filterRoom.value) {
      return false;
    }
    // Group Filter
    if (filterGroup.value !== 'All' && (item.group || 'General') !== filterGroup.value) {
      return false;
    }
    // Search filter
    if (!search.value) return true;
    const q = search.value.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.group && item.group.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.defaultRoom && item.defaultRoom.toLowerCase().includes(q)) ||
      (item.activity && item.activity.toLowerCase().includes(q)) ||
      (item.tradePartner && item.tradePartner.toLowerCase().includes(q)) ||
      (item.desc && item.desc.toLowerCase().includes(q)) ||
      (item.id && item.id.toLowerCase().includes(q))
    );
  });
});

const sortedLineItems = computed(() => {
  const list = [...filteredLineItems.value];
  if (!sortBy.value) return list;

  list.sort((a, b) => {
    let valA, valB;
    if (sortBy.value === 'totalPrice') {
      valA = getItemDetails(a).totalPrice || 0;
      valB = getItemDetails(b).totalPrice || 0;
    } else {
      valA = (a[sortBy.value] || '').toString().toLowerCase();
      valB = (b[sortBy.value] || '').toString().toLowerCase();
    }

    if (valA < valB) return sortDesc.value ? 1 : -1;
    if (valA > valB) return sortDesc.value ? -1 : 1;
    return 0;
  });

  return list;
});

const totalPages = computed(() => Math.ceil(sortedLineItems.value.length / itemsPerPage) || 1);

const paginatedLineItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  return sortedLineItems.value.slice(start, start + itemsPerPage);
});

watch([search, filterRoom, filterGroup], () => {
  page.value = 1;
});

const getItemDetails = (item) => {
  const q = parseFloat(item.totalOutputQty) || 1;
  let baseVal = 0;
  let unitVal = 0;
  let allowVal = 0;

  // Labor
  (item.laborRequired || []).forEach(req => {
    const role = appStore.getLaborById(req.classId) || { rate: req.rate || 0 };
    const rate = role.rate || 0;
    const b = (req.baseHours || 0) * rate;
    const u = (req.unitHours || 0) * rate;
    baseVal += b;
    unitVal += u;

    const mode = String(req.allowMode || 'NONE').toUpperCase();
    if (mode === 'BOTH') allowVal += b + u;
    else if (mode === 'UNIT' || mode === 'ONLY UNIT HR') allowVal += u;
    else if (mode === 'BASE' || mode === 'ONLY BASE HR') allowVal += b;
  });

  // Materials
  (item.materialRequired || []).forEach(req => {
    const mat = appStore.getMaterialById(req.materialId) || { netPrice: req.price || 0, tax: req.tax || 0.25 };
    const price = mat.netPrice * (1 + (mat.tax !== undefined ? mat.tax : 0.25)) * 1.25;
    const val = (req.qty || 0) * price;
    if (req.base) baseVal += val;
    else unitVal += val;

    const allowPct = mat.allowance !== undefined ? mat.allowance : (req.allowance || 0);
    if (req.allow) allowVal += val * allowPct;
  });

  // Equipment
  (item.equipmentRequired || []).forEach(req => {
    const eq = appStore.getEquipmentById(req.equipmentId) || { netPrice: req.price || 0, tax: req.tax || 0.25 };
    const price = eq.netPrice * (1 + (eq.tax !== undefined ? eq.tax : 0.25)) * 1.25;
    const val = (req.qty || 0) * price;
    if (req.base) baseVal += val;
    else unitVal += val;

    const allowPct = eq.allowance !== undefined ? eq.allowance : (req.allowance || 0);
    if (req.allow) allowVal += val * allowPct;
  });

  const unitP = q > 0 ? unitVal / q : 0;
  return {
    basePrice: baseVal,
    unitPrice: unitP,
    totalPrice: baseVal + unitP,
    allowance: q > 0 ? allowVal / q : 0
  };
};

const formatMoney = (val) => {
  return (parseFloat(val) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

const confirmDelete = (item) => {
  lineItemToDelete.value = item;
  deleteDialog.value = true;
};

const executeDelete = () => {
  if (lineItemToDelete.value) {
    emit('delete', lineItemToDelete.value);
    deleteDialog.value = false;
    lineItemToDelete.value = null;
  }
};
</script>

<style scoped>
.line-items-table {
  table-layout: fixed !important;
  width: 100%;
}

.line-items-table th,
.line-items-table td {
  padding-left: 12px !important;
  padding-right: 12px !important;
  height: 60px !important;
  overflow: hidden;
}

.line-items-table tr {
  height: 60px !important;
}
</style>
