<template>
  <div>
    <!-- Page Header (When viewing catalog table) -->
    <v-row class="mb-2 align-center" v-if="!isEditingLineItem">
      <v-col cols="12">
        <span class="text-title-large font-weight-medium text-medium-emphasis">Master Line Items Builder</span>
      </v-col>
    </v-row>

    <!-- Active Line Item Editor Workspace -->
    <div v-if="isEditingLineItem">
      <!-- Editor Controls Banner -->
      <div class="d-flex align-center justify-space-between py-1 mb-3">
        <div class="d-flex align-center">
          <v-btn icon="mdi-arrow-left" variant="text" density="comfortable" class="mr-2"
            @click="exitLineItemEditor"></v-btn>
          <span class="text-body-1 text-medium-emphasis">
            {{ lineItemForm.id ? 'Edit Line Item (' + lineItemForm.id + ')' : 'Create New Line Item' }}
          </span>
        </div>
        <div>
          <v-btn prepend-icon="mdi-content-save" color="teal" size="large"
            class="glow-btn font-weight-bold px-6 text-none" elevation="2" @click="saveLineItem">
            Save Line Item
          </v-btn>
        </div>
      </div>

      <v-row>
        <!-- Left Side Editor (Form Settings + Requirements Tables - 75% width) -->
        <v-col cols="12" md="9">
          <!-- Metadata Settings Card -->
          <LineItemFormSettings v-model="lineItemForm" :categories="categories" />

          <!-- Requirements Editor (Labor, Materials, Equipment Tabs) -->
          <LineItemRequirementsEditor v-model="lineItemForm" />
        </v-col>

        <!-- Right Side Pricing Breakdown Column (Sticky) -->
        <v-col cols="12" md="3">
          <!-- Total Output Qty & Sample Description Card -->
          <v-card border elevation="0" class="mb-3 rounded-lg pa-3 bg-white">
            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-2"
              style="letter-spacing: 0.05em;">
              Output Batch Quantity
            </div>
            <v-row density="compact">
              <v-col cols="12">
                <v-text-field v-model.number="lineItemForm.totalOutputQty" type="number" label="Total Output Qty *"
                  variant="outlined" density="compact" hide-details="auto" min="1"
                  :rules="[v => (v !== null && v !== undefined && v !== '' && Number(v) > 0) || 'Mandatory (>0)']"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="lineItemForm.sampleDesc" label="Sample Description" variant="outlined"
                  density="compact" rows="2" hide-details="auto"></v-textarea>
              </v-col>
            </v-row>
          </v-card>

          <LineItemPricingSummary :form="lineItemForm" :line-item-summary="lineItemSummary" />
        </v-col>
      </v-row>
    </div>

    <!-- Catalog List Table View -->
    <div v-else>
      <LineItemsList :line-items="appStore.lineItems" @create="openAddLineItem" @edit="editLineItem"
        @delete="executeDeleteLineItem" />
    </div>

    <!-- Validation Warning Snackbar -->
    <v-snackbar v-model="showSnackbar" color="amber-darken-4" timeout="5000" location="top" elevation="6">
      <div class="d-flex align-center font-weight-medium text-body-2">
        <v-icon icon="mdi-alert-circle-outline" class="mr-2"></v-icon>
        <span>{{ saveWarning }}</span>
      </div>
      <template #actions>
        <v-btn variant="text" size="small" color="white" @click="showSnackbar = false">Dismiss</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppStore } from '@/stores/app';

import LineItemsList from '@/components/line-items/LineItemsList.vue';
import LineItemFormSettings from '@/components/line-items/LineItemFormSettings.vue';
import LineItemRequirementsEditor from '@/components/line-items/LineItemRequirementsEditor.vue';
import LineItemPricingSummary from '@/components/line-items/LineItemPricingSummary.vue';

const appStore = useAppStore();

const isEditingLineItem = ref(false);

