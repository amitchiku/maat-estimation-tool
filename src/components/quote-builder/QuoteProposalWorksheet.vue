<template>
  <div class="printable-area">
    <!-- 1. Workspace Controls (Top Toolbar) -->
    <v-card border elevation="0" class="rounded-lg pa-3 mb-3 no-print">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3">
        <!-- Live Search / Filter -->
        <v-text-field v-model="searchQuery" label="Search room or item..." prepend-inner-icon="mdi-magnify"
          variant="outlined" density="compact" hide-details clearable style="max-width: 280px;" />

        <!-- Bulk Controls & Cost Toggle -->
        <div class="d-flex align-center flex-wrap ga-2">
          <v-btn variant="text" size="small" class="text-none font-weight-medium" @click="toggleAllRooms">
            <v-icon :icon="isEverythingExpanded ? 'mdi-unfold-less-horizontal' : 'mdi-unfold-more-horizontal'" size="18" class="mr-1" />
            {{ isEverythingExpanded ? 'Collapse All' : 'Expand All' }}
          </v-btn>

          <v-divider vertical class="mx-1" />

          <v-switch v-model="showInternalCosts" label="Show Internal Costs" color="teal" density="compact" hide-details
            class="ms-1" />

          <v-divider vertical class="mx-1" />

          <v-switch :model-value="!isHeaderCollapsed" @update:model-value="val => isHeaderCollapsed = !val"
            label="Show Customer Details" color="teal" density="compact" hide-details class="ms-1" />
        </div>
      </div>
    </v-card>

    <!-- Main Worksheet Container -->
    <div class="mb-4">
      <!-- Collapsible Header Info -->
      <v-expand-transition>
        <div v-show="!isHeaderCollapsed" class="mb-4">
          <v-card border elevation="0" class="pa-4 rounded-lg bg-surface">
            <!-- Header Main -->
            <div class="d-flex align-center justify-space-between flex-wrap ga-3 pb-3 mb-3 border-b">
              <div>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ appStore.settings?.companyHeader?.companyName || 'Sycamore Design Build, Inc.' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ appStore.settings?.companyHeader?.address || '4427 Chestnut La. Rockville, MD 20853' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Ph: {{ appStore.settings?.companyHeader?.phone || '(301) 924-9322' }}
                  <span class="mx-1">|</span>
                  {{ appStore.settings?.companyHeader?.mhic || 'MHIC 68498' }}
                </div>
              </div>

              <div class="text-right">
                <div class="text-h6 font-weight-bold text-teal-darken-2">Proposal</div>
                <div class="text-caption text-medium-emphasis"><strong>Date:</strong> {{ quote.date || todayDate }}
                </div>
                <div v-if="quote.dateOfLoss" class="text-caption text-medium-emphasis">
                  <strong>Date of Loss:</strong> {{ quote.dateOfLoss }}
                </div>
              </div>
            </div>

            <!-- Customer Grid -->
            <v-row density="compact">
              <v-col cols="12" md="6">
                <v-card border elevation="0" class="pa-3 rounded-lg bg-amber-lighten-5">
                  <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-1">Prepared For</div>
                  <div class="text-caption"><strong>Customer:</strong> {{ quote.clientName || 'Customer' }}</div>
                  <div class="text-caption"><strong>Address:</strong> {{ quote.clientStreet || 'Street Address' }}</div>
                  <div class="text-caption"><strong>City, State:</strong> {{ quote.clientCityState || 'City, State' }}
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card border elevation="0" class="pa-3 rounded-lg bg-amber-lighten-5">
                  <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-1">Project</div>
                  <div class="text-caption">
                    <strong>Project Address:</strong> {{ quote.projectAddress || 'Same' }}
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Prepared By Footer -->
            <div class="d-flex align-center flex-wrap ga-2 pt-3 mt-3 border-t text-caption text-medium-emphasis">
              <strong>Prepared By:</strong>
              <span class="text-high-emphasis">{{ quote.preparedBy || appStore.settings?.preparedBy?.name || 'M. Webb'
              }}</span>
              <span>|</span>
              <strong>Ph:</strong>
              <span class="text-high-emphasis">{{ quote.preparedByPhone || appStore.settings?.preparedBy?.phone ||
                '(301) 252 - 1355' }}</span>
            </div>
          </v-card>
        </div>
      </v-expand-transition>

      <!-- 2. Accordion Structure for High Room Counts -->
      <div v-for="room in filteredQuoteRooms" :key="room.name" class="mb-4">
        <v-card border elevation="0" class="rounded-lg overflow-hidden room-card">
          <!-- Header Bar (Sticky Docking) -->
          <div class="d-flex align-center justify-space-between px-4 py-2 sticky-room-header border-b cursor-pointer"
            @click="toggleRoomCollapse(room.name)">
            <!-- Left Header -->
            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-triangle-down" size="12" color="teal" class="accordion-arrow"
                :class="{ 'is-collapsed': !!collapsedRooms[room.name] }" />
              <span class="font-weight-bold text-body-1 text-slate-900">{{ room.name }}</span>
              <v-chip size="x-small" color="teal" variant="tonal" class="font-weight-bold ml-1">
                {{ room.items.length }} {{ room.items.length === 1 ? 'item' : 'items' }}
              </v-chip>
            </div>

            <!-- Right Financial Pills & Inline + Line Item Button -->
            <div class="d-flex align-center ga-3" @click.stop>
              <v-chip size="small" variant="outlined" color="amber-darken-3" class="font-weight-medium">
                Allowance: ${{ formatMoney(getRoomTotals(room).allowance) }}
              </v-chip>

              <v-chip size="small" variant="flat" color="teal-lighten-5" class="text-teal-darken-3 font-weight-bold">
                Room Total: ${{ formatMoney(getRoomTotals(room).total) }}
              </v-chip>

              <v-btn size="small" color="teal" prepend-icon="mdi-plus" variant="flat"
                class="text-none font-weight-bold px-3" @click="addItemToRoom(room.name)">
                Line Item
              </v-btn>
            </div>
          </div>

          <!-- 3. Data Grid Cleanup -->
          <v-expand-transition>
            <div v-show="!collapsedRooms[room.name]">
              <v-table density="compact" class="bg-white">
                <thead>
                  <tr class="bg-grey-lighten-4">
                    <th class="font-weight-bold">Description</th>
                    <th class="text-center font-weight-bold" style="width:130px">Qty</th>
                    <th v-if="showInternalCosts" class="text-right font-weight-bold" style="width:105px">Base Price</th>
                    <th class="text-right font-weight-bold" style="width:105px">Unit Price</th>
                    <th class="text-right font-weight-bold" style="width:115px">Total</th>
                    <th v-if="showInternalCosts" class="text-right font-weight-bold" style="width:115px">Unit Allowance
                    </th>
                    <th class="text-right font-weight-bold" style="width:115px">Allowance</th>
                    <th class="text-center font-weight-bold" style="width:140px">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-if="!room.items.length">
                    <td :colspan="showInternalCosts ? 8 : 6" class="text-center py-4 text-medium-emphasis">
                      No items in this room.
                    </td>
                  </tr>

                  <tr v-for="item in room.items" :key="item.id"
                    :class="{ 'opacity-50 text-decoration-line-through': item.isStruck }">
                    <!-- Description -->
                    <td class="py-2">
                      <div class="text-body-2 font-weight-regular">{{ item.name }}</div>
                      <div v-if="item.desc" class="text-caption text-medium-emphasis mt-n1">{{ item.desc }}</div>
                    </td>

                    <!-- Qty -->
                    <td class="text-center py-1">
                      <div class="d-flex align-center justify-center ga-1">
                        <v-text-field :model-value="item.quantity" type="number" min="1" density="compact"
                          variant="outlined" hide-details style="width: 68px;" class="qty-field text-center"
                          @update:model-value="val => updateItemQty(item, val)" />
                        <span class="text-caption text-medium-emphasis">{{ item.unit || 'ea' }}</span>
                      </div>
                    </td>

                    <!-- Base Price (Internal) -->
                    <td v-if="showInternalCosts" class="text-right font-mono">
                      ${{ formatMoney(getItemPricing(item).basePrice) }}
                    </td>

                    <!-- Unit Price -->
                    <td class="text-right font-mono">
                      ${{ formatMoney(getItemPricing(item).unitPrice) }}
                    </td>

                    <!-- Total (Regular Weight) -->
                    <td class="text-right font-mono">
                      ${{ formatMoney(getItemPricing(item).totalAmount) }}
                    </td>

                    <!-- Unit Allowance (Internal) -->
                    <td v-if="showInternalCosts" class="text-right font-mono">
                      ${{ formatMoney(getItemPricing(item).unitAllowance) }}
                    </td>

                    <!-- Allowance -->
                    <td class="text-right font-mono">
                      {{ getItemPricing(item).allowanceAmount ? '$' + formatMoney(getItemPricing(item).allowanceAmount)
                      : '—' }}
                    </td>

                    <!-- Actions (3 Visible Actions: Allowance, Strike, Delete) -->
                    <td class="text-center py-1">
                      <div class="d-flex align-center justify-center ga-1">
                        <!-- 1. Allowance Toggle -->
                        <v-btn icon size="x-small" variant="tonal"
                          :color="item.isAllowanceFull ? 'amber-darken-3' : 'teal-lighten-4'"
                          @click="toggleAllowanceFull(item)">
                          <v-icon icon="mdi-shield-check-outline"
                            :color="item.isAllowanceFull ? 'amber-darken-3' : 'teal-darken-2'" size="16" />
                          <v-tooltip activator="parent" location="top">
                            {{ item.isAllowanceFull ? 'Allowance: Full Total' : 'Allowance: Unit Rate' }}
                          </v-tooltip>
                        </v-btn>

                        <!-- 2. Strike Toggle (Excludes from calculation) -->
                        <v-btn icon size="x-small" variant="tonal"
                          :color="item.isStruck ? 'red-lighten-4' : 'blue-grey-lighten-4'"
                          @click="toggleItemStruck(item)">
                          <v-icon icon="mdi-format-strikethrough-variant"
                            :color="item.isStruck ? 'red-darken-2' : 'blue-grey-darken-2'" size="16" />
                          <v-tooltip activator="parent" location="top">
                            {{ item.isStruck ?
                              'Unstrike Item (Include in Calculation)' :
                              'Strike Item (Exclude from Calculation) ' }}
                          </v-tooltip>
                        </v-btn>

                        <!-- 3. Delete -->
                        <v-btn icon size="x-small" variant="tonal" color="red-lighten-4"
                          @click="removeItemFromRoom(room.name, item.id)">
                          <v-icon icon="mdi-delete-outline" color="red-darken-2" size="16" />
                          <v-tooltip activator="parent" location="top">Delete Item</v-tooltip>
                        </v-btn>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-expand-transition>
        </v-card>
      </div>

      <!-- Tags Card -->
      <v-card border elevation="0" class="rounded-lg pa-3 mb-3 bg-surface">
        <div class="d-flex align-center flex-wrap ga-2">
          <div class="d-flex align-center ga-1 text-caption font-weight-bold mr-2">
            <v-icon icon="mdi-tag-multiple-outline" color="teal" size="17" />
            <span>Tags</span>
          </div>

          <div v-if="tagSummaries.length" class="d-flex flex-wrap ga-1">
            <v-chip v-for="tg in tagSummaries" :key="tg.name" size="x-small" color="teal" variant="tonal">
              {{ tg.name }}: {{ tg.count }} (${{ formatMoney(tg.total) }})
            </v-chip>
          </div>

          <span v-else class="text-caption text-medium-emphasis">No tags</span>
        </div>
      </v-card>
      <!-- PDF Calculation Section -->
