<template>
  <v-card border elevation="0" class="rounded-xl pa-3">
    <!-- Quick Group Selection Chips -->
    <div class="d-flex align-center flex-wrap ga-2 mb-4">
      <div class="text-caption font-weight-medium text-medium-emphasis mr-1">
        Quick Group Filter:
      </div>
      <v-chip
        v-for="grp in groupCards"
        :key="grp.name"
        size="small"
        :color="grp.allSelected ? 'teal' : (grp.partiallySelected ? 'teal-darken-2' : 'grey-darken-1')"
        :variant="grp.allSelected || grp.partiallySelected ? 'flat' : 'outlined'"
        class="cursor-pointer font-weight-medium"
        @click="toggleGroup(grp.name)"
      >
        <v-icon
          v-if="grp.allSelected"
          icon="mdi-check"
          size="14"
          class="mr-1"
        />
        <v-icon
          v-else-if="grp.partiallySelected"
          icon="mdi-minus"
          size="14"
          class="mr-1"
        />
        {{ grp.name }}
        <span class="ml-1 opacity-70">({{ grp.selectedCount }}/{{ grp.totalCount }})</span>
      </v-chip>
    </div>

    <!-- Search & Filter Controls -->
    <v-row density="compact" class="mb-3">
      <v-col cols="12" sm="8">
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify"
          label="Search Line Items by Name, Group, Room..." variant="outlined" density="compact" hide-details
          clearable />
      </v-col>

      <v-col cols="12" sm="2">
        <v-select v-model="filterGroup" label="Filter by Group" :items="groupOptions" variant="outlined"
          density="compact" hide-details />
      </v-col>

      <v-col cols="12" sm="2">
        <v-select v-model="filterCategory" label="Filter by Category" :items="categoryOptions" variant="outlined"
          density="compact" hide-details />
      </v-col>
    </v-row>

    <!-- Line Items Table -->
    <v-card border elevation="0" class="rounded-lg overflow-hidden mb-3">
      <v-table density="compact" class="items-select-table">
        <thead>
          <tr>
            <th class="text-center" style="width:50px">Select</th>
            <th class="font-weight-bold">Item Name</th>
            <th class="font-weight-bold">Default Room</th>
            <th class="font-weight-bold text-right">Unit Price</th>
            <th class="font-weight-bold text-center" style="width:140px">Quantity</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="filteredlineItems.length === 0">
            <td colspan="5" class="text-center py-6 text-medium-emphasis">
              No matching line items found.
            </td>
          </tr>

          <tr v-for="item in paginatedlineItems" :key="item.id" :class="{ 'bg-teal-lighten-5': isSelected(item.id) }">
            <td class="text-center">
              <v-checkbox-btn :model-value="isSelected(item.id)" color="teal" density="compact"
                @update:model-value="toggleItem(item)" />
            </td>

            <td class="font-weight-regular">{{ item.name }}</td>

            <td class="text-medium-emphasis">{{ item.defaultRoom || '-' }}</td>

            <td class="text-right font-weight-regular">
              ${{ formatMoney(getItemUnitPrice(item)) }}
            </td>

            <td class="text-center py-1">
              <v-text-field :model-value="getItemQuantity(item.id)" type="number" min="1" variant="outlined"
                density="compact" hide-details class="qty-field mx-auto" :disabled="!isSelected(item.id)"
                @update:model-value="val => updateItemQuantity(item, val)" />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Table Pagination Footer -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 pt-1 px-1">
      <div class="text-caption text-medium-emphasis">
        Showing {{ pageStartItem }} - {{ pageEndItem }} of {{ filteredlineItems.length }} items
        <span v-if="selectedItemsCount > 0" class="ml-2 text-teal font-weight-regular">
          ({{ selectedItemsCount }} selected)
        </span>
      </div>

      <v-pagination
        v-if="totalPages > 1"
        v-model="page"
        :length="totalPages"
        total-visible="5"
        density="compact"
        color="teal"
      />
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  selectedItemsMap: { type: Object, required: true }
})

const emit = defineEmits(['update:selectedItemsMap'])
const appStore = useAppStore()
const search = ref('')
const filterGroup = ref('All')
const filterCategory = ref('All')

// Pagination State
const page = ref(1)
const itemsPerPage = 10

onMounted(() => {
  if (!appStore.lineItems || appStore.lineItems.length === 0) {
    appStore.loadCatalog()
  }
})

// Reset pagination when search or filters change
watch([search, filterGroup, filterCategory], () => {
  page.value = 1
})

const alllineItems = computed(() => (appStore.lineItems && appStore.lineItems.length) ? appStore.lineItems : (appStore.lineItems || []))

const groupOptions = computed(() => {
  const set = new Set()
  alllineItems.value.forEach(a => { if (a.group) set.add(a.group) })
  if (appStore.settings?.groups) appStore.settings.groups.forEach(g => set.add(g))
  return ['All', ...Array.from(set).sort()]
})

