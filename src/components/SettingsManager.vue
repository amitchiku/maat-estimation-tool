<template>
  <div>
    <!-- Page Header -->
    <v-row class="mb-2 align-center">
      <v-col cols="12">
        <!-- <span class="text-body-1 font-weight-medium text-medium-emphasis">Estimating Settings</span> -->
      </v-col>
    </v-row>

    <v-row>
      <!-- Configuration List Selection -->
      <v-col cols="12" md="3">
        <v-card border elevation="0">
          <v-list density="compact" nav>
            <v-list-item v-for="opt in listOptions" :key="opt.key" :title="opt.label"
              :active="activeSettingKey === opt.key" color="teal" class="rounded mb-1" @click="onTabClick(opt.key)">
              <template v-slot:prepend>
                <v-icon :icon="opt.icon"></v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Active Setting Grid -->
      <v-col cols="12" md="9">
        <v-card border elevation="0">
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <span class="font-weight-bold text-teal-darken-2">Manage {{ activeSettingLabel }}</span>
            <v-btn
              v-if="activeSettingKey !== 'defaults' && activeSettingKey !== 'companyHeader'"
              prepend-icon="mdi-plus" color="teal" size="small" class="glow-btn" @click="openAddDialog">
              Add {{ activeSettingSingular }}
            </v-btn>
          </v-card-title>

          <v-card-text class="pa-4 pt-0">
            <!-- Company & Prepared By Header Settings -->
            <div v-if="activeSettingKey === 'companyHeader'" class="pa-2">
              <v-row density="compact">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="appStore.settings.companyHeader.companyName"
                    label="Company Name"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="appStore.settings.companyHeader.mhic"
                    label="License / MHIC #"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="appStore.settings.companyHeader.address"
                    label="Company Address (Rich Text / Multiline)"
                    variant="outlined"
                    density="compact"
                    rows="3"
                    hint="e.g. 4427 Chestnut La. Rockville, MD 20853"
                    persistent-hint
                    class="mb-2"
                  ></v-textarea>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="appStore.settings.companyHeader.phone"
                    label="Company Main Phone"
                    variant="outlined"
                    density="compact"
                    class="mb-2"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-divider class="my-4"></v-divider>
              <div class="text-subtitle-2 font-weight-bold mb-3 text-teal">Prepared By Configuration</div>

              <v-row density="compact">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="appStore.settings.preparedBy.name"
                    label="Prepared By Name"
                    variant="outlined"
                    density="compact"
                    placeholder="e.g. M. Webb"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="appStore.settings.preparedBy.phone"
                    label="Prepared By Direct Phone"
                    variant="outlined"
                    density="compact"
                    placeholder="e.g. (301) 252-1355"
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>

            <!-- Rooms Custom Grouped Layout -->
            <div v-else-if="activeSettingKey === 'rooms'">
              <div v-if="activeList.length === 0" class="text-center py-6 text-medium-emphasis border rounded">
                No rooms found.
              </div>
              <div v-else>
                <v-row class="no-gutters">
                  <!-- Rooms List (Left Sub-sidebar Panel) -->
                  <v-col cols="12" sm="4" md="3" class="pr-4">
                    <div class="category-panel pa-2">
                      <v-list density="compact" nav class="bg-transparent pa-0">
                        <v-list-item v-for="cat in roomCategories" :key="cat" :active="selectedRoomCategory === cat"
                          color="teal" class="mb-1" @click="selectedRoomCategory = cat">
                          <v-list-item-title class="text-body-2">{{ cat }}</v-list-item-title>
                          <template v-slot:append>
                            <span class="text-caption text-medium-emphasis ml-2">
                              {{ groupedRooms[cat]?.length || 0 }}
                            </span>
                          </template>
                        </v-list-item>
                      </v-list>
                    </div>
                  </v-col>

                  <!-- Selected Room Codes Table (Right side) -->
                  <v-col cols="12" sm="8" md="9">
                    <table class="subtle-table">
                      <thead>
                        <tr>
                          <th class="text-left">Code</th>
                          <th class="text-left">Description</th>
                          <th class="text-center" style="width: 120px;">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-if="!groupedRooms[selectedRoomCategory] || groupedRooms[selectedRoomCategory].length === 0">
                          <td colspan="3" class="text-center py-6 text-medium-emphasis">No codes in this room.</td>
                        </tr>
                        <tr v-for="item in groupedRooms[selectedRoomCategory]" :key="item.code">
                          <td class="font-weight-regular">{{ item.code }}</td>
                          <td>{{ item.description }}</td>
                          <td class="text-center">
                            <v-btn icon="mdi-pencil" variant="text" color="blue-grey" size="small"
                              @click="openEditRoomDialog(item)"></v-btn>
                            <v-btn icon="mdi-delete" variant="text" color="red-lighten-2" size="small"
                              @click="deleteRoomItem(item)"></v-btn>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </v-col>
                </v-row>
              </div>
            </div>

            <!-- Defaults Panel -->
            <div v-else-if="activeSettingKey === 'defaults'">
              <table class="subtle-table">
                <thead>
                  <tr>
                    <th class="text-left">Setting</th>
                    <th class="text-left" style="width: 180px;">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Default Material Tax</td>
                    <td>
                      <v-text-field
                        v-model.number="appStore.settings.defaults.materialTax"
                        type="number"
                        suffix="%"
                        variant="outlined"
                        density="compact"
                        hide-details
                        @change="saveDefaults"
                      ></v-text-field>
                    </td>
                  </tr>
                  <tr>
                    <td>Default Material Mark Up</td>
                    <td>
                      <v-text-field
                        v-model.number="appStore.settings.defaults.materialMarkup"
                        type="number"
                        suffix="%"
                        variant="outlined"
                        density="compact"
                        hide-details
                        @change="saveDefaults"
                      ></v-text-field>
                    </td>
                  </tr>
                  <tr>
                    <td>Default Equipment Tax</td>
                    <td>
                      <v-text-field
                        v-model.number="appStore.settings.defaults.equipmentTax"
                        type="number"
                        suffix="%"
                        variant="outlined"
                        density="compact"
                        hide-details
                        @change="saveDefaults"
                      ></v-text-field>
                    </td>
                  </tr>
                  <tr>
                    <td>Default Equipment Mark Up</td>
                    <td>
                      <v-text-field
                        v-model.number="appStore.settings.defaults.equipmentMarkup"
                        type="number"
                        suffix="%"
                        variant="outlined"
                        density="compact"
                        hide-details
                        @change="saveDefaults"
                      ></v-text-field>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="mt-3 text-caption text-grey-darken-1 font-italic">
                * Note: Changing these default settings does not change existing line items.
              </div>
            </div>

            <!-- Standard Flat List Layout -->
            <div v-else>
              <!-- Entries List Table -->
              <table class="subtle-table">
                <thead>
                  <tr>
                    <th class="text-left">Value / Entry</th>
                    <th class="text-center" style="width: 120px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="activeList.length === 0">
                    <td colspan="2" class="text-center py-6 text-medium-emphasis">No entries found.</td>
                  </tr>
                  <tr v-for="(item, idx) in activeList" :key="idx">
                    <td class="font-weight-regular">{{ item }}</td>
                    <td class="text-center">
                      <v-btn icon="mdi-pencil" variant="text" color="blue" size="small"
                        @click="openEditSettingDialog(item, idx)"></v-btn>
                      <v-btn icon="mdi-delete" variant="text" color="red" size="small"
                        @click="deleteSettingEntry(idx)"></v-btn>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog Modal for Adding / Editing Lookup Entries -->
    <v-dialog v-model="dialogVisible" max-width="500" transition="dialog-bottom-transition">
      <v-card class="rounded-xl pa-2" elevation="10" border>
        <div class="d-flex align-center pa-4 pb-2">
          <v-avatar color="teal-lighten-5" size="44" class="mr-3">
            <v-icon :icon="isEditing ? 'mdi-pencil-outline' : 'mdi-plus-box-outline'" color="teal" size="24"></v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-slate-800">
              {{ isEditing ? 'Edit ' + activeSettingSingular : 'Add ' + activeSettingSingular }}
            </div>
            <div class="text-caption text-medium-emphasis">Configure lookup value for {{ activeSettingSingular }}</div>
          </div>
        </div>

        <v-card-text class="px-4 py-2">
          <!-- Room fields -->
          <div v-if="activeSettingKey === 'rooms'">
            <v-combobox v-model="newRoom.category" label="Category / Room Type" :items="appStore.settings.categories"
              variant="outlined" density="compact" class="mb-3" hint="Select an existing Room type or type a new one"
              persistent-hint></v-combobox>
            <v-text-field v-model="newRoom.code" label="Code" placeholder="e.g. PBA" variant="outlined"
              density="compact" class="mb-3"></v-text-field>
            <v-text-field v-model="newRoom.description" label="Description / Short Desc"
              placeholder="e.g. Primary Bathroom" variant="outlined" density="compact" class="mb-1" autofocus
              @keyup.enter="saveEntry"></v-text-field>
          </div>

          <!-- Flat strings field -->
          <div v-else>
            <v-text-field v-model="newEntry" :label="activeSettingSingular + ' Value'" variant="outlined"
              density="compact" class="mb-1" autofocus @keyup.enter="saveEntry"></v-text-field>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 pt-2 justify-end">
          <v-btn variant="tonal" color="grey-darken-1" density="comfortable" class="text-none px-4 rounded-lg mr-2" @click="dialogVisible = false">Cancel</v-btn>
          <v-btn
            color="teal"
            variant="flat"
            density="comfortable"
            class="text-none px-4 rounded-lg font-weight-medium"
            elevation="1"
            :disabled="activeSettingKey === 'rooms' ? (!newRoom.description.trim() || !newRoom.category.trim()) : !newEntry.trim()"
            @click="saveEntry"
          >
            Save Entry
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