<div class="pdf-calculation-section">

  <div class="pdf-calculation-title">
    Room Total Allowances
  </div>

  <table class="pdf-calculation-table">

    <thead>
      <tr>
        <th>Room</th>
        <th class="text-right">Total</th>
        <th class="text-right">Allowances</th>
      </tr>
    </thead>

    <tbody>

     <tr
  v-for="group in pdfGroups"
  :key="'pdf-calculation-' + group.name"
>
  <td>
    {{ group.name }}
  </td>

  <td class="text-right">
    ${{ formatMoney(group.total) }}
  </td>

  <td class="text-right">
    ${{ formatMoney(group.allowance) }}
  </td>
</tr>

    </tbody>

  </table>

  <div class="pdf-final-calculation">

    <div class="pdf-final-row">
      <span>Estimate Total</span>
      <strong>
        ${{ formatMoney(proposalTotals.grandTotal) }}
      </strong>
    </div>

    <div class="pdf-final-row">
      <span>- Allowances</span>
      <strong>
        ${{ formatMoney(proposalTotals.allowance) }}
      </strong>
    </div>

    <div class="pdf-contract-total">
      <span>Contract Total</span>

      <strong>
        ${{
          formatMoney(
            proposalTotals.grandTotal - proposalTotals.allowance
          )
        }}
      </strong>
    </div>

  </div>

