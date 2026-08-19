<template>
  <v-card class="mb-4" border elevation="0">
    <v-card-title class="text-subtitle-1 font-weight-regular text-medium-emphasis">
      Line Item Settings
    </v-card-title>
    <v-card-text class="pa-4">
      <v-row class="custom-form-row">
        <v-col cols="12" sm="6" md="6">
          <v-text-field v-model="form.name" label="Line Item Proposal Name *" variant="outlined" density="compact"
            hide-details="auto"
            :rules="[v => (v && v.trim().length > 0) || 'Proposal Name is mandatory']"></v-text-field>
        </v-col>
        <v-col cols="12" sm="3" md="3">
          <v-combobox v-model="form.category" label="Category *" :items="categories" variant="outlined" density="compact"
            hide-details="auto"
            :rules="[v => (v && String(v).trim().length > 0) || 'Category is mandatory']"></v-combobox>
        </v-col>
        <v-col cols="12" sm="3" md="3">
          <v-combobox v-model="form.group" label="Group *" :items="appStore.settings.groups || []" variant="outlined"
            density="compact" hide-details="auto"
            :rules="[v => (v && String(v).trim().length > 0) || 'Group is mandatory']"></v-combobox>
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="form.desc" label="Description / Scope of Work" variant="outlined" density="compact"
            rows="2" hide-details="auto"></v-textarea>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select v-model="form.activity" label="Activity Type" :items="appStore.settings.activities"
            variant="outlined" density="compact" hide-details="auto"></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-select v-model="form.acctCode" label="Accounting Code" :items="appStore.settings.acctCodes"
            variant="outlined" density="compact" hide-details="auto"></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-select v-model="form.unitType" label="Billing Unit Type" :items="appStore.settings.unitTypes"
            variant="outlined" density="compact" hide-details="auto"></v-select>
        </v-col>
        <v-col cols="12" sm="4" md="2">
          <v-text-field v-model.number="form.defaultQty" type="number" label="Default Qty in Quote" variant="outlined"
            density="compact" hide-details="auto"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-autocomplete v-model="form.defaultRoom" label="Default Room" :items="filteredRoomOptions"
            item-title="title" item-value="value" :return-object="false" variant="outlined" density="compact"
            hide-details="auto" auto-select-first :menu-props="{ maxHeight: 360 }">
            <template #prepend-item>
              <div class="border-b bg-grey-lighten-5 px-1 py-1 position-sticky top-0 style-z-top">
                <v-tabs v-model="activeRoomCategory" color="teal" density="compact" show-arrows>
                  <v-tab v-for="cat in roomCategories" :key="cat" :value="cat" size="small"
                    class="text-caption font-weight-medium text-none px-3">
                    {{ cat }}
                  </v-tab>
                </v-tabs>
              </div>
            </template>
            <template #selection="{ item }"><span>{{ getSelectedRoomCode(item) }}</span></template>
          </v-autocomplete>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select v-model="form.tradePartner" label="Trade Partner" :items="appStore.settings.trades"
            variant="outlined" density="compact" hide-details="auto"></v-select>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-text-field v-model="form.url" label="Product Link" variant="outlined" density="compact" hide-details="auto"
            :append-inner-icon="form.url ? 'mdi-open-in-new' : undefined" @click:append-inner="openUrl"></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="2">
          <v-text-field v-model="form.tag" label="Reporting Tag" variant="outlined" density="compact"
            hide-details="auto"></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppStore } from '@/stores/app';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

const appStore = useAppStore();

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const activeRoomCategory = ref('All');

const roomCategories = computed(() => {
  if (!appStore.settings?.rooms) return ['All'];
  const cats = new Set(appStore.settings.rooms.map(r => r.category || 'General'));
  return ['All', ...Array.from(cats).sort()];
});

const filteredRoomOptions = computed(() => {
  if (!appStore.settings?.rooms) return [];

  const rawRooms = appStore.settings.rooms;
  const filtered = activeRoomCategory.value === 'All'
    ? rawRooms
    : rawRooms.filter(r => (r.category || 'General') === activeRoomCategory.value);

  return filtered.map(r => {
    const hasCode = r.code && r.code !== '—' && r.code !== '-';
    return {
      title: hasCode ? `${r.code} - ${r.description}` : r.description,
      value: r.code || r.description,
      code: r.code || r.description,
      category: r.category || 'General'
    };
  });
});

const getSelectedRoomCode = (item) => {
  if (!item) return '';
  let str = '';
  if (typeof item === 'object') {
    if (item.raw) str = item.raw.code || item.raw.value || item.raw.title || '';
    else if (item.code) str = item.code;
    else if (item.value) str = item.value;
    else if (item.title) str = item.title;
  } else {
    str = String(item);
  }
  return String(str).trim();
};

const openUrl = () => {
  if (form.value.url) {
    let target = form.value.url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    window.open(target, '_blank');
  }
};
</script>

<style scoped>
.style-z-top {
  z-index: 5;
}

.custom-form-row> :deep(.v-col) {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}
</style>
