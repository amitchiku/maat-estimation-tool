<template>
  <div class="proposal-wrapper">
    <v-card border elevation="0" class="toolbar-card rounded-lg pa-2 mb-3">
      <div class="d-flex align-center justify-space-between">
        <v-btn variant="tonal" color="teal" size="small" class="text-none font-weight-medium"
          @click="isHeaderCollapsed = !isHeaderCollapsed">
          <v-icon :icon="isHeaderCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'" size="18" class="mr-1" />
          {{ isHeaderCollapsed ? 'Show Details' : 'Hide Details' }}
        </v-btn>

        <div class="d-flex align-center ga-2">
          <v-btn variant="tonal" color="blue" size="small" prepend-icon="mdi-printer" class="text-none"
            @click="$emit('print')">Print / PDF</v-btn>
          <v-btn color="teal" size="small" prepend-icon="mdi-content-save" class="text-none font-weight-bold"
            @click="$emit('save')">Save</v-btn>
        </div>
      </div>
    </v-card>

    <v-card border elevation="0" class="worksheet-card rounded-lg pa-3">
      <v-expand-transition>
        <div v-show="!isHeaderCollapsed" class="proposal-header mb-3">
          <div class="header-main">
            <div>
              <div class="company-name">
                {{ appStore.settings?.companyHeader?.companyName || 'Sycamore Design Build, Inc.' }}
              </div>
              <div class="company-address">
                {{ appStore.settings?.companyHeader?.address || '4427 Chestnut La. Rockville, MD 20853' }}
              </div>
              <div class="company-contact">
                Ph: {{ appStore.settings?.companyHeader?.phone || '(301) 924-9322' }}
                <span class="separator">|</span>
                {{ appStore.settings?.companyHeader?.mhic || 'MHIC 68498' }}
              </div>
            </div>

            <div class="proposal-info">
              <div class="proposal-title">Proposal</div>
              <div class="proposal-date"><strong>Date:</strong> {{ quote.date || todayDate }}</div>
              <div v-if="quote.dateOfLoss" class="proposal-date">
                <strong>Date of Loss:</strong> {{ quote.dateOfLoss }}
              </div>
            </div>
          </div>

          <div class="customer-grid">
            <div class="customer-box">
              <div class="box-title">Prepared For</div>
              <div class="customer-row"><span>Customer</span><strong>{{ quote.clientName || 'Customer' }}</strong></div>
              <div class="customer-row"><span>Address</span><span>{{ quote.clientStreet || 'Street Address' }}</span></div>
              <div class="customer-row"><span>City, State</span><span>{{ quote.clientCityState || 'City, State' }}</span></div>
            </div>

            <div class="customer-box">
              <div class="box-title">Project</div>
              <div class="customer-row">
                <span>Project Address</span>
                <strong>{{ quote.projectAddress || 'Same' }}</strong>
              </div>
            </div>
          </div>

          <div class="prepared-by">
            <strong>Prepared By:</strong>
            <span>{{ quote.preparedBy || appStore.settings?.preparedBy?.name || 'M. Webb' }}</span>
            <span class="separator">|</span>
            <strong>Ph:</strong>
            <span>{{ quote.preparedByPhone || appStore.settings?.preparedBy?.phone || '(301) 252 - 1355' }}</span>
          </div>
        </div>
      </v-expand-transition>

      <div v-for="room in quoteRooms" :key="room.name" class="room-section mb-4">
        <div class="room-header d-flex align-center justify-space-between px-3 py-2 rounded-t-lg cursor-pointer"
          @click="toggleRoomCollapse(room.name)">
          <div class="d-flex align-center">
            <v-icon :icon="collapsedRooms[room.name] ? 'mdi-chevron-right' : 'mdi-chevron-down'" size="18" class="mr-1" />
            <span class="room-name">{{ room.name }}</span>
            <v-chip size="x-small" color="teal" variant="tonal" class="ml-2 font-weight-bold">
              {{ room.items.length }} {{ room.items.length === 1 ? 'Item' : 'Items' }}
            </v-chip>
          </div>

          <div class="room-total">
            <span>Total: <strong>${{ formatMoney(getRoomTotals(room).total) }}</strong></span>
            <span class="allowance-text">Allowance: <strong>${{ formatMoney(getRoomTotals(room).allowance) }}</strong></span>
          </div>
        </div>

        <v-expand-transition>
          <div v-show="!collapsedRooms[room.name]" class="room-table-wrapper">
            <v-table density="compact" class="proposal-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-center" style="width:65px">Qty</th>
                  <th class="text-center" style="width:65px">U/M</th>
                  <th class="text-right" style="width:95px">Base Price</th>
                  <th class="text-right" style="width:95px">Unit Price</th>
                  <th class="text-right" style="width:105px">Total</th>
                  <th class="text-right" style="width:105px">Unit Allowance</th>
                  <th class="text-right" style="width:105px">Allowance</th>
                  <th class="text-center" style="width:45px">A</th>
                  <th class="text-center" style="width:50px">Strike</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="!room.items.length">
                  <td colspan="10" class="empty-row">No items in this room.</td>
                </tr>

                <tr v-for="item in room.items" :key="item.id" :class="{ 'strike-row': item.isStruck }">
                  <td class="font-weight-medium">
                    {{ item.name }}
                    <div v-if="item.desc" class="item-description">{{ item.desc }}</div>
                  </td>

                  <td class="text-center">
                    <input type="number" min="1" class="qty-input" :value="item.quantity"
                      @change="e => updateItemQty(item, e.target.value)" />
                  </td>

                  <td class="text-center item-muted">{{ item.unit || 'each' }}</td>
                  <td class="text-right item-muted">${{ formatMoney(getItemPricing(item).basePrice) }}</td>
                  <td class="text-right">${{ formatMoney(getItemPricing(item).unitPrice) }}</td>
                  <td class="text-right font-weight-bold">${{ formatMoney(getItemPricing(item).totalAmount) }}</td>
                  <td class="text-right item-muted">${{ formatMoney(getItemPricing(item).unitAllowance) }}</td>
                  <td class="text-right allowance-text font-weight-bold">${{ formatMoney(getItemPricing(item).allowanceAmount) }}</td>

                  <td class="text-center">
                    <v-checkbox-btn v-model="item.isAllowanceFull" color="teal" density="compact" />
                  </td>

                  <td class="text-center">
                    <v-btn icon="mdi-close" size="x-small" color="red" variant="text" title="Remove Item"
                      @click="removeItemFromRoom(room.name, item.id)" />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-expand-transition>
      </div>

      <v-card border elevation="0" class="tags-card rounded-lg mb-3">
        <div class="tags-inner">
          <div class="tags-title">
            <v-icon icon="mdi-tag-multiple-outline" color="teal" size="17" />
            <span>Tags</span>
          </div>

          <div v-if="tagSummaries.length" class="tag-list">
            <v-chip v-for="tg in tagSummaries" :key="tg.name" size="x-small" color="teal" variant="tonal">
              {{ tg.name }}: {{ tg.count }} (${{ formatMoney(tg.total) }})
            </v-chip>
          </div>

          <span v-else class="no-tags">No tags</span>
        </div>
      </v-card>

      <v-card border elevation="0" class="totals-card rounded-lg">
        <div class="totals-section">
          <div class="summary-stat"><span>Total Rooms</span><strong>{{ quoteRooms.length }}</strong></div>
          <div class="summary-divider" />
          <div class="summary-stat"><span>Line Items</span><strong>{{ totalProposalItemsCount }}</strong></div>
        </div>

        <div class="totals-section totals-right">
          <div class="allowance-summary">
            <span>Allowance</span>
            <strong>${{ formatMoney(proposalTotals.allowance) }}</strong>
          </div>

          <div class="summary-divider" />

          <div class="grand-total">
            <span>Grand Total</span>
            <strong>${{ formatMoney(proposalTotals.grandTotal) }}</strong>
          </div>
        </div>
      </v-card>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  quote: { type: Object, required: true },
  selectedItemsMap: { type: Object, required: true }
})