</div>
    </div>

    <!-- 4. Sticky Summary Bottom Bar -->
    <v-card border elevation="4" class="sticky-bottom-bar rounded-lg pa-3 no-print">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3">
        <!-- Left Scope Counter -->
        <div class="d-flex align-center ga-2 text-body-2 text-medium-emphasis">
          <v-icon icon="mdi-home-city-outline" color="teal" size="20" />
          <span>Total: <strong>{{ quoteRooms.length }} Rooms</strong> • <strong>{{ totalProposalItemsCount }} Line
              Items</strong></span>
        </div>

        <!-- Middle Allowance Rollup -->
        <div class="d-flex align-center ga-2 text-body-2 text-amber-darken-3">
          <v-icon icon="mdi-shield-check-outline" size="20" />
          <span>Allowance Rollup: <strong class="text-subtitle-1">${{ formatMoney(proposalTotals.allowance)
          }}</strong></span>
        </div>

        <!-- Right Grand Total & Primary Action Buttons -->
        <div class="d-flex align-center ga-3">
          <div class="d-flex align-baseline ga-2 mr-2">
            <span class="text-caption text-medium-emphasis uppercase">Grand Total</span>
            <span class="text-h5 font-weight-bold text-teal-darken-3">${{ formatMoney(proposalTotals.grandTotal)
            }}</span>
          </div>

          <v-btn variant="outlined" color="teal" class="text-none font-weight-medium" @click="$emit('save')">
            Save Draft
          </v-btn>

          <v-btn variant="tonal" color="blue" class="text-none font-weight-medium" prepend-icon="mdi-eye-outline"
            @click="$emit('print')">
            Preview PDF
          </v-btn>

          <v-btn color="teal" class="text-none font-weight-bold" prepend-icon="mdi-check-all" @click="$emit('save')">
            Finalize Proposal
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Add Line Item Pop-up Dialog Component (Loaded in background) -->
    <LineItemSelectDialog v-if="isDialogMounted" v-model="itemDialog" :target-room-name="targetRoomName" @add-items="handleAddDialogItems" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import LineItemSelectDialog from './LineItemSelectDialog.vue'