const activeSettingKey = ref('rooms');
const dialogVisible = ref(false);
const isEditing = ref(false);

const newEntry = ref('');
const editingEntryIndex = ref(null);

const editingRoom = ref(null);
const selectedRoomCategory = ref('Kitchen');
const newRoom = ref({
  category: '',
  code: '',
  description: ''
});

const listOptions = [
  { key: 'companyHeader', label: 'Company Header & Prepared By', singular: 'Header Detail', icon: 'mdi-card-account-details-outline' },
  { key: 'groups', label: 'Line Item Groups', singular: 'Group', icon: 'mdi-folder-account-outline' },
  { key: 'rooms', label: 'Rooms', singular: 'Room', icon: 'mdi-home-outline' },
  { key: 'trades', label: 'Trades', singular: 'Trade', icon: 'mdi-briefcase-outline' },
  { key: 'categories', label: 'Categories', singular: 'Category', icon: 'mdi-folder-open-outline' },
  { key: 'activities', label: 'Activities', singular: 'Activity', icon: 'mdi-play-circle-outline' },
  { key: 'unitTypes', label: 'Unit Types', singular: 'Unit Type', icon: 'mdi-ruler-square' },
  { key: 'acctCodes', label: 'Account Codes', singular: 'Account Code', icon: 'mdi-barcode' },
  { key: 'costTypes', label: 'Cost Types', singular: 'Cost Type', icon: 'mdi-currency-usd' },
  { key: 'defaults', label: 'Defaults', singular: 'Default', icon: 'mdi-tune-variant' }
];

