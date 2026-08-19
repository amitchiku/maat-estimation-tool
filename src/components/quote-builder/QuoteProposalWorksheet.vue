<template>
  <div>
    <!-- Proposal Toolbar -->
    <v-card border elevation="0" class="rounded-xl pa-3 mb-4 bg-white">
      <div class="d-flex align-center justify-space-between flex-wrap gap-2">
        <div class="d-flex align-center">
          <v-btn
            variant="tonal"
            color="teal"
            size="small"
            class="text-none mr-2 font-weight-medium"
            @click="isHeaderCollapsed = !isHeaderCollapsed"
          >
            <v-icon :icon="isHeaderCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'" class="mr-1"></v-icon>
            {{ isHeaderCollapsed ? 'Expand Header' : 'Collapse Header' }}
          </v-btn>
          <span class="text-caption text-medium-emphasis">
            Toggle top proposal branding & customer information block
          </span>
        </div>

        <div class="d-flex align-center gap-2">
          <v-btn
            variant="tonal"
            color="blue"
            size="small"
            prepend-icon="mdi-printer"
            class="text-none font-weight-medium"
            @click="$emit('print')"
          >
            Print / Export PDF
          </v-btn>
          <v-btn
            color="teal"
            size="small"
            prepend-icon="mdi-content-save"
            class="text-none font-weight-bold glow-btn"
            @click="$emit('save')"
          >
            Save Proposal
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Worksheet Container (Image 1 & Image 2 Layout) -->
    <v-card border elevation="0" class="rounded-xl pa-6 bg-white worksheet-paper">
      <!-- Collapsible Proposal Header Block (Image 1) -->
      <v-expand-transition>
        <div v-show="!isHeaderCollapsed" class="proposal-header-block mb-6 pa-4 border rounded-lg bg-grey-lighten-5">
          <v-row density="compact" class="mb-4">
            <!-- Left Company Info -->
            <v-col cols="12" sm="7" md="8">
              <h1 class="text-h5 font-weight-bold text-slate-900 mb-1">
                {{ appStore.settings?.companyHeader?.companyName || 'Sycamore Design Build, Inc.' }}
              </h1>
              <div class="text-body-2 text-slate-700 whitespace-pre-line mb-1">
                {{ appStore.settings?.companyHeader?.address || '4427 Chestnut La. Rockville, MD 20853' }}
              </div>
              <div class="text-caption text-slate-600">
                Ph: {{ appStore.settings?.companyHeader?.phone || '(301) 924-9322' }} &nbsp;|&nbsp; {{ appStore.settings?.companyHeader?.mhic || 'MHIC 68498' }}
              </div>
            </v-col>

            <!-- Right Title & Dates -->
            <v-col cols="12" sm="5" md="4" class="text-sm-right">
              <h2 class="text-h4 font-weight-bold text-slate-800 mb-3">Proposal</h2>
              <div class="d-flex justify-sm-end align-center mb-1">
                <span class="text-caption font-weight-bold text-slate-700 mr-3">Date:</span>
                <span class="text-body-2 font-weight-medium">{{ quote.date || todayDate }}</span>
              </div>
              <div v-if="quote.dateOfLoss" class="d-flex justify-sm-end align-center">
                <span class="text-caption font-weight-bold text-slate-700 mr-3">Date of Loss:</span>
                <span class="text-body-2 font-weight-medium">{{ quote.dateOfLoss }}</span>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-3"></v-divider>

          <!-- Prepared For & Project Address Box -->
          <v-row density="compact">
            <!-- Prepared For -->
            <v-col cols="12" md="6">
              <v-card variant="flat" color="amber-lighten-5" class="pa-3 rounded border border-amber-lighten-3">
                <v-row density="compact" class="no-gutters">
                  <v-col cols="4" class="font-weight-bold text-caption text-slate-800">Prepared For:</v-col>
                  <v-col cols="8" class="font-weight-bold text-body-2 text-slate-900">{{ quote.clientName || 'Customer' }}</v-col>
                  <v-col cols="4" class="font-weight-bold text-caption text-slate-800">Address:</v-col>
                  <v-col cols="8" class="text-body-2 text-slate-800">{{ quote.clientStreet || 'Street Address' }}</v-col>
                  <v-col cols="4" class="font-weight-bold text-caption text-slate-800">City, State:</v-col>
                  <v-col cols="8" class="text-body-2 text-slate-800">{{ quote.clientCityState || 'City, State' }}</v-col>
                </v-row>
              </v-card>
            </v-col>

            <!-- Project Address -->
            <v-col cols="12" md="6">
              <v-card variant="flat" color="amber-lighten-5" class="pa-3 rounded border border-amber-lighten-3 fill-height">
                <v-row density="compact" class="no-gutters">
                  <v-col cols="4" class="font-weight-bold text-caption text-slate-800">Project Address:</v-col>
                  <v-col cols="8" class="text-body-2 text-slate-800">{{ quote.projectAddress || 'Same' }}</v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-3"></v-divider>

          <!-- Prepared By Footer -->
          <div class="d-flex align-center flex-wrap text-caption text-slate-800">
            <span class="font-weight-bold mr-2">Prepared By:</span>
            <span class="font-weight-medium mr-6">{{ quote.preparedBy || appStore.settings?.preparedBy?.name || 'M. Webb' }}</span>
            <span class="font-weight-bold mr-2">Ph:</span>
            <span class="font-weight-medium">{{ quote.preparedByPhone || appStore.settings?.preparedBy?.phone || '(301) 252-1355' }}</span>
          </div>
        </div>
      </v-expand-transition>

      <!-- Per-Room Collapsible Proposal Tables (Image 2) -->
      <div v-for="room in quoteRooms" :key="room.name" class="room-section mb-6">
        <!-- Room Collapsible Header Bar -->
        <div
          class="room-header-bar d-flex align-center justify-space-between px-4 py-2 bg-light-green-lighten-4 border rounded-t-lg cursor-pointer"
          @click="toggleRoomCollapse(room.name)"
        >
          <div class="d-flex align-center">
            <v-icon :icon="collapsedRooms[room.name] ? 'mdi-chevron-right' : 'mdi-chevron-down'" class="mr-2"></v-icon>
            <span class="text-subtitle-1 font-weight-bold text-slate-900">{{ room.name }}</span>
            <v-chip size="x-small" color="teal" class="ml-3 font-weight-medium">
              {{ room.items.length }} {{ room.items.length === 1 ? 'Item' : 'Items' }}
            </v-chip>
          </div>

          <!-- Per-Room Total & Allowance Summary -->
          <div class="text-caption font-weight-bold text-slate-800">
            =&gt; {{ room.name }} Subtotal: &nbsp;
            <span class="text-slate-900 font-weight-bold mr-3">Total ${{ formatMoney(getRoomTotals(room).total) }}</span>
            <span class="text-amber-darken-3 font-weight-bold">Allowance ${{ formatMoney(getRoomTotals(room).allowance) }}</span>
          </div>
        </div>

        <!-- Room Items Table -->
        <v-expand-transition>
          <div v-show="!collapsedRooms[room.name]" class="border-x border-b rounded-b-lg overflow-hidden">
            <v-table density="compact" class="proposal-table">
              <thead>
                <tr class="bg-light-green-lighten-3">
                  <th class="font-weight-bold">Description</th>
                  <th class="font-weight-bold text-center" style="width: 80px;">Qty</th>
                  <th class="font-weight-bold text-center" style="width: 80px;">U/M</th>
                  <th class="font-weight-bold text-right" style="width: 100px;">Base Price</th>
                  <th class="font-weight-bold text-right" style="width: 100px;">Unit Price</th>
                  <th class="font-weight-bold text-right" style="width: 110px;">Total</th>
                  <th class="font-weight-bold text-right" style="width: 110px;">Unit Allowance</th>
                  <th class="font-weight-bold text-right" style="width: 110px;">Allowance</th>
                  <th class="font-weight-bold text-center" style="width: 50px;">A</th>
                  <th class="font-weight-bold text-center" style="width: 60px;">Strike</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="room.items.length === 0">
                  <td colspan="10" class="text-center py-4 text-medium-emphasis">
                    No items in this room.
                  </td>
                </tr>
                <tr v-for="item in room.items" :key="item.id" :class="{ 'strike-row': item.isStruck }">
                  <td class="font-weight-medium py-2">
                    {{ item.name }}
                    <div v-if="item.desc" class="text-caption text-medium-emphasis">{{ item.desc }}</div>
                  </td>
                  <td class="text-center py-1">
                    <input
                      type="number"
                      min="1"
                      class="qty-inline-input"
                      :value="item.quantity"
                      @change="e => updateItemQty(item, e.target.value)"
                    />
                  </td>
                  <td class="text-center text-caption">{{ item.unit || 'each' }}</td>
                  <td class="text-right text-caption">${{ formatMoney(getItemPricing(item).basePrice) }}</td>
                  <td class="text-right font-weight-medium">${{ formatMoney(getItemPricing(item).unitPrice) }}</td>
                  <td class="text-right font-weight-bold">${{ formatMoney(getItemPricing(item).totalAmount) }}</td>
                  <td class="text-right text-caption">${{ formatMoney(getItemPricing(item).unitAllowance) }}</td>
                  <td class="text-right font-weight-bold text-amber-darken-3">
                    ${{ formatMoney(getItemPricing(item).allowanceAmount) }}
                  </td>
                  <!-- Column A (Allowance Toggle) -->
                  <td class="text-center">
                    <v-checkbox-btn
                      v-model="item.isAllowanceFull"
                      color="teal"
                      density="compact"
                    ></v-checkbox-btn>
                  </td>
                  <!-- Strike Column (Remove Item) -->
                  <td class="text-center">
                    <v-btn
                      icon="mdi-close"
                      size="x-small"
                      color="red"
                      variant="text"
                      title="Strike / Remove Item"
                      @click="removeItemFromRoom(room.name, item.id)"
                    ></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-expand-transition>
      </div>

      <!-- Tag Summary Box -->
      <v-card border elevation="0" class="rounded-lg pa-4 mb-6 bg-grey-lighten-5">
        <div class="text-subtitle-2 font-weight-bold text-slate-800 mb-2">
          <v-icon icon="mdi-tag-multiple-outline" color="teal" class="mr-1"></v-icon>
          Proposal Tag & Category Summary
        </div>
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="tg in tagSummaries"
            :key="tg.name"
            size="small"
            color="teal"
            variant="tonal"
            class="font-weight-medium"
          >
            {{ tg.name }}: {{ tg.count }} {{ tg.count === 1 ? 'Item' : 'Items' }} (${{ formatMoney(tg.total) }})
          </v-chip>
        </div>
      </v-card>

      <!-- Proposal Grand Totals Footer Box -->
      <v-card variant="flat" color="teal-lighten-5" class="pa-4 rounded-lg border border-teal-lighten-3">
        <v-row density="compact" class="align-center">
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Total Proposal Rooms: {{ quoteRooms.length }}</div>
            <div class="text-caption text-medium-emphasis">Total Selected Line Items: {{ totalProposalItemsCount }}</div>
          </v-col>
          <v-col cols="12" md="6" class="text-md-right">
            <div class="text-subtitle-1 font-weight-bold text-slate-800">
              Total Allowance Portion:
              <span class="text-amber-darken-3 font-weight-bold ml-2">${{ formatMoney(proposalTotals.allowance) }}</span>
            </div>
            <div class="text-h5 font-weight-bold text-teal-darken-3">
              Proposal Grand Total: ${{ formatMoney(proposalTotals.grandTotal) }}
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppStore } from '@/stores/app';

