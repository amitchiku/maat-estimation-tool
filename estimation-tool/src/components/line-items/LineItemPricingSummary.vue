<template>
  <v-card border elevation="0" class="position-sticky" style="top: 20px; z-index: 2;">
    <v-card-title class="d-flex align-center justify-space-between pa-4 pb-3">
      <div>
        <div
          class="text-subtitle-2 font-weight-bold text-medium-emphasis text-uppercase"
          style="letter-spacing: 0.05em;"
        >
          Pricing Breakdown
        </div>
        <div class="text-caption text-medium-emphasis font-weight-regular mt-0.5">
          Calculated Per Unit
        </div>
      </div>
      <v-chip size="x-small" color="teal" variant="tonal" class="font-weight-bold">
        1 {{ form.unitType || 'Unit' }}
      </v-chip>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-3">
      <!-- Calculations breakdown table -->
      <div class="rounded border border-grey-lighten-2 overflow-hidden mb-4">
        <v-table density="compact" class="summary-table">
          <thead>
            <tr class="bg-grey-lighten-4">
              <th class="pl-2 py-2 text-caption text-uppercase font-weight-bold text-medium-emphasis" style="width: 28%;">
                Category
              </th>
              <th class="text-right px-1 py-2 text-caption text-uppercase font-weight-bold text-medium-emphasis" style="width: 24%;">
                Base
              </th>
              <th class="text-right px-1 py-2 text-caption text-uppercase font-weight-bold text-medium-emphasis" style="width: 24%;">
                Unit
              </th>
              <th class="text-right pr-2 py-2 text-caption text-uppercase font-weight-bold text-medium-emphasis" style="width: 24%;">
                Allow.
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b">
              <td class="font-weight-medium pl-2 py-2 text-caption">Labor</td>
              <td class="text-right px-1 py-2 text-caption text-nowrap">{{ formatPerQty(lineItemSummary.labor.base) }}</td>
              <td class="text-right px-1 py-2 text-caption text-nowrap">{{ formatPerQty(lineItemSummary.labor.unit) }}</td>
              <td class="text-right pr-2 py-2 text-caption text-medium-emphasis text-nowrap">
                {{ formatPerQty(lineItemSummary.labor.allowance) }}
              </td>
            </tr>
            <tr class="border-b">
              <td class="font-weight-medium pl-2 py-2 text-caption">Materials</td>
              <td class="text-right px-1 py-2 text-caption text-nowrap">{{ formatPerQty(lineItemSummary.materials.base) }}</td>
              <td class="text-right px-1 py-2 text-caption text-nowrap">{{ formatPerQty(lineItemSummary.materials.unit) }}</td>
              <td class="text-right pr-2 py-2 text-caption text-medium-emphasis text-nowrap">
                {{ formatPerQty(lineItemSummary.materials.allowance) }}
              </td>
            </tr>
            <tr class="border-b">
              <td class="font-weight-medium pl-2 py-2 text-caption">Equipment</td>
              <td class="text-right px-1 py-2 text-caption text-nowrap">{{ formatPerQty(lineItemSummary.equipment.base) }}</td>
              <td class="text-right px-1 py-2 text-caption text-nowrap">{{ formatPerQty(lineItemSummary.equipment.unit) }}</td>
              <td class="text-right pr-2 py-2 text-caption text-medium-emphasis text-nowrap">
                {{ formatPerQty(lineItemSummary.equipment.allowance) }}
              </td>
            </tr>
            <tr class="bg-teal-lighten-5 font-weight-bold">
              <td class="pl-2 py-2.5 text-caption font-weight-bold">Total</td>
              <td class="text-right px-1 py-2.5 text-caption text-nowrap">{{ formatPerQty(lineItemSummary.total.base) }}</td>
              <td class="text-right text-teal-darken-3 px-1 py-2.5 text-caption text-nowrap">
                {{ formatPerQty(lineItemSummary.total.unit) }}
              </td>
              <td class="text-right text-indigo-darken-3 pr-2 py-2.5 text-caption text-nowrap">
                {{ formatPerQty(lineItemSummary.total.allowance) }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <!-- Solid High-Contrast Total Callout Container -->
      <div class="bg-teal-darken-3 text-white rounded-lg pa-4 elevation-1 text-center">
        <div class="text-caption text-uppercase font-weight-medium" style="letter-spacing: 0.05em; opacity: 0.9;">
          Total Composite Price
        </div>
        <div class="text-h4 font-weight-bold my-1">
          {{ heroCompositePrice }}
        </div>
        <div class="text-caption" style="opacity: 0.85;">per {{ form.unitType || 'unit' }}</div>
      </div>

      <!-- Calculation Info / Math Hint -->
      <div class="d-flex align-center justify-center mt-3 text-caption text-medium-emphasis cursor-pointer">
        <v-icon icon="mdi-information-outline" size="x-small" class="mr-1"></v-icon>
        <span>
          Base ({{ formatPerQty(lineItemSummary.total.base) }}) + Unit ({{ formatPerQty(lineItemSummary.total.unit) }}) = {{ heroCompositePrice }}
        </span>
        <v-tooltip activator="parent" location="bottom">
          Per-unit breakdown for {{ form.totalOutputQty || 1 }} {{ form.unitType || 'unit' }}(s). Batch Total = ${{ formatMoney(lineItemSummary.total.base + lineItemSummary.total.unit) }}
        </v-tooltip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  lineItemSummary: {
    type: Object,
    required: true
  }
});

const formatMoney = (val) => {
  return (parseFloat(val) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatPerQty = (val) => {
  const q = parseFloat(props.form.totalOutputQty);
  if (!q || isNaN(q) || q <= 0) return '-';
  return '$' + formatMoney(val / q);
};

const heroCompositePrice = computed(() => {
  const q = parseFloat(props.form.totalOutputQty);
  if (!q || isNaN(q) || q <= 0) return '-';
  const totalComposite = props.lineItemSummary.total.base + props.lineItemSummary.total.unit;
  return '$' + formatMoney(totalComposite / q);
});
</script>

<style scoped>
.summary-table th,
.summary-table td {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}
</style>