const props = defineProps({
  quote: { type: Object, required: true },
  selectedItemsMap: { type: Object, required: true }
})

const emit = defineEmits(['save', 'print', 'update:selectedItemsMap'])
const appStore = useAppStore()

// LocalStorage persisted UI toggles
const isHeaderCollapsed = ref(localStorage.getItem('worksheet_hide_customer_details') === 'true')
const showInternalCosts = ref(localStorage.getItem('worksheet_show_internal_costs') === 'true')

watch(isHeaderCollapsed, (val) => {
  localStorage.setItem('worksheet_hide_customer_details', String(val))
})

watch(showInternalCosts, (val) => {
  localStorage.setItem('worksheet_show_internal_costs', String(val))
})

const searchQuery = ref('')
const collapsedRooms = ref({})
const todayDate = new Date().toISOString().substring(0, 10)

// Pop-up Item Dialog state & Background Mount
const itemDialog = ref(false)
const isDialogMounted = ref(false)
const targetRoomName = ref('')

onMounted(() => {
  // Load the dialog component in the background after worksheet renders
  setTimeout(() => {
    isDialogMounted.value = true
  }, 200)
})

const toggleRoomCollapse = roomName => {
  collapsedRooms.value = {
    ...collapsedRooms.value,
    [roomName]: !collapsedRooms.value[roomName]
  }
}

const isEverythingExpanded = computed(() => {
  if (!quoteRooms.value.length) return false
  return quoteRooms.value.every(r => collapsedRooms.value[r.name] === false)
})

const toggleAllRooms = () => {
  const shouldCollapse = isEverythingExpanded.value
  const next = {}
  quoteRooms.value.forEach(r => {
    next[r.name] = shouldCollapse
  })
  collapsedRooms.value = next
}

