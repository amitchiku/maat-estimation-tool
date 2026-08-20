<template>
  <div v-if="appStore.currentQuote">
    <!-- Top Navigation Bar -->
    <v-row class="mb-4 align-center no-print">
      <v-col cols="12" md="4" class="d-flex align-center">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          class="mr-2"
          @click="goBack"
          title="Back to Estimates List"
        ></v-btn>
        <div>
          <h1 class="text-h5 font-weight-bold text-slate-800">Proposal Builder Wizard</h1>
          <span class="text-caption text-medium-emphasis">Proposal ID: {{ appStore.currentQuote.id }}</span>
        </div>
      </v-col>

      <v-col cols="12" md="8" class="text-right d-flex justify-end align-center flex-wrap gap-2">
        <v-btn
          variant="tonal"
          color="grey-darken-1"
          class="text-none"
          :disabled="currentStep === 1"
          @click="currentStep--"
        >
          Previous Step
        </v-btn>
        <v-btn
          v-if="currentStep < 4"
          color="teal"
          class="text-none font-weight-bold glow-btn"
          @click="currentStep++"
        >
          Next Step
        </v-btn>
        <v-btn
          v-else
          color="teal-darken-2"
          class="text-none font-weight-bold glow-btn"
          prepend-icon="mdi-content-save"
          @click="saveQuote"
        >
          Save Final Proposal
        </v-btn>
      </v-col>
    </v-row>

    <!-- 4-Step Stepper Navigation Bar -->
    <v-card border elevation="0" class="rounded-xl pa-3 mb-6 no-print bg-white">
      <v-row density="compact" class="text-center align-center">
        <v-col
          v-for="s in wizardSteps"
          :key="s.step"
          cols="6"
          sm="3"
          class="cursor-pointer pa-2 rounded-lg transition-all"
          :class="{ 'bg-teal-lighten-5 border-teal': currentStep === s.step }"
          @click="currentStep = s.step"
        >
          <div class="d-flex align-center justify-center mb-1">
            <v-avatar
              :color="currentStep === s.step ? 'teal' : (currentStep > s.step ? 'teal-lighten-4' : 'grey-lighten-3')"
              size="28"
              class="mr-2 text-caption font-weight-bold"
              :class="currentStep === s.step ? 'text-white' : 'text-slate-800'"
            >
              {{ s.step }}
            </v-avatar>
            <span class="text-subtitle-2 font-weight-bold" :class="currentStep === s.step ? 'text-teal-darken-3' : 'text-slate-700'">
              {{ s.title }}
            </span>
          </div>
          <div class="text-caption text-medium-emphasis">{{ s.desc }}</div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Step Views -->
    <div class="wizard-step-container">
      <!-- Step 1: Proposal Header Details (Image 1) -->
      <QuoteWizardStepHeader
        v-if="currentStep === 1"
        :quote="appStore.currentQuote"
      />

      <!-- Step 2: Line Item & Group Selection -->
      <QuoteWizardStepSelector
        v-else-if="currentStep === 2"
        v-model:selected-items-map="selectedItemsMap"
      />

      <!-- Step 3: Room Summary & Auto-Collection -->
      <QuoteWizardStepRooms
        v-else-if="currentStep === 3"
        v-model:selected-items-map="selectedItemsMap"
      />

      <!-- Step 4: Interactive Proposal Worksheet (Image 2) -->
      <QuoteProposalWorksheet
        v-else-if="currentStep === 4"
        :quote="appStore.currentQuote"
        v-model:selected-items-map="selectedItemsMap"
        @save="saveQuote"
        @print="exportPdf"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useAppStore } from '@/stores/app';

// Step Components
import QuoteWizardStepHeader from '@/components/quote-builder/QuoteWizardStepHeader.vue';
import QuoteWizardStepSelector from '@/components/quote-builder/QuoteWizardStepSelector.vue';
import QuoteWizardStepRooms from '@/components/quote-builder/QuoteWizardStepRooms.vue';
import QuoteProposalWorksheet from '@/components/quote-builder/QuoteProposalWorksheet.vue';

const appStore = useAppStore();

const currentStep = ref(1);

const wizardSteps = [
  { step: 1, title: 'Header Info', desc: 'Customer & Proposal Details' },
  { step: 2, title: 'Items & Groups', desc: 'Select Line Items or Groups' },
  { step: 3, title: 'Room Summary', desc: 'Auto-Collected Rooms' },
  { step: 4, title: 'Proposal Worksheet', desc: 'Review & Final Proposal' }
];

const selectedItemsMap = ref({});

// Initialize selectedItemsMap from currentQuote rooms
const initSelectedItemsMap = () => {
  if (!appStore.currentQuote || !appStore.currentQuote.rooms) return;
  const map = {};
  appStore.currentQuote.rooms.forEach(room => {
    (room.items || []).forEach(item => {
      map[item.id] = {
        id: item.id,
        name: item.name,
        group: item.group || item.category || 'General',
        category: item.category || 'General',
        defaultRoom: item.defaultRoom || room.name,
        assignedRoom: room.name,
        quantity: item.quantity || 1,
        unit: item.unit || 'each',
        isAllowanceFull: !!item.isAllowanceFull,
        rawAssembly: item.assemblyData || appStore.assemblies.find(a => a.id === item.id) || item
      };
    });
  });
  selectedItemsMap.value = map;
};

onMounted(() => {
  initSelectedItemsMap();
});

watch(() => appStore.currentQuote, () => {
  initSelectedItemsMap();
}, { deep: true });

const syncQuoteWithStore = () => {
  if (!appStore.currentQuote) return;

  const roomsMap = {};
  Object.values(selectedItemsMap.value).forEach(item => {
    const rmName = item.assignedRoom || item.defaultRoom || 'General';
    if (!roomsMap[rmName]) {
      roomsMap[rmName] = {
        id: `room_${rmName.toLowerCase().replace(/\s+/g, '_')}`,
        name: rmName,
        order: Object.keys(roomsMap).length + 1,
        items: []
      };
    }

    roomsMap[rmName].items.push({
      id: item.id,
      name: item.name,
      group: item.group,
      category: item.category,
      defaultRoom: item.defaultRoom,
      quantity: item.quantity,
      unit: item.unit,
      type: 'assembly',
      isAllowanceFull: !!item.isAllowanceFull,
      assemblyData: item.rawAssembly || {}
    });
  });

  appStore.currentQuote.rooms = Object.values(roomsMap);
};

const goBack = () => {
  appStore.activeTab = 'quotes';
};

const saveQuote = async () => {
  try {
    syncQuoteWithStore();
    await appStore.saveCurrentQuote();
  } catch (err) {
    appStore.error = `Error saving quote: ${err.message}`;
  }
};

const exportPdf = () => {
  syncQuoteWithStore();
  saveQuote();
  setTimeout(() => {
    window.print();
  }, 400);
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.transition-all {
  transition: all 0.2s ease-in-out;
}
.border-teal {
  border: 1px solid #0d9488 !important;
}
</style>
