<template>
  <div class="printable-area pa-8">
    <!-- Estimate Cover Header -->
    <v-row class="mb-8 border-b pb-6 align-center">
      <v-col cols="6">
        <h1 class="text-h4 font-weight-bold text-teal-darken-3">CONSTRUCTION ESTIMATE</h1>
        <div class="text-subtitle-1 text-medium-emphasis">Proposal & Scope of Work</div>
      </v-col>
      <v-col cols="6" class="text-right">
        <h2 class="text-h6 font-weight-bold">Estimating Engine Corp</h2>
        <div class="text-caption">123 Construction Lane, Suite A</div>
        <div class="text-caption">office@estimatingengine.com | (555) 019-2834</div>
      </v-col>
    </v-row>

    <!-- Estimate Metadata Info -->
    <v-row class="mb-8 bg-grey-lighten-4 pa-4 rounded-lg">
      <v-col cols="6">
        <div class="text-caption text-uppercase text-medium-emphasis font-weight-bold">Prepared For:</div>
        <div class="text-subtitle-1 font-weight-bold">{{ quote.clientName || 'Valued Client' }}</div>
        <div class="text-caption">Project: <strong>{{ quote.name }}</strong></div>
      </v-col>
      <v-col cols="6" class="text-right">
        <div class="text-caption text-uppercase text-medium-emphasis font-weight-bold">Proposal Details:</div>
        <div class="text-subtitle-1 font-weight-bold">No. {{ quote.id }}</div>
        <div class="text-caption">Date: {{ formatDate(quote.date) }}</div>
        <div class="text-caption">Status: <strong>{{ quote.status }}</strong></div>
      </v-col>
    </v-row>

    <!-- Room Breakdown -->
    <div v-for="room in quote.rooms" :key="room.id" class="mb-8 print-avoid-break">
      <h3 class="text-h6 font-weight-bold text-teal-darken-2 border-b pb-1 mb-3">
        Space: {{ room.name }}
      </h3>

      <table class="print-table mb-4">
        <thead>
          <tr>
            <th>Item Name & Description</th>
            <th class="text-center" style="width: 80px;">Qty</th>
            <th style="width: 80px;">Unit</th>
            <th class="text-right" style="width: 120px;">Unit Price</th>
            <th class="text-right" style="width: 120px;">Total Price</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="room.items.length === 0">
            <td colspan="5" class="text-center text-medium-emphasis">No items assigned to this space.</td>
          </tr>
          <tr v-for="item in room.items" :key="item.id">
            <td>
              <div class="font-weight-medium">
                {{ item.name }}
                <v-chip v-if="item.isAllowance || (item.type === 'assembly' && hasAllowanceRequirements(item))" size="x-small" color="teal" variant="flat" class="ml-2">
                  Allowance
                </v-chip>
              </div>
              <div v-if="item.description" class="text-caption text-medium-emphasis">{{ item.description }}</div>
            </td>
            <td class="text-center">{{ item.quantity }}</td>
            <td>{{ item.unit }}</td>
            <td class="text-right">${{ formatMoney(getItemUnitPrice(item)) }}</td>
            <td class="text-right font-weight-bold">${{ formatMoney(getItemTotalPrice(item)) }}</td>
          </tr>
          <tr class="bg-grey-lighten-5 font-weight-bold">
            <td colspan="4" class="text-right">Space Subtotal:</td>
            <td class="text-right text-teal-darken-3">${{ formatMoney(roomSubtotal(room.id)) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Grand Summary Section -->
    <div class="print-avoid-break mt-12 pt-6 border-t-2">
      <v-row class="justify-end">
        <v-col cols="6" offset="6" md="4" offset-md="8">
          <v-card class="pa-4 bg-grey-lighten-4" border>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-medium-emphasis">Materials Allowance Limit:</span>
              <span class="font-weight-medium">${{ formatMoney(totals.allowanceTotal) }}</span>
            </div>
            <div class="d-flex justify-space-between mb-4 border-b pb-2">
              <span class="text-medium-emphasis">Trade Markups & Taxes:</span>
              <span class="text-caption text-medium-emphasis">Included</span>
            </div>
            <div class="d-flex justify-space-between align-center font-weight-bold text-h6 text-teal-darken-3">
              <span>Grand Total:</span>
              <span>${{ formatMoney(totals.clientPrice) }}</span>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Sign-off Block -->
    <div class="print-avoid-break mt-16">
      <h4 class="text-subtitle-1 font-weight-bold mb-6 border-b pb-1">Acceptance of Proposal</h4>
      <p class="text-caption mb-12">
        The specifications, pricing, and conditions outlined in this proposal are satisfactory and are hereby accepted. The contractor is authorized to perform the work specified. Payment terms will be executed in accordance with standard project guidelines.
      </p>
      
      <v-row class="mt-8">
        <v-col cols="6">
          <div style="border-top: 1px solid #000; width: 80%; margin-top: 40px;" class="mb-2"></div>
          <div class="text-subtitle-2 font-weight-bold">Contractor Representative</div>
          <div class="text-caption">Date: ________________________</div>
        </v-col>
        <v-col cols="6" class="text-right d-flex flex-column align-end">
          <div style="border-top: 1px solid #000; width: 80%; margin-top: 40px;" class="mb-2"></div>
          <div class="text-subtitle-2 font-weight-bold">Client Signature</div>
          <div class="text-caption">Date: ________________________</div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAppStore, calculateAssemblyTotals } from '@/stores/app';

const props = defineProps({
  quote: {
    type: Object,
    required: true
  }
});

const appStore = useAppStore();
const totals = computed(() => appStore.quoteTotals);

const roomSubtotal = (roomId) => {
  return appStore.roomTotals(roomId).clientPrice;
};

const getItemUnitPrice = (item) => {
  if (item.allowanceOverride !== null && item.allowanceOverride !== undefined && item.allowanceOverride !== '') {
    return parseFloat(item.allowanceOverride) / (parseFloat(item.quantity) || 1);
  }

  if (item.type === 'assembly') {
    const qty = parseFloat(item.quantity) || 1;
    const totals = calculateAssemblyTotals(item.assemblyData, qty);
    return totals.clientPrice / qty;
  }

  const net = parseFloat(item.netCost) || 0;
  const tax = parseFloat(item.taxRate) || 0;
  const markup = parseFloat(item.markup) || 0;
  return net * (1 + tax) * (1 + markup);
};

const getItemTotalPrice = (item) => {
  if (item.allowanceOverride !== null && item.allowanceOverride !== undefined && item.allowanceOverride !== '') {
    return parseFloat(item.allowanceOverride);
  }

  const qty = parseFloat(item.quantity) || 0;
  if (item.type === 'assembly') {
    return calculateAssemblyTotals(item.assemblyData, qty).clientPrice;
  }

  return getItemUnitPrice(item) * qty;
};

const hasAllowanceRequirements = (item) => {
  if (!item.assemblyData) return false;
  const mats = item.assemblyData.materialRequirements || [];
  const eqs = item.assemblyData.equipmentRequirements || [];
  const lbs = item.assemblyData.laborRequirements || [];
  return mats.some(m => m.allow) || eqs.some(e => e.allow) || lbs.some(l => l.allow);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '---';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatMoney = (val) => {
  return (parseFloat(val) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>

<style scoped>
/* Scoped overrides to guarantee printing style constraints */
.printable-area {
  display: none;
}

@media print {
  .printable-area {
    display: block !important;
  }
}
</style>
