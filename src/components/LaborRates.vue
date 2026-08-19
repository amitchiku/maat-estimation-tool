<template>
  <div>
    <!-- Page Header -->
    <v-row class="mb-2 align-center">
      <v-col cols="12">
        <span class="text-title-large font-weight-medium text-medium-emphasis">Labor Rates Manager</span>
      </v-col>
    </v-row>

    <v-row>
      <!-- Labor Roles List -->
      <v-col cols="12" md="8">
        <v-card border elevation="0" class="hover-card">
          <v-card-text class="pa-0">
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="font-weight-bold">ID</th>
                  <th class="font-weight-bold">Classification</th>
                  <th class="font-weight-bold">Type</th>
                  <th class="font-weight-bold text-right">Standard Hourly Rate</th>
                  <th class="font-weight-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="role in appStore.labor" :key="role.id">
                  <td>{{ role.id }}</td>
                  <td>{{ role.name }}</td>
                  <td>
                    <v-chip size="x-small" :color="role.type === 'Sub' ? 'deep-orange-darken-1' : 'purple-darken-1'"
                      variant="flat" class="font-weight-bold">
                      {{ role.type }}
                    </v-chip>
                  </td>
                  <td class="text-right">${{ formatMoney(role.rate) }} / hr</td>
                  <td class="text-center">
                    <v-btn icon="mdi-pencil" variant="text" color="blue" size="small"
                      @click="editLaborRole(role)"></v-btn>
                    <v-btn icon="mdi-delete" variant="text" color="red" size="small"
                      @click="deleteLaborRole(role.id)"></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Add/Edit Labor Card -->
      <v-col cols="12" md="4">
        <v-card border elevation="0">
          <v-card-title class="font-weight-bold text-teal-darken-2 pa-4">
            {{ editingLabor ? 'Edit Labor Classification' : 'Add Labor Role' }}
          </v-card-title>
          <v-card-text>
            <v-form ref="laborFormRef">
              <v-text-field v-model="laborForm.name" label="Role/Classification" placeholder="e.g. Lead Carpenter"
                variant="outlined" density="compact" class="mb-3" hide-details></v-text-field>
              <v-select v-model="laborForm.type" label="Type" :items="['In-House', 'Sub']" variant="outlined"
                density="compact" class="mb-3" hide-details></v-select>
              <v-text-field v-model.number="laborForm.rate" type="number" label="Hourly Billing Rate ($/hr)"
                variant="outlined" density="compact" class="mb-4" hide-details></v-text-field>
              <v-btn color="teal" block class="font-weight-bold" @click="saveLaborRole">
                {{ editingLabor ? 'Save Changes' : 'Add Role' }}
              </v-btn>
              <v-btn v-if="editingLabor" block variant="text" color="grey" class="mt-2" @click="cancelLaborEdit">
                Cancel
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();
const editingLabor = ref(null);
const laborForm = ref({
  id: '',
  name: '',
  type: 'In-House',
  rate: 0
});

const saveLaborRole = async () => {
  if (!laborForm.value.name.trim()) return;

  const rate = parseFloat(laborForm.value.rate) || 0;
  if (editingLabor.value) {
    const role = appStore.labor.find(r => r.id === editingLabor.value.id);
    if (role) {
      role.name = laborForm.value.name;
      role.type = laborForm.value.type;
      role.rate = rate;
    }
  } else {
    appStore.labor.push({
      id: `l${appStore.labor.length + 1}`,
      name: laborForm.value.name,
      type: laborForm.value.type,
      rate
    });
  }

  try {
    await appStore.saveCatalog();
    cancelLaborEdit();
  } catch (err) {
    appStore.error = `Error saving labor catalog: ${err.message}`;
  }
};

const editLaborRole = (role) => {
  editingLabor.value = role;
  laborForm.value = { ...role };
};

const cancelLaborEdit = () => {
  editingLabor.value = null;
  laborForm.value = { id: '', name: '', type: 'In-House', rate: 0 };
};

const deleteLaborRole = async (id) => {
  appStore.labor = appStore.labor.filter(r => r.id !== id);
  try {
    await appStore.saveCatalog();
  } catch (err) {
    appStore.error = `Error deleting labor role: ${err.message}`;
  }
};

const formatMoney = (val) => {
  return (parseFloat(val) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
