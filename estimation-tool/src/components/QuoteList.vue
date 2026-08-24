<template>
  <div>
    <!-- Header -->
    <v-row class="mb-2 align-center">
      <v-col cols="12" md="6">
        <span class="text-title-large font-weight-medium text-medium-emphasis">Estimating Dashboard</span>
      </v-col>
      <v-col cols="12" md="6" class="text-right">
        <v-btn prepend-icon="mdi-plus" size="large" class="glow-btn font-weight-bold" @click="createNewQuote">
          New Estimate
        </v-btn>
      </v-col>
    </v-row>

    <!-- Quotes Grid/List -->
    <v-card class="hover-card" border elevation="0">
      <v-card-item class="pa-4">
        <v-row class="mb-4 align-center">
          <v-col cols="12" sm="6">
            <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search projects or clients..."
              variant="outlined" density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" class="text-right">
            <v-btn-toggle v-model="statusFilter" color="teal-darken-1" density="compact" mandatory variant="outlined">
              <v-btn value="All">All</v-btn>
              <v-btn value="Draft">Draft</v-btn>
              <v-btn value="Sent">Sent</v-btn>
              <v-btn value="Approved">Approved</v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>

        <v-table class="quotes-table">
          <thead>
            <tr>
              <th class="font-weight-bold">Project Name</th>
              <th class="font-weight-bold">Client Name</th>
              <th class="font-weight-bold">Date Created</th>
              <th class="font-weight-bold text-center">Rooms</th>
              <th class="font-weight-bold text-right">Grand Total</th>
              <th class="font-weight-bold text-center">Status</th>
              <th class="font-weight-bold text-center no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredQuotes.length === 0">
              <td colspan="7" class="text-center py-6 text-medium-emphasis">
                No quotes found. Click "New Estimate" to create your first pricing worksheet.
              </td>
            </tr>
            <tr v-for="quote in filteredQuotes" :key="quote.id">
              <td>{{ quote.name }}</td>
              <td>{{ quote.clientName || '---' }}</td>
              <td>{{ formatDate(quote.date) }}</td>
              <td class="text-center">
                <v-chip size="small" variant="tonal" color="grey">
                  {{ quote.roomCount || 0 }} Spaces
                </v-chip>
              </td>
              <td class="text-right font-weight-bold">${{ formatMoney(quote.grandTotal) }}</td>
              <td class="text-center">
                <v-chip size="small" :color="getStatusColor(quote.status)" variant="flat" class="font-weight-bold">
                  {{ quote.status }}
                </v-chip>
              </td>
              <td class="text-center no-print">
                <v-btn icon="mdi-pencil" variant="text" color="blue" size="small" @click="editQuote(quote.id)"
                  title="Edit Estimate"></v-btn>
                <v-btn icon="mdi-content-copy" variant="text" color="teal" size="small"
                  @click="duplicateQuote(quote.id)" title="Duplicate Estimate"></v-btn>
                <v-btn icon="mdi-delete" variant="text" color="red" size="small" @click="confirmDelete(quote)"
                  title="Delete Estimate"></v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-item>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="440" transition="dialog-bottom-transition">
      <v-card class="rounded-xl pa-2" elevation="10" border>
        <div class="d-flex align-center pa-4 pb-2">
          <v-avatar color="red-lighten-5" size="44" class="mr-3">
            <v-icon icon="mdi-delete-outline" color="red-darken-1" size="24"></v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-slate-800">Delete Estimate</div>
            <div class="text-caption text-medium-emphasis">This action cannot be undone</div>
          </div>
        </div>

        <v-card-text class="px-4 py-3 text-body-2 text-slate-700">
          Are you sure you want to permanently delete the estimate for <span class="font-weight-bold text-slate-900">"{{ quoteToDelete?.name }}"</span>?
        </v-card-text>

        <v-card-actions class="pa-4 pt-2 justify-end">
          <v-btn
            variant="tonal"
            color="grey-darken-1"
            density="comfortable"
            class="text-none px-4 rounded-lg mr-2"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="red-darken-1"
            variant="flat"
            density="comfortable"
            class="text-none px-4 rounded-lg font-weight-medium"
            elevation="1"
            @click="executeDelete"
          >
            Delete Estimate
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { api } from '@/services/api';

const router = useRouter();
const appStore = useAppStore();
const search = ref('');
const statusFilter = ref('All');
const deleteDialog = ref(false);
const quoteToDelete = ref(null);

const filteredQuotes = computed(() => {
  let list = appStore.quotes;

  if (statusFilter.value !== 'All') {
    list = list.filter(q => q.status === statusFilter.value);
  }

  if (search.value) {
    const query = search.value.toLowerCase();
    list = list.filter(q =>
      (q.name && q.name.toLowerCase().includes(query)) ||
      (q.clientName && q.clientName.toLowerCase().includes(query))
    );
  }

  // Sort by date descending
  return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
});

const createNewQuote = () => {
  const newId = appStore.newQuote();
  router.push({ name: 'quote-builder', params: { id: newId } });
};

const editQuote = (id) => {
  router.push({ name: 'quote-builder', params: { id } });
};

const duplicateQuote = async (id) => {
  try {
    appStore.isLoading = true;
    const original = await api.getQuote(id);
    const copy = JSON.parse(JSON.stringify(original));
    copy.id = `quote_${Date.now()}`;
    copy.name = `${copy.name} (Copy)`;
    copy.date = new Date().toISOString().split('T')[0];
    copy.status = 'Draft';
    await api.saveQuote(copy);
    await appStore.loadQuotes();
  } catch (err) {
    appStore.error = `Error duplicating quote: ${err.message}`;
  } finally {
    appStore.isLoading = false;
  }
};

const confirmDelete = (quote) => {
  quoteToDelete.value = quote;
  deleteDialog.value = true;
};

const executeDelete = async () => {
  if (quoteToDelete.value) {
    await appStore.deleteQuote(quoteToDelete.value.id);
    deleteDialog.value = false;
    quoteToDelete.value = null;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Draft': return 'blue-grey-darken-1';
    case 'Sent': return 'amber-darken-2';
    case 'Approved': return 'teal-darken-1';
    default: return 'grey';
  }
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
