<template>
  <v-card border elevation="0">
    <v-tabs v-model="editorTab" color="teal">
      <v-tab value="labor">
        Labor Required
        <v-chip size="x-small" class="ml-2 font-weight-bold" color="teal" variant="flat">
          {{ form.laborRequirements.length }}
        </v-chip>
      </v-tab>
      <v-tab value="materials">
        Materials Requirements
        <v-chip size="x-small" class="ml-2 font-weight-bold" color="teal" variant="flat">
          {{ form.materialRequirements.length }}
        </v-chip>
      </v-tab>
      <v-tab value="equipment">
        Equipment Requirements
        <v-chip size="x-small" class="ml-2 font-weight-bold" color="teal" variant="flat">
          {{ form.equipmentRequirements.length }}
        </v-chip>
      </v-tab>
    </v-tabs>

    <v-window v-model="editorTab" class="px-4 pt-4 pb-2">
      <!-- Labor Inputs -->
      <v-window-item value="labor">
        <v-row class="align-center mb-4">
          <v-col cols="12" sm="8">
            <v-select v-model="selectedLabor" label="Select Labor Role" :items="appStore.labor" item-title="name"
              return-object variant="outlined" density="compact" hide-details
              :input-props="{ autocomplete: 'off', autoCorrect: 'off', spellCheck: 'false' }"></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn prepend-icon="mdi-plus" color="teal" block :disabled="!selectedLabor" @click="addLaborRequirement">
              Add Labor Role
            </v-btn>
          </v-col>
        </v-row>

        <v-table density="compact">
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Rate</th>
              <th class="text-center" style="width: 125px;">Unit Hours</th>
              <th class="text-center" style="width: 125px;">Base Hours</th>
              <th class="text-right">Total</th>
              <th class="text-center" style="width: 165px;">Allowance</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="form.laborRequirements.length === 0">
              <td colspan="7" class="text-center py-4 text-medium-emphasis">No labor roles added yet.</td>
            </tr>
            <tr v-for="(req, idx) in form.laborRequirements" :key="req.classificationId">
              <td>{{ getLaborName(req.classificationId) }}</td>
              <td>${{ getLaborRate(req.classificationId) }}/hr</td>
              <td>
                <v-text-field v-model.number="req.unitHours" type="number" variant="outlined" density="compact"
                  hide-details class="ghost-cell-input"></v-text-field>
              </td>
              <td>
                <v-text-field v-model.number="req.baseHours" type="number" variant="outlined" density="compact"
                  hide-details class="ghost-cell-input"></v-text-field>
              </td>
              <td class="text-right font-weight-medium">
                ${{ formatMoney((req.unitHours + req.baseHours) * getLaborRate(req.classificationId)) }}
              </td>
              <td class="text-center">
                <select v-model="req.allowMode" class="ghost-cell-native-select mx-auto">
                  <option value="NONE">None</option>
                  <option value="UNIT">Only Unit Hr</option>
                  <option value="BASE">Only Base Hr</option>
                  <option value="BOTH">Both</option>
                </select>
              </td>
              <td class="text-center">
                <v-btn
                  icon="mdi-delete"
                  variant="flat"
                  color="red-lighten-5"
                  size="small"
                  density="comfortable"
                  class="text-red-darken-1 rounded-lg"
                  @click="form.laborRequirements.splice(idx, 1)"
                ></v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-window-item>

      <!-- Materials Requirements -->
      <v-window-item value="materials">
        <v-row class="align-center mb-4">
          <v-col cols="12" sm="8">
            <v-autocomplete v-model="selectedMaterial" label="Select Material Catalog Item" :items="appStore.materials"
              item-title="name" return-object variant="outlined" density="compact" hide-details
              :input-props="{ autocomplete: 'off', autoCorrect: 'off', spellCheck: 'false' }"></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn prepend-icon="mdi-plus" color="teal" block :disabled="!selectedMaterial"
              @click="addMaterialRequirement">
              Add Material
            </v-btn>
          </v-col>
        </v-row>

        <v-table density="compact">
          <thead>
            <tr>
              <th>Material</th>
              <th class="text-right">Net Price</th>
              <th class="text-center" style="width: 110px;">Required Qty</th>
              <th class="text-center">Base Flat?</th>
              <th class="text-right">Allowance</th>
              <th class="text-center">Use Allowance?</th>
              <th class="text-right">Gross Total</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="form.materialRequirements.length === 0">
              <td colspan="8" class="text-center py-4 text-medium-emphasis">No materials added yet.</td>
            </tr>
            <tr v-for="(req, idx) in form.materialRequirements" :key="req.materialId">
              <td class="font-weight-medium">{{ getMaterialName(req.materialId) }}</td>
              <td class="text-right">${{ formatMoney(appStore.getMaterialById(req.materialId)?.netPrice || 0) }}</td>
              <td>
                <v-text-field v-model.number="req.qty" type="number" variant="outlined" density="compact" hide-details
                  class="ghost-cell-input"></v-text-field>
              </td>
              <td class="text-center">
                <div class="d-flex justify-center align-center">
                  <v-checkbox-btn v-model="req.base" color="blue" class="ma-0"></v-checkbox-btn>
                </div>
              </td>
              <td class="text-right font-weight-medium text-amber-darken-3">
                ${{ formatMoney((req.qty || 1) * getMaterialAllowancePrice(req.materialId)) }}
              </td>
              <td class="text-center">
                <div class="d-flex justify-center align-center">
                  <v-checkbox-btn v-model="req.allow" color="teal" class="ma-0"></v-checkbox-btn>
                </div>
              </td>
              <td class="text-right font-weight-bold text-teal">
                ${{ formatMoney((req.qty || 1) * getMaterialGrossPrice(req.materialId)) }}
              </td>
              <td class="text-center">
                <v-btn
                  icon="mdi-delete"
                  variant="flat"
                  color="red-lighten-5"
                  size="small"
                  density="comfortable"
                  class="text-red-darken-1 rounded-lg"
                  @click="form.materialRequirements.splice(idx, 1)"
                ></v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-window-item>

      <!-- Equipment Requirements -->
      <v-window-item value="equipment">
        <v-row class="align-center mb-4">
          <v-col cols="12" sm="8">
            <v-autocomplete v-model="selectedEquipment" label="Select Equipment Catalog Rental"
              :items="appStore.equipment" item-title="name" return-object variant="outlined" density="compact"
              hide-details :input-props="{ autocomplete: 'off', autoCorrect: 'off', spellCheck: 'false' }"></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn prepend-icon="mdi-plus" color="teal" block :disabled="!selectedEquipment"
              @click="addEquipmentRequirement">
              Add Equipment
            </v-btn>
          </v-col>
        </v-row>

        <v-table density="compact">
          <thead>
            <tr>
              <th>Equipment</th>
              <th class="text-right">Net Price</th>
              <th class="text-center" style="width: 110px;">Required Qty</th>
              <th class="text-center">Base Flat?</th>
              <th class="text-right">Allowance</th>
              <th class="text-center">Use Allowance?</th>
              <th class="text-right">Gross Total</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="form.equipmentRequirements.length === 0">
              <td colspan="8" class="text-center py-4 text-medium-emphasis">No equipment added yet.</td>
            </tr>
            <tr v-for="(req, idx) in form.equipmentRequirements" :key="req.equipmentId">
              <td class="font-weight-medium">{{ getEquipmentName(req.equipmentId) }}</td>
              <td class="text-right">${{ formatMoney(appStore.getEquipmentById(req.equipmentId)?.netPrice || 0) }}</td>
              <td>
                <v-text-field v-model.number="req.qty" type="number" variant="outlined" density="compact" hide-details
                  class="ghost-cell-input"></v-text-field>
              </td>
              <td class="text-center">
                <div class="d-flex justify-center align-center">
                  <v-checkbox-btn v-model="req.base" color="blue" class="ma-0"></v-checkbox-btn>
                </div>
              </td>
              <td class="text-right font-weight-medium text-amber-darken-3">
                ${{ formatMoney((req.qty || 1) * getEquipmentAllowancePrice(req.equipmentId)) }}
              </td>
              <td class="text-center">
                <div class="d-flex justify-center align-center">
                  <v-checkbox-btn v-model="req.allow" color="teal" class="ma-0"></v-checkbox-btn>
                </div>
              </td>
              <td class="text-right font-weight-bold text-teal">
                ${{ formatMoney((req.qty || 1) * getEquipmentGrossPrice(req.equipmentId)) }}
              </td>
              <td class="text-center">
                <v-btn
                  icon="mdi-delete"
                  variant="flat"
                  color="red-lighten-5"
                  size="small"
                  density="comfortable"
                  class="text-red-darken-1 rounded-lg"
                  @click="form.equipmentRequirements.splice(idx, 1)"
                ></v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppStore } from '@/stores/app';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const appStore = useAppStore();