const activeSettingLabel = computed(() => {
  return listOptions.find(o => o.key === activeSettingKey.value)?.label || '';
});

const activeSettingSingular = computed(() => {
  return listOptions.find(o => o.key === activeSettingKey.value)?.singular || '';
});

const activeList = computed(() => {
  if (!appStore.settings) return [];
  return appStore.settings[activeSettingKey.value] || [];
});

const groupedRooms = computed(() => {
  const rooms = appStore.settings?.rooms || [];
  const groups = {};
  rooms.forEach(r => {
    if (!groups[r.category]) {
      groups[r.category] = [];
    }
    groups[r.category].push(r);
  });
  return groups;
});

const roomCategories = computed(() => {
  return Object.keys(groupedRooms.value).sort();
});

watch(roomCategories, (newCats) => {
  if (newCats.length > 0 && !newCats.includes(selectedRoomCategory.value)) {
    selectedRoomCategory.value = newCats[0];
  }
}, { immediate: true });

const onTabClick = (key) => {
  activeSettingKey.value = key;
  dialogVisible.value = false;
};

const openAddDialog = () => {
  isEditing.value = false;
  editingRoom.value = null;
  editingEntryIndex.value = null;
  newEntry.value = '';
  newRoom.value = {
    category: selectedRoomCategory.value || appStore.settings?.categories[0] || 'Kitchen',
    code: '',
    description: ''
  };
  dialogVisible.value = true;
};

const openEditSettingDialog = (item, index) => {
  isEditing.value = true;
  editingEntryIndex.value = index;
  newEntry.value = item;
  dialogVisible.value = true;
};