const props = defineProps({
  quote: {
    type: Object,
    required: true
  },
  selectedItemsMap: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['save', 'print', 'update:selectedItemsMap']);

const appStore = useAppStore();

const isHeaderCollapsed = ref(false);
const collapsedRooms = ref({});

const todayDate = new Date().toISOString().substring(0, 10);

const toggleRoomCollapse = (roomName) => {
  collapsedRooms.value[roomName] = !collapsedRooms.value[roomName];
};

const quoteRooms = computed(() => {
  const roomsMap = {};
  Object.values(props.selectedItemsMap).forEach(item => {
    const rm = item.assignedRoom || item.defaultRoom || 'General';
    if (!roomsMap[rm]) {
      roomsMap[rm] = { name: rm, items: [] };
    }
    roomsMap[rm].items.push(item);
  });
  return Object.values(roomsMap);
});

const getItemPricing = (item) => {
  const qty = parseFloat(item.quantity) || 1;
  const raw = item.rawAssembly || {};

  let baseVal = 0;
  let unitVal = 0;
  let unitAllow = 0;

  (raw.laborRequirements || []).forEach(r => {
    const role = appStore.getLaborById(r.classificationId) || { rate: r.rate || 0 };
    const rate = role.rate || 0;
    baseVal += (r.baseHours || 0) * rate;
    unitVal += (r.unitHours || 0) * rate;

    const mode = r.allowMode || 'None';
    if (mode === 'Both') unitAllow += (r.unitHours || 0) * rate;
  });

  (raw.materialRequirements || []).forEach(r => {
    const mat = appStore.getMaterialById(r.materialId) || { netPrice: r.price || 0 };
    const p = (mat.netPrice || 0) * (1 + (r.tax || 0.25)) * 1.25;
    unitVal += (r.qty || 0) * p;
    if (r.allow) unitAllow += (r.qty || 0) * p;
  });

  (raw.equipmentRequirements || []).forEach(r => {
    const eq = appStore.getEquipmentById(r.equipmentId) || { netPrice: r.price || 0 };
    const p = (eq.netPrice || 0) * (1 + (r.tax || 0.25)) * 1.25;
    unitVal += (r.qty || 0) * p;
    if (r.allow) unitAllow += (r.qty || 0) * p;
  });

  const totalAmount = (qty * unitVal) + baseVal;

  // Allowance formula per user requirement:
  // Default (isAllowanceFull false): Unit Allowance * Qty
  // If A is ticked (isAllowanceFull true): Total Amount = (Qty * Unit Price) + Base Price
  const allowanceAmount = item.isAllowanceFull ? totalAmount : (unitAllow * qty);

  return {
    basePrice: baseVal,
    unitPrice: unitVal,
    totalAmount,
    unitAllowance: unitAllow,
    allowanceAmount
  };
};

const getRoomTotals = (room) => {
  let total = 0;
  let allowance = 0;
  room.items.forEach(item => {
    const p = getItemPricing(item);
    total += p.totalAmount;
    allowance += p.allowanceAmount;
  });
  return { total, allowance };
};

const proposalTotals = computed(() => {
  let grandTotal = 0;
  let allowance = 0;
  quoteRooms.value.forEach(room => {
    const r = getRoomTotals(room);
    grandTotal += r.total;
    allowance += r.allowance;
  });
  return { grandTotal, allowance };
});

const totalProposalItemsCount = computed(() => {
  return Object.keys(props.selectedItemsMap).length;
});

const tagSummaries = computed(() => {
  const grps = {};
  Object.values(props.selectedItemsMap).forEach(item => {
    const g = item.group || item.category || 'General';
    if (!grps[g]) grps[g] = { name: g, count: 0, total: 0 };
    const p = getItemPricing(item);
    grps[g].count += 1;
    grps[g].total += p.totalAmount;
  });
  return Object.values(grps);
});

const updateItemQty = (item, val) => {
  const q = Math.max(1, parseFloat(val) || 1);
  const next = { ...props.selectedItemsMap };
  if (next[item.id]) {
    next[item.id].quantity = q;
    emit('update:selectedItemsMap', next);
  }
};

const removeItemFromRoom = (roomName, itemId) => {
  const next = { ...props.selectedItemsMap };
  delete next[itemId];
  emit('update:selectedItemsMap', next);
};

const formatMoney = (val) => {
  return (parseFloat(val) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>

<style scoped>
.qty-inline-input {
  width: 54px;
  text-align: center;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 0.875rem;
}
.strike-row {
  opacity: 0.5;
  text-decoration: line-through;
}
.whitespace-pre-line {
  white-space: pre-line;
}
.worksheet-paper {
  background-color: #ffffff;
}
</style>