const editorTab = ref('labor');

const selectedLabor = ref(null);
const selectedMaterial = ref(null);
const selectedEquipment = ref(null);

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const formatMoney = (val) => {
  return (parseFloat(val) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Labor Helpers
const getLaborName = (id) => appStore.getLaborById(id)?.name || 'Unknown Role';
const getLaborRate = (id) => appStore.getLaborById(id)?.rate || 0;

// Material Helpers
const getMaterialName = (id) => appStore.getMaterialById(id)?.name || 'Unknown Material';
const getMaterialAllowancePrice = (id) => {
  const item = appStore.getMaterialById(id);
  if (!item) return 0;
  const tax = item.tax !== undefined ? item.tax : 0.06;
  return item.netPrice * (1 + tax);
};
const getMaterialGrossPrice = (id) => {
  const item = appStore.getMaterialById(id);
  if (!item) return 0;
  const tax = item.tax !== undefined ? item.tax : 0.06;
  const markup = item.markup !== undefined ? item.markup : 0.25;
  return item.netPrice * (1 + tax) * (1 + markup);
};

// Equipment Helpers
const getEquipmentName = (id) => appStore.getEquipmentById(id)?.name || 'Unknown Equipment';
const getEquipmentAllowancePrice = (id) => {
  const item = appStore.getEquipmentById(id);
  if (!item) return 0;
  const tax = item.tax !== undefined ? item.tax : 0.0;
  return item.netPrice * (1 + tax);
};
const getEquipmentGrossPrice = (id) => {
  const item = appStore.getEquipmentById(id);
  if (!item) return 0;
  const tax = item.tax !== undefined ? item.tax : 0.0;
  const markup = item.markup !== undefined ? item.markup : 0.25;
  return item.netPrice * (1 + tax) * (1 + markup);
};

// Insertions
const addLaborRequirement = () => {
  if (!selectedLabor.value) return;
  const exists = form.value.laborRequirements.some(r => r.classificationId === selectedLabor.value.id);
  if (!exists) {
    form.value.laborRequirements.push({
      classificationId: selectedLabor.value.id,
      unitHours: 1,
      baseHours: 0,
      allowMode: 'NONE'
    });
  }
  selectedLabor.value = null;
};

const addMaterialRequirement = () => {
  if (!selectedMaterial.value) return;
  const exists = form.value.materialRequirements.some(m => m.materialId === selectedMaterial.value.id);
  if (!exists) {
    form.value.materialRequirements.push({
      materialId: selectedMaterial.value.id,
      qty: 1,
      base: false,
      allow: true,
      allowance: selectedMaterial.value.allowance || 0
    });
  }
  selectedMaterial.value = null;
};

const addEquipmentRequirement = () => {
  if (!selectedEquipment.value) return;
  const exists = form.value.equipmentRequirements.some(e => e.equipmentId === selectedEquipment.value.id);
  if (!exists) {
    form.value.equipmentRequirements.push({
      equipmentId: selectedEquipment.value.id,
      qty: 1,
      base: false,
      allow: true,
      allowance: selectedEquipment.value.allowance || 0
    });
  }
  selectedEquipment.value = null;
};
</script>

<style scoped>
:deep(.v-table__wrapper),
:deep(.v-table) {
  margin-bottom: 0 !important;
}

.ghost-cell-input {
  min-width: 115px;
}

.ghost-cell-input :deep(.v-field__input) {
  padding-left: 8px !important;
  padding-right: 2px !important;
  text-align: center;
}

:deep(.v-selection-control) {
  margin: 0 auto !important;
  justify-content: center !important;
}

:deep(.v-selection-control__wrapper) {
  margin: 0 auto !important;
}

.ghost-cell-native-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: transparent;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23777777'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 6px center;
  background-size: 16px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  height: 40px;
  box-sizing: border-box;
  padding: 0 22px 0 10px;
  font-size: 0.9375rem;
  font-weight: 400;
  color: inherit;
  cursor: pointer;
  outline: none;
  text-align: center;
  text-align-last: center;
  display: inline-block;
  min-width: 155px;
  transition: all 0.15s ease;
}

.ghost-cell-native-select:hover {
  border-color: rgba(13, 148, 136, 0.5);
  background-color: rgba(13, 148, 136, 0.04);
}

.ghost-cell-native-select:focus {
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
}

.ghost-cell-native-select option {
  background-color: #ffffff;
  color: #1e293b;
  padding: 6px 12px;
}
</style>