const quoteRooms = computed(() => {
  const rooms = {}
  Object.values(props.selectedItemsMap || {}).forEach(item => {
    const name = item.assignedRoom || item.defaultRoom || 'General'
    if (!rooms[name]) rooms[name] = { name, items: [] }
    rooms[name].items.push(item)
  })
  return Object.values(rooms)
})


const pdfGroups = computed(() => {
  const groups = {}

  Object.values(props.selectedItemsMap || {}).forEach(item => {
    const groupName =
      item.group ||
      item.category ||
      'General'

    if (!groups[groupName]) {
      groups[groupName] = {
        name: groupName,
        total: 0,
        allowance: 0
      }
    }

    const pricing = getItemPricing(item)

    groups[groupName].total += pricing.totalAmount
    groups[groupName].allowance += pricing.allowanceAmount
  })

  return Object.values(groups)
})

const filteredQuoteRooms = computed(() => {
  if (!searchQuery.value) return quoteRooms.value

  const q = searchQuery.value.toLowerCase().trim()
  return quoteRooms.value.map(room => {
    const roomMatch = room.name.toLowerCase().includes(q)
    if (roomMatch) return room

    const filteredItems = room.items.filter(item =>
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.desc && item.desc.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q))
    )

    return { ...room, items: filteredItems }
  }).filter(room => room.items.length > 0)
})

const getItemPricing = item => {
  if (item.isStruck) {
    return {
      basePrice: 0,
      unitPrice: 0,
      totalAmount: 0,
      unitAllowance: 0,
      allowanceAmount: 0
    }
  }

  const qty = parseFloat(item.quantity) || 1
  const raw = item.rawlineItems || {}
  let baseVal = 0, unitVal = 0, unitAllow = 0

    ; (raw.laborRequired || []).forEach(r => {
      const role = appStore.getLaborById(r.classId) || { rate: r.rate || 0 }
      const rate = role.rate || 0
      baseVal += (r.baseHours || 0) * rate
      unitVal += (r.unitHours || 0) * rate
      const mode = String(r.allowMode || 'NONE').toUpperCase()
      if (mode === 'BOTH' || mode === 'UNIT' || mode === 'ONLY UNIT HR')
        unitAllow += (r.unitHours || 0) * rate
    })

    ; (raw.materialRequired || []).forEach(r => {
      const mat = appStore.getMaterialById(r.materialId) || {}
      const net = mat.netPrice !== undefined ? mat.netPrice : (r.price || 0)
      const tax = mat.tax !== undefined ? mat.tax : (r.tax !== undefined ? r.tax : 0.06)
      const markup = mat.markup !== undefined ? mat.markup : (r.markup !== undefined ? r.markup : 0.25)
      const allowP = net * (1 + tax), grossP = allowP * (1 + markup), reqQty = r.qty || 1

      if (r.base) baseVal += reqQty * grossP
      else unitVal += reqQty * grossP
      if (r.allow) unitAllow += reqQty * allowP
    })

    ; (raw.equipmentRequired || []).forEach(r => {
      const eq = appStore.getEquipmentById(r.equipmentId) || {}
      const net = eq.netPrice !== undefined ? eq.netPrice : (r.price || 0)
      const tax = eq.tax !== undefined ? eq.tax : (r.tax !== undefined ? r.tax : 0)
      const markup = eq.markup !== undefined ? eq.markup : (r.markup !== undefined ? r.markup : 0.25)
      const allowP = net * (1 + tax), grossP = allowP * (1 + markup), reqQty = r.qty || 1

      if (r.base) baseVal += reqQty * grossP
      else unitVal += reqQty * grossP
      if (r.allow) unitAllow += reqQty * allowP
    })

  const totalAmount = qty * unitVal + baseVal
  const allowanceAmount = item.isAllowanceFull ? totalAmount : unitAllow * qty

  return { basePrice: baseVal, unitPrice: unitVal, totalAmount, unitAllowance: unitAllow, allowanceAmount }
}

const getRoomTotals = room => room.items.reduce((t, item) => {
  const p = getItemPricing(item)
  return { total: t.total + p.totalAmount, allowance: t.allowance + p.allowanceAmount }
}, { total: 0, allowance: 0 })

const proposalTotals = computed(() =>
  quoteRooms.value.reduce((t, room) => {
    const r = getRoomTotals(room)
    return { grandTotal: t.grandTotal + r.total, allowance: t.allowance + r.allowance }
  }, { grandTotal: 0, allowance: 0 })
)

