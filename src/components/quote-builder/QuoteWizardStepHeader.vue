<template>
  <v-card border elevation="0" class="rounded-xl pa-4">
    <div class="d-flex align-center mb-4">
      <v-avatar color="teal-lighten-5" size="44" class="mr-3">
        <v-icon icon="mdi-file-document-edit-outline" color="teal" size="24"></v-icon>
      </v-avatar>
      <div>
        <h2 class="text-h6 font-weight-bold text-slate-800">Proposal Details & Header Information</h2>
        <p class="text-caption text-medium-emphasis mb-0">Step 1 of 4: Enter project header and customer information</p>
      </div>
    </div>

    <v-divider class="mb-4"></v-divider>

    <!-- Company Branding Header Preview -->
    <v-card variant="flat" color="teal-lighten-5" class="pa-4 mb-4 rounded-lg border">
      <v-row density="compact" class="align-center">
        <v-col cols="12" md="6">
          <div class="text-subtitle-1 font-weight-bold text-teal-darken-3">
            {{ appStore.settings?.companyHeader?.companyName || 'Sycamore Design Build, Inc.' }}
          </div>
          <div class="text-caption text-slate-700 whitespace-pre-line">
            {{ appStore.settings?.companyHeader?.address || '4427 Chestnut La. Rockville, MD 20853' }}
          </div>
          <div class="text-caption text-slate-700">
            Ph: {{ appStore.settings?.companyHeader?.phone || '(301) 924-9322' }} | {{ appStore.settings?.companyHeader?.mhic || 'MHIC 68498' }}
          </div>
        </v-col>
        <v-col cols="12" md="6" class="text-md-right">
          <span class="text-h5 font-weight-bold text-teal-darken-2">PROPOSAL</span>
        </v-col>
      </v-row>
    </v-card>

    <!-- Form Grid -->
    <v-row density="compact">
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="quote.name"
          label="Proposal Name / Title *"
          variant="outlined"
          density="compact"
          placeholder="e.g. Master Suite Remodel"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field
          v-model="quote.date"
          label="Date"
          type="date"
          variant="outlined"
          density="compact"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field
          v-model="quote.dateOfLoss"
          label="Date of Loss"
          type="date"
          variant="outlined"
          density="compact"
        ></v-text-field>
      </v-col>

      <!-- Prepared For Section -->
      <v-col cols="12">
        <div class="text-subtitle-2 font-weight-bold text-slate-800 mb-2">Prepared For:</div>
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="quote.clientName"
          label="Customer Name *"
          variant="outlined"
          density="compact"
          placeholder="e.g. John Smith"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="quote.clientStreet"
          label="Customer Street Address"
          variant="outlined"
          density="compact"
          placeholder="e.g. 123 Main St"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="quote.clientCityState"
          label="City, State Zip"
          variant="outlined"
          density="compact"
          placeholder="e.g. Rockville, MD 20853"
        ></v-text-field>
      </v-col>

      <!-- Project Address -->
      <v-col cols="12" sm="8">
        <v-text-field
          v-model="quote.projectAddress"
          label="Project Address"
          variant="outlined"
          density="compact"
          placeholder="Same or specify custom address..."
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="4">
        <v-btn variant="tonal" color="teal" size="small" class="mt-1 text-none" @click="copyCustomerAddress">
          Copy Customer Address
        </v-btn>
      </v-col>

      <!-- Prepared By Section -->
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="quote.preparedBy"
          label="Prepared By"
          variant="outlined"
          density="compact"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="quote.preparedByPhone"
          label="Prepared By Phone Number"
          variant="outlined"
          density="compact"
        ></v-text-field>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { useAppStore } from '@/stores/app';

const props = defineProps({
  quote: {
    type: Object,
    required: true
  }
});

const appStore = useAppStore();

const copyCustomerAddress = () => {
  if (props.quote.clientStreet || props.quote.clientCityState) {
    props.quote.projectAddress = `${props.quote.clientStreet || ''} ${props.quote.clientCityState || ''}`.trim();
  }
};
</script>

<style scoped>
.whitespace-pre-line {
  white-space: pre-line;
}
</style>