const emit = defineEmits(['save', 'print', 'update:selectedItemsMap'])
const appStore = useAppStore()
const isHeaderCollapsed = ref(false)
const collapsedRooms = ref({})
const todayDate = new Date().toISOString().substring(0, 10)

const toggleRoomCollapse = roomName => {
  collapsedRooms.value[roomName] = !collapsedRooms.value[roomName]
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

const getItemPricing = item => {
  const qty = parseFloat(item.quantity) || 1
  const raw = item.rawAssembly || {}
  let baseVal = 0, unitVal = 0, unitAllow = 0

  ;(raw.laborRequired || []).forEach(r => {
    const role = appStore.getLaborById(r.classId) || { rate: r.rate || 0 }
    const rate = role.rate || 0
    baseVal += (r.baseHours || 0) * rate
    unitVal += (r.unitHours || 0) * rate
    const mode = String(r.allowMode || 'NONE').toUpperCase()
    if (mode === 'BOTH' || mode === 'UNIT' || mode === 'ONLY UNIT HR')
      unitAllow += (r.unitHours || 0) * rate
  })

  ;(raw.materialRequired || []).forEach(r => {
    const mat = appStore.getMaterialById(r.materialId) || {}
    const net = mat.netPrice !== undefined ? mat.netPrice : (r.price || 0)
    const tax = mat.tax !== undefined ? mat.tax : (r.tax !== undefined ? r.tax : 0.06)
    const markup = mat.markup !== undefined ? mat.markup : (r.markup !== undefined ? r.markup : 0.25)
    const allowP = net * (1 + tax), grossP = allowP * (1 + markup), reqQty = r.qty || 1

    if (r.base) baseVal += reqQty * grossP
    else unitVal += reqQty * grossP
    if (r.allow) unitAllow += reqQty * allowP
  })

  ;(raw.equipmentRequired || []).forEach(r => {
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
.proposal-wrapper{width:100%}
.toolbar-card,.worksheet-card{background:rgb(var(--v-theme-surface));color:rgb(var(--v-theme-on-surface))}
.proposal-header{border:1px solid rgba(var(--v-border-color),.25);border-radius:8px;padding:10px 12px;background:rgba(var(--v-theme-on-surface),.025)}
.header-main{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding-bottom:8px;border-bottom:1px solid rgba(var(--v-border-color),.2)}
.company-name{font-size:15px;line-height:1.2;font-weight:700;color:rgb(var(--v-theme-on-surface))}
.company-address{margin-top:2px;font-size:11px;color:rgba(var(--v-theme-on-surface),.65)}
.company-contact{margin-top:1px;font-size:10px;color:rgba(var(--v-theme-on-surface),.55)}
.proposal-info{min-width:150px;text-align:right}
.proposal-title{font-size:18px;line-height:1;font-weight:700;color:rgb(var(--v-theme-on-surface));margin-bottom:5px}
.proposal-date{font-size:10px;color:rgba(var(--v-theme-on-surface),.65)}
.proposal-date strong,.customer-row strong,.prepared-by strong{color:rgb(var(--v-theme-on-surface))}
.separator{margin:0 4px;color:rgba(var(--v-theme-on-surface),.25)}
.customer-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.customer-box{border:1px solid rgba(var(--v-border-color),.25);border-radius:6px;padding:7px 9px;background:rgba(245,158,11,.06)}
.box-title{font-size:10px;font-weight:700;color:rgba(var(--v-theme-on-surface),.65);margin-bottom:3px;text-transform:uppercase}
.customer-row{display:grid;grid-template-columns:90px 1fr;gap:5px;font-size:10px;line-height:1.5;color:rgba(var(--v-theme-on-surface),.7)}
.customer-row span:first-child{font-weight:600;color:rgba(var(--v-theme-on-surface),.55)}
.prepared-by{display:flex;align-items:center;flex-wrap:wrap;gap:4px;margin-top:7px;padding-top:6px;border-top:1px solid rgba(var(--v-border-color),.2);font-size:10px;color:rgba(var(--v-theme-on-surface),.65)}
.room-header{min-height:40px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.25);color:rgb(var(--v-theme-on-surface));transition:.15s}
.room-header:hover{background:rgba(16,185,129,.14)}
.room-name{font-size:13px;font-weight:700;color:rgb(var(--v-theme-on-surface))}
.room-total{display:flex;align-items:center;gap:14px;font-size:10px;color:rgba(var(--v-theme-on-surface),.65)}
.room-total strong{color:rgb(var(--v-theme-on-surface))}
.allowance-text{color:#b45309!important}
.room-table-wrapper{border:1px solid rgba(var(--v-border-color),.25);border-top:0;border-radius:0 0 7px 7px;overflow:hidden}
.proposal-table{background:transparent}
.proposal-table th{height:38px!important;background:rgba(16,185,129,.08);color:rgb(var(--v-theme-on-surface))!important;white-space:nowrap;font-size:11px}
.proposal-table td{height:45px!important;font-size:11px;color:rgb(var(--v-theme-on-surface));border-bottom:1px solid rgba(var(--v-border-color),.15)}
.proposal-table tbody tr:hover{background:rgba(var(--v-theme-on-surface),.035)}
.item-description,.item-muted{color:rgba(var(--v-theme-on-surface),.55)!important}
.empty-row{text-align:center;padding:20px!important;color:rgba(var(--v-theme-on-surface),.55)!important}
.qty-input{width:48px;height:26px;text-align:center;border:1px solid rgba(var(--v-border-color),.4);border-radius:4px;padding:2px 4px;font-size:11px;color:rgb(var(--v-theme-on-surface));background:rgb(var(--v-theme-surface))}
.qty-input:focus{outline:none;border-color:rgb(var(--v-theme-primary))}
.strike-row{opacity:.5;text-decoration:line-through}
.tags-card{background:rgba(var(--v-theme-on-surface),.025);border-color:rgba(var(--v-border-color),.25)!important}
.tags-inner{min-height:42px;display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:7px 10px}
.tags-title{display:flex;align-items:center;gap:5px;color:rgb(var(--v-theme-on-surface));font-size:11px;font-weight:700}
.tag-list{display:flex;flex-wrap:wrap;gap:4px}
.no-tags{color:rgba(var(--v-theme-on-surface),.55)!important;font-size:10px}
.totals-card{display:flex;align-items:center;justify-content:space-between;min-height:48px;padding:8px 12px;background:rgba(20,184,166,.06);border-color:rgba(20,184,166,.4)!important}
.totals-section{display:flex;align-items:center;gap:14px}
.totals-right{justify-content:flex-end}
.summary-stat{display:flex;align-items:center;gap:5px;font-size:10px;color:rgba(var(--v-theme-on-surface),.6)}
.summary-stat strong{font-size:12px;color:rgb(var(--v-theme-on-surface))}
.summary-divider{width:1px;height:22px;background:rgba(var(--v-border-color),.35)}
.allowance-summary{display:flex;align-items:center;gap:5px;font-size:10px;color:#b45309}
.allowance-summary strong{font-size:12px;color:#b45309}
.grand-total{display:flex;align-items:center;gap:6px}
.grand-total span{font-size:10px;color:rgba(var(--v-theme-on-surface),.6)}
.grand-total strong{font-size:16px;color:#0f766e}

@media(max-width:800px){
  .header-main{flex-direction:column;gap:8px}
  .proposal-info{text-align:left}
  .customer-grid{grid-template-columns:1fr}
  .room-total{display:none}
  .totals-card{align-items:flex-start;flex-direction:column;gap:8px}
  .totals-section{width:100%;flex-wrap:wrap}
  .totals-right{justify-content:flex-start}
}
@media(max-width:600px){
  .worksheet-card{padding:8px!important}
  .customer-row{grid-template-columns:80px 1fr}
  .tags-inner{align-items:flex-start;flex-direction:column}
  .totals-section{gap:8px}
}
</style>