const openEditRoomDialog = (item) => {
  isEditing.value = true;
  editingRoom.value = item;
  newRoom.value = {
    category: item.category,
    code: item.code === '—' ? '' : item.code,
    description: item.description
  };
  dialogVisible.value = true;
};

const saveEntry = async () => {
  if (activeSettingKey.value === 'rooms') {
    if (!newRoom.value.description.trim() || !newRoom.value.category.trim()) return;
    const catVal = newRoom.value.category.trim();
    const codeVal = newRoom.value.code.trim() || catVal;
    const descVal = newRoom.value.description.trim();

    if (editingRoom.value !== null) {
      // Edit mode
      const idx = appStore.settings.rooms.findIndex(r => r === editingRoom.value);
      if (idx !== -1) {
        appStore.settings.rooms[idx] = {
          category: catVal,
          code: codeVal,
          description: descVal
        };
      }
      selectedRoomCategory.value = catVal;
    } else {
      // Add mode
      const catExists = appStore.settings.categories.some(c => c.toLowerCase() === catVal.toLowerCase());
      if (!catExists) {
        // Automatically add to category list if new
        appStore.settings.categories.push(catVal);

        // Add 2 items: 1 with category name as code, 1 with entered code
        appStore.settings.rooms.push({
          category: catVal,
          code: catVal,
          description: descVal
        });

        if (codeVal.toLowerCase() !== catVal.toLowerCase()) {
          appStore.settings.rooms.push({
            category: catVal,
            code: codeVal,
            description: descVal
          });
        }
      } else {
        // Just add single room/code
        const exists = appStore.settings.rooms.some(r => r.category.toLowerCase() === catVal.toLowerCase() && r.code.toLowerCase() === codeVal.toLowerCase());
        if (!exists) {
          appStore.settings.rooms.push({
            category: catVal,
            code: codeVal,
            description: descVal
          });
        }
      }
      selectedRoomCategory.value = catVal;
    }
  } else {
    if (!newEntry.value.trim()) return;
    const value = newEntry.value.trim();

    if (editingEntryIndex.value !== null) {
      // Edit mode
      activeList.value[editingEntryIndex.value] = value;
    } else {
      // Add mode
      if (activeList.value.includes(value)) return;
      activeList.value.push(value);
    }
  }

  try {
    await appStore.saveCatalog();
    dialogVisible.value = false;
  } catch (err) {
    appStore.error = `Error saving settings: ${err.message}`;
  }
};

const saveDefaults = async () => {
  try {
    await appStore.saveCatalog();
  } catch (err) {
    appStore.error = `Error saving defaults: ${err.message}`;
  }
};

const deleteRoomItem = async (item) => {
  appStore.settings.rooms = appStore.settings.rooms.filter(r => r !== item);
  try {
    await appStore.saveCatalog();
  } catch (err) {
    appStore.error = `Error deleting room: ${err.message}`;
  }
};

const deleteSettingEntry = async (index) => {
  activeList.value.splice(index, 1);
  try {
    await appStore.saveCatalog();
    editingRoom.value = null;
    editingEntryIndex.value = null;
  } catch (err) {
    appStore.error = `Error deleting settings entry: ${err.message}`;
  }
};
</script>

<style scoped>
.category-panel {
  background-color: #f8fafc;
  border-radius: 8px;
  height: 100%;
}

.subtle-table {
  border-collapse: collapse;
  width: 100%;
}

.subtle-table th {
  font-size: 0.75rem !important;
  /* text-xs */
  font-weight: 600 !important;
  /* font-semibold */
  text-transform: uppercase !important;
  /* uppercase */
  letter-spacing: 0.05em !important;
  /* tracking-wider */
  color: #9ca3af !important;
  /* text-gray-400 */
  border-bottom: 1px solid #f3f4f6 !important;
  /* border-gray-100 subtle line under headers */
  padding: 10px 16px !important;
}

.subtle-table td {
  padding: 10px 16px !important;
  /* generous vertical padding */
  border-bottom: none !important;
  /* drop solid horizontal lines under rows */
  font-size: 0.875rem;
}

.subtle-table tbody tr {
  transition: background-color 0.2s ease;
}

.subtle-table tbody tr:hover {
  background-color: #f9fafb !important;
  /* subtle hover highlight */
}
</style>
