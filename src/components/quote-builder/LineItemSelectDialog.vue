<template>
  <v-dialog :model-value="modelValue" max-width="700px" scrollable
    @update:model-value="val => emit('update:modelValue', val)">
    <v-card border elevation="4" class="rounded-lg">
      <v-card-title class="d-flex align-center justify-space-between bg-teal pa-4 text-white">
        <span class="text-h6 font-weight-medium">Add Line Items to {{ targetRoomName }}</span>
        <v-btn icon="mdi-close" variant="text" color="white" density="compact"
          @click="emit('update:modelValue', false)" />
      </v-card-title>

      <v-tabs v-model="dialogTab" color="teal" align-tabs="center">
        <v-tab value="catalog">Search Master Catalog</v-tab>
        <v-tab value="custom">Add Custom Line Item</v-tab>
      </v-tabs>

      <v-card-text class="pa-4">
        <v-window v-model="dialogTab">
          <!-- Tab 1: Catalog Search & Multi-Select (Category Ignored) -->
          <v-window-item value="catalog">
            <div class="d-flex align-center ga-2 mb-3">
              <v-text-field v-model="catalogSearch" label="Search catalog items..." prepend-inner-icon="mdi-magnify"
                variant="outlined" density="compact" hide-details clearable class="flex-grow-1" />
              <v-btn v-if="selectedCatalogItemIds.length" size="small" variant="text" color="teal" class="text-none"
                @click="selectedCatalogItemIds = []">
                Clear ({{ selectedCatalogItemIds.length }})
              </v-btn>
            </div>

            <v-card border elevation="0" class="rounded-lg overflow-hidden">
              <div style="max-height: 340px; overflow-y: auto;">
                <v-list density="compact">
                  <v-list-item v-for="catItem in filteredCatalogItems" :key="catItem.id"
                    class="border-b py-2 cursor-pointer" :active="selectedCatalogItemIds.includes(catItem.id)"
                    color="teal" @click="toggleCatalogItemSelection(catItem.id)">
                    <template #prepend>
                      <v-checkbox-btn :model-value="selectedCatalogItemIds.includes(catItem.id)" color="teal"
                        density="compact" />
                    </template>

                    <template #title>
                      <span class="text-body-2 font-weight-regular text-slate-800">{{ catItem.name }}</span>
                    </template>

                    <template #append>
                      <v-chip size="x-small" color="teal" variant="tonal" class="font-weight-medium">
                        {{ catItem.unitType || 'each' }}
                      </v-chip>
                    </template>
                  </v-list-item>

                  <v-list-item v-if="filteredCatalogItems.length === 0">
                    <div class="text-center py-6 text-medium-emphasis">
                      <v-icon icon="mdi-file-search-outline" size="32" class="mb-2" />
                      <div>No matching catalog items found.</div>
                    </div>
                  </v-list-item>
                </v-list>
              </div>
            </v-card>
          </v-window-item>

          <!-- Tab 2: Add Custom Item -->
          <v-window-item value="custom">
            <v-row density="compact" class="pt-2">
              <v-col cols="12">
                <v-text-field v-model="customName" label="Item Name / Description *" variant="outlined"
                  density="compact" placeholder="e.g. Paint trim" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="customQty" type="number" min="1" label="Qty *" variant="outlined"
                  density="compact" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="customUnit" label="Unit" variant="outlined" density="compact"
                  placeholder="each" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model.number="customUnitPrice" type="number" min="0" step="0.01" label="Unit Price ($)"
                  prefix="$" variant="outlined" density="compact" />
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-3 justify-space-between align-center bg-grey-lighten-4">
        <div class="text-caption text-medium-emphasis ms-2">
          <span v-if="dialogTab === 'catalog'">
            Selected: <strong>{{ selectedCatalogItemIds.length }}</strong> line item(s)
          </span>
        </div>

        <div class="d-flex align-center ga-2">
          <v-btn variant="outlined" color="grey" class="text-none"
            @click="emit('update:modelValue', false)">Cancel</v-btn>
          <v-btn v-if="dialogTab === 'catalog'" color="teal" class="text-none font-weight-medium"
            :disabled="selectedCatalogItemIds.length === 0" @click="addSelectedCatalogItems">
            Add Selected Items ({{ selectedCatalogItemIds.length }})
          </v-btn>
          <v-btn v-if="dialogTab === 'custom'" color="teal" class="text-none font-weight-medium"
            @click="saveCustomItem">
            Add Custom Item
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  targetRoomName: { type: String, default: 'General' }
})

const emit = defineEmits(['update:modelValue', 'add-items'])
const appStore = useAppStore()

const dialogTab = ref('catalog')
const catalogSearch = ref('')
const selectedCatalogItemIds = ref([])
const customName = ref('')
const customQty = ref(1)
const customUnit = ref('each')
const customUnitPrice = ref(0)

watch(() => props.modelValue, (val) => {
  if (val) {
    dialogTab.value = 'catalog'
    catalogSearch.value = ''
    selectedCatalogItemIds.value = []
    customName.value = ''
    customQty.value = 1
    customUnit.value = 'each'
    customUnitPrice.value = 0
  }
})

const filteredCatalogItems = computed(() => {
  const list = appStore.lineItems || []
  // if (!catalogSearch.value) return list.slice(0, 30)
  const q = catalogSearch.value.toLowerCase().trim()
  return list.filter(item =>
    item.name && item.name.toLowerCase().includes(q)
  ) //.slice(0, 30)
})

const toggleCatalogItemSelection = (id) => {
  const idx = selectedCatalogItemIds.value.indexOf(id)
  if (idx > -1) {
    selectedCatalogItemIds.value.splice(idx, 1)
  } else {
    selectedCatalogItemIds.value.push(id)
  }
}

const addSelectedCatalogItems = () => {
  if (!selectedCatalogItemIds.value.length) return

  const itemsToAdd = []
  selectedCatalogItemIds.value.forEach(catId => {
    const catItem = appStore.lineItems?.find(a => a.id === catId)
    if (catItem) {
      itemsToAdd.push({
        id: `${catItem.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: catItem.name,
        category: catItem.category || catItem.group || 'General',
        assignedRoom: props.targetRoomName,
        quantity: parseFloat(catItem.totalOutputQty) || 1,
        unit: catItem.unitType || 'each',
        rawlineItems: catItem
      })
    }
  })

  emit('add-items', itemsToAdd)
  emit('update:modelValue', false)
}

const saveCustomItem = () => {
  if (!customName.value.trim()) return

  const newItem = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: customName.value.trim(),
    category: 'General',
    assignedRoom: props.targetRoomName,
    quantity: customQty.value || 1,
    unit: customUnit.value || 'each',
    rawlineItems: {
      laborRequired: [],
      materialRequired: [{ price: customUnitPrice.value || 0, qty: 1, base: false }]
    }
  }

  emit('add-items', [newItem])
  emit('update:modelValue', false)
}
</script>