const lineItemForm = ref({
  id: '',
  category: '',
  group: '',
  name: '',
  desc: '',
  sampleDesc: '',
  totalOutputQty: 1,
  activity: 'Supply & Install',
  acctCode: '4100 - Contract Work - Flat rate',
  unitType: 'each',
  costType: 'Contract Work',
  defaultRoom: 'Hallway',
  defaultQty: 1,
  tradePartner: 'In-House',
  url: '',
  tag: '',
  laborRequired: [],
  materialRequired: [],
  equipmentRequired: []
});

const categories = computed(() => appStore.settings?.categories || [
  'Doors - Interior',
  'Doors - Exterior',
  'Windows',
  'Trim & Millwork',
  'Hardware',
  'Drywall & Framing',
  'Paint & Finish',
  'Flooring',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Cabinets & Tops',
  'Demolition',
  'Site Prep & Cleanup'
]);

// Real-time calculation rollup
const lineItemSummary = computed(() => {
  const summary = {
    labor: { base: 0, unit: 0, allowance: 0 },
    materials: { base: 0, unit: 0, allowance: 0 },
    equipment: { base: 0, unit: 0, allowance: 0 },
    total: { base: 0, unit: 0, allowance: 0 }
  };

  if (!lineItemForm.value) return summary;

  // Labor
  lineItemForm.value.laborRequired.forEach(req => {
    const role = appStore.getLaborById(req.classId);
    if (!role) return;

    const baseVal = req.baseHours * role.rate;
    const unitVal = req.unitHours * role.rate;

    summary.labor.base += baseVal;
    summary.labor.unit += unitVal;

    const mode = String(req.allowMode || 'NONE').toUpperCase();
    if (mode === 'BOTH') {
      summary.labor.allowance += baseVal + unitVal;
    } else if (mode === 'UNIT' || mode === 'ONLY UNIT HR') {
      summary.labor.allowance += unitVal;
    } else if (mode === 'BASE' || mode === 'ONLY BASE HR') {
      summary.labor.allowance += baseVal;
    }
  });

  // Materials: Tax default 6%, Markup default 25%
  // Allowance Price = Price + Tax
  // Gross Price = Price + Tax + Markup
  lineItemForm.value.materialRequired.forEach(req => {
    const mat = appStore.getMaterialById(req.materialId);
    if (!mat) return;

    const price = parseFloat(mat.netPrice) || 0;
    const taxRate = mat.tax !== undefined ? mat.tax : 0.06;
    const markupRate = mat.markup !== undefined ? mat.markup : 0.25;

    const allowancePrice = price * (1 + taxRate);
    const grossPrice = allowancePrice * (1 + markupRate);

    const qty = parseFloat(req.qty) || 0;
    const baseVal = req.base ? qty * grossPrice : 0;
    const unitVal = !req.base ? qty * grossPrice : 0;
    const allowVal = req.allow ? (req.base ? qty * allowancePrice : qty * allowancePrice) : 0;

    summary.materials.base += baseVal;
    summary.materials.unit += unitVal;
    summary.materials.allowance += allowVal;
  });

  // Equipment: Tax default 0%, Markup default 25%
  // Allowance Price = Price + Tax
  // Gross Price = Price + Tax + Markup
  lineItemForm.value.equipmentRequired.forEach(req => {
    const eq = appStore.getEquipmentById(req.equipmentId);
    if (!eq) return;

    const eqTax = eq.tax !== undefined ? eq.tax : 0.0;
    const eqMarkup = eq.markup !== undefined ? eq.markup : 0.25;
    const allowancePrice = eq.netPrice * (1 + eqTax);
    const grossPrice = allowancePrice * (1 + eqMarkup);

    const qty = req.qty || 1;
    const grossVal = qty * grossPrice;
    const allowVal = req.allow ? qty * allowancePrice : 0;

    if (req.base) {
      summary.equipment.base += grossVal;
    } else {
      summary.equipment.unit += grossVal;
    }

    summary.equipment.allowance += allowVal;
  });

  // Combined Totals
  summary.total.base = summary.labor.base + summary.materials.base + summary.equipment.base;
  summary.total.unit = summary.labor.unit + summary.materials.unit + summary.equipment.unit;
  summary.total.allowance = summary.labor.allowance + summary.materials.allowance + summary.equipment.allowance;

  return summary;
});