const categoryOptions = computed(() => {
  const set = new Set()
  alllineItems.value.forEach(a => { if (a.category) set.add(a.category) })
  return ['All', ...Array.from(set).sort()]
})

const filteredlineItems = computed(() => alllineItems.value.filter(item => {
  if (filterGroup.value !== 'All' && (item.group) !== filterGroup.value) return false
  if (filterCategory.value !== 'All' && (item.category) !== filterCategory.value) return false
  if (!search.value) return true

  const q = search.value.toLowerCase().trim()
  return (
    (item.name && item.name.toLowerCase().includes(q)) ||
    (item.group && item.group.toLowerCase().includes(q)) ||
    (item.category && item.category.toLowerCase().includes(q)) ||
    (item.defaultRoom && item.defaultRoom.toLowerCase().includes(q)) ||
    (item.activity && item.activity.toLowerCase().includes(q)) ||
    (item.tradePartner && item.tradePartner.toLowerCase().includes(q)) ||
    (item.desc && item.desc.toLowerCase().includes(q)) ||
    (item.id && item.id.toLowerCase().includes(q))
  )
}))

const totalPages = computed(() => Math.ceil(filteredlineItems.value.length / itemsPerPage) || 1)

const paginatedlineItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filteredlineItems.value.slice(start, start + itemsPerPage)
})

const pageStartItem = computed(() => filteredlineItems.value.length === 0 ? 0 : (page.value - 1) * itemsPerPage + 1)
const pageEndItem = computed(() => Math.min(page.value * itemsPerPage, filteredlineItems.value.length))

const groupCards = computed(() => {
  const map = {}

  alllineItems.value.forEach(item => {
    const grp = item.group
    if (!grp) return
    if (!map[grp]) map[grp] = { total: 0, selected: 0 }
    map[grp].total++
    if (props.selectedItemsMap[item.id]) map[grp].selected++
  })

  return Object.keys(map).sort().map(grpName => {
    const { total, selected } = map[grpName]
    return {
      name: grpName,
      totalCount: total,
      selectedCount: selected,
      allSelected: total > 0 && selected === total,
      partiallySelected: selected > 0 && selected < total
    }
  })
})

const selectedItemsCount = computed(() => Object.keys(props.selectedItemsMap).length)

const isSelected = id => !!props.selectedItemsMap[id]
const getItemQuantity = id => props.selectedItemsMap[id]?.quantity

const toggleItem = item => {
  const next = { ...props.selectedItemsMap }

  if (next[item.id]) {
    delete next[item.id]
  } else {
    next[item.id] = {
      id: item.id,
      name: item.name,
      group: item.group,
      category: item.category,
      defaultRoom: item.defaultRoom,
      quantity: parseFloat(item.totalOutputQty) || 1,
      unit: item.unitType || 'each',
      rawlineItems: item
    }
  }

  emit('update:selectedItemsMap', next)
}

const updateItemQuantity = (item, val) => {
  const qty = Math.max(1, parseFloat(val) || 1)
  const next = { ...props.selectedItemsMap }

  if (next[item.id]) {
    next[item.id].quantity = qty
    emit('update:selectedItemsMap', next)
  }
}

const toggleGroup = groupName => {
  const groupItems = alllineItems.value.filter(
    a => (a.group) === groupName
  )

  const allInGroupSelected = groupItems.every(a => isSelected(a.id))
  const next = { ...props.selectedItemsMap }

  groupItems.forEach(item => {
    if (allInGroupSelected) {
      delete next[item.id]
    } else if (!next[item.id]) {
      next[item.id] = {
        id: item.id,
        name: item.name,
        group: item.group,
        category: item.category,
        defaultRoom: item.defaultRoom,
        quantity: parseFloat(item.totalOutputQty) || 1,
        unit: item.unitType,
        rawlineItems: item
      }
    }
  })

  emit('update:selectedItemsMap', next)
}

const getItemUnitPrice = item => {
  let unitVal = 0

    ; (item.laborRequired || []).forEach(r => {
      const role = appStore.getLaborById(r.classId) || { rate: r.rate || 0 }
      unitVal += (r.unitHours || 0) * (role.rate || 0)
    })

    ; (item.materialRequired || []).forEach(r => {
      const mat = appStore.getMaterialById(r.materialId) || { netPrice: r.price || 0 }
      unitVal += (r.qty || 0) * (mat.netPrice || 0)
    })

    ; (item.equipmentRequired || []).forEach(r => {
      const eq = appStore.getEquipmentById(r.equipmentId) || { netPrice: r.price || 0 }
      unitVal += (r.qty || 0) * (eq.netPrice || 0)
    })

  return unitVal
}

const formatMoney = val =>
  (parseFloat(val) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
</script>

<style scoped>
.qty-field {
  max-width: 90px
}

.qty-field :deep(.v-field__input) {
  text-align: center;
  padding: 4px 8px
}

.transition-all {
  transition: all .2s ease-in-out
}
</style>