const totalProposalItemsCount = computed(() =>
  Object.keys(props.selectedItemsMap || {}).length
)

const tagSummaries = computed(() => {
  const groups = {}
  Object.values(props.selectedItemsMap || {}).forEach(item => {
    const name = item.group || item.category || 'General'
    if (!groups[name]) groups[name] = { name, count: 0, total: 0 }
    groups[name].count++
    groups[name].total += getItemPricing(item).totalAmount
  })
  return Object.values(groups)
})

const updateItemQty = (item, value) => {
  const quantity = Math.max(1, parseFloat(value) || 1)
  const next = { ...props.selectedItemsMap }
  if (next[item.id]) {
    next[item.id] = { ...next[item.id], quantity }
    emit('update:selectedItemsMap', next)
  }
}

const toggleAllowanceFull = (item) => {
  const next = { ...props.selectedItemsMap }
  if (next[item.id]) {
    next[item.id] = { ...next[item.id], isAllowanceFull: !next[item.id].isAllowanceFull }
    emit('update:selectedItemsMap', next)
  }
}

const toggleItemStruck = (item) => {
  const next = { ...props.selectedItemsMap }
  if (next[item.id]) {
    next[item.id] = { ...next[item.id], isStruck: !next[item.id].isStruck }
    emit('update:selectedItemsMap', next)
  }
}

const duplicateItem = (item) => {
  const newId = `${item.id}_copy_${Date.now()}`
  const next = { ...props.selectedItemsMap }
  next[newId] = {
    ...JSON.parse(JSON.stringify(item)),
    id: newId,
    name: `${item.name} (Copy)`
  }
  emit('update:selectedItemsMap', next)
}

const addItemToRoom = (roomName) => {
  targetRoomName.value = roomName
  isDialogMounted.value = true
  itemDialog.value = true
}

const handleAddDialogItems = (newItems) => {
  const next = { ...props.selectedItemsMap }
  newItems.forEach(item => {
    next[item.id] = item
  })
  emit('update:selectedItemsMap', next)
}

const removeItemFromRoom = (roomName, itemId) => {
  const next = { ...props.selectedItemsMap }
  delete next[itemId]
  emit('update:selectedItemsMap', next)
}

const formatMoney = value =>
  (parseFloat(value) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.room-card {
  background-color: #f8fafc;
}

.sticky-room-header {
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: #f8fafc;
}

.sticky-bottom-bar {
  position: sticky;
  bottom: 12px;
  z-index: 10;
  background-color: #ffffff;
  box-shadow: 0 -4px 18px rgba(0, 0, 0, 0.08) !important;
}

.font-mono {
  font-family: monospace, monospace;
}

.accordion-arrow {
  transition: transform 0.2s ease-in-out;
}

.accordion-arrow.is-collapsed {
  transform: rotate(-90deg);
}
.pdf-calculation-section {
  margin-top: 35px;
  padding-top: 20px;
  border-top: 2px solid #222;
  width: 100%;
  page-break-inside: avoid;
  break-inside: avoid;
}

.pdf-calculation-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #000;
}

.pdf-calculation-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 25px;
}

.pdf-calculation-table th,
.pdf-calculation-table td {
  padding: 7px 10px;
  border-bottom: 1px solid #999;
  font-size: 11px;
  color: #000;
}

.pdf-calculation-table th {
  font-weight: 700;
  text-align: left;
  background: #f2f2f2;
}

.pdf-calculation-table .text-right {
  text-align: right;
}

.pdf-calculation-total td {
  font-weight: 700;
  border-top: 2px solid #222;
  background: #f2f2f2;
}

.pdf-final-calculation {
  width: 45%;
  margin-left: auto;
  margin-top: 20px;
}

.pdf-final-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12px;
  color: #000;
}

.pdf-contract-total {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 2px solid #222;
  font-size: 14px;
  font-weight: 700;
  color: #000;
}
/* =========================================
   PDF PRINT FIX
   ========================================= */

@media print {

  @page {
    size: A4;
    margin: 12mm;
  }

  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
  }

  .no-print {
    display: none !important;
  }

  .printable-area {
    display: block !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .pdf-calculation-section {
    display: block !important;
    width: 100% !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

}
</style>