// Form Actions
const openAddLineItem = () => {
  lineItemForm.value = {
    id: '',
    category: '',
    group: '',
    name: '',
    desc: '',
    sampleDesc: '',
    totalOutputQty: 1,
    activity: 'Supply & Install',
    acctCode: '4100 - Contract Work - Flat rate',
    unitType: 'each',
    costType: 'Contract Work',
    defaultRoom: 'Hallway',
    defaultQty: 1,
    tradePartner: 'In-House',
    url: '',
    tag: '',
    laborRequired: [],
    materialRequired: [],
    equipmentRequired: []
  };
  isEditingLineItem.value = true;
};

const editLineItem = (item) => {
  const form = JSON.parse(JSON.stringify(item));
  if (form.laborRequired) {
    form.laborRequired.forEach(req => {
      req.allowMode = req.allowMode || 'None';
    });
  }
  lineItemForm.value = form;
  isEditingLineItem.value = true;
};

const saveWarning = ref('');
const showSnackbar = ref(false);

const saveLineItem = async () => {
  saveWarning.value = '';

  if (!lineItemForm.value.name || !lineItemForm.value.name.trim()) {
    saveWarning.value = 'Please enter a Line Item Proposal Name before saving.';
    showSnackbar.value = true;
    return;
  }

  if (!lineItemForm.value.category || !String(lineItemForm.value.category).trim()) {
    saveWarning.value = 'Please select or enter a Category before saving.';
    showSnackbar.value = true;
    return;
  }

  const q = parseFloat(lineItemForm.value.totalOutputQty);
  if (isNaN(q) || q <= 0) {
    saveWarning.value = 'Total Output Quantity must be greater than 0.';
    showSnackbar.value = true;
    return;
  }

  const hasLabor = (lineItemForm.value.laborRequired || []).length > 0;
  const hasMaterial = (lineItemForm.value.materialRequired || []).length > 0;
  const hasEquipment = (lineItemForm.value.equipmentRequired || []).length > 0;

  if (!hasLabor && !hasMaterial && !hasEquipment) {
    saveWarning.value = 'At least one Labor, Material, or Equipment requirement must be added before saving.';
    showSnackbar.value = true;
    return;
  }

  const updatedItem = { ...lineItemForm.value };
  const now = new Date().toISOString();

  if (!updatedItem.id) {
    updatedItem.id = `I${appStore.lineItems.length + 1}`;
    updatedItem.createdAt = now;
    updatedItem.updatedAt = now;
    appStore.lineItems.push(updatedItem);
  } else {
    updatedItem.updatedAt = now;
    if (!updatedItem.createdAt) updatedItem.createdAt = now;
    const idx = appStore.lineItems.findIndex(a => a.id === updatedItem.id);
    if (idx !== -1) {
      appStore.lineItems[idx] = updatedItem;
    }
  }

  try {
    await appStore.upsertCatalog('lineItems', appStore.lineItems);
    isEditingLineItem.value = false;
  } catch (err) {
    appStore.error = `Error saving line item: ${err.message}`;
  }
};

const executeDeleteLineItem = async (itemToDelete) => {
  if (itemToDelete) {
    appStore.lineItems = appStore.lineItems.filter(a => a.id !== itemToDelete.id);
    try {
      await appStore.upsertCatalog('lineItems', appStore.lineItems);
    } catch (err) {
      appStore.error = `Error deleting line item: ${err.message}`;
    }
  }
};

const exitLineItemEditor = () => {
  isEditingLineItem.value = false;
};
</script>
