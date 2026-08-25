<template>
  <div v-if="appStore.isLoading" class="text-center py-12">
    <v-progress-circular indeterminate color="teal" size="64"></v-progress-circular>
    <div class="mt-4 text-subtitle-1 text-medium-emphasis">Loading Estimate...</div>
  </div>
  <div v-else-if="!appStore.currentQuote" class="text-center py-12">
    <v-icon icon="mdi-alert-circle-outline" size="64" color="grey-darken-1"></v-icon>
    <div class="mt-4 text-h6 text-medium-emphasis">Estimate Not Found</div>
    <v-btn color="teal" class="mt-4" @click="router.push({ name: 'quotes' })">Return to Quotes Dashboard</v-btn>
  </div>
  <div v-else>
    <!-- Top Bar & Stepper Card -->
    <v-card elevation="0" class="pa-4 mb-4 no-print">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
        <div class="d-flex align-center ga-2">
          <span class="text-subtitle-1 font-weight-bold">Proposal Builder Wizard</span>
          <span class="text-medium-emphasis">•</span>
          <span class="text-body-2 text-medium-emphasis">{{ appStore.currentQuote.id }}</span>
        </div>

        <div>
          <v-btn v-if="currentStep < 4" color="teal" class="text-none font-weight-bold" @click="currentStep++">
            Next
            <v-icon icon="mdi-arrow-right" class="ml-1" size="18" />
          </v-btn>
          <v-btn v-else color="teal" class="text-none font-weight-bold" prepend-icon="mdi-content-save-outline" @click="saveQuote">
            Save Final Proposal
          </v-btn>
        </div>
      </div>

      <!-- Stepper Navigation -->
      <div class="d-flex align-center justify-space-between px-6 py-2">
        <template v-for="(s, idx) in wizardSteps" :key="s.step">
          <!-- Step Item -->
          <div class="d-flex flex-column align-center cursor-pointer text-center" @click="currentStep = s.step">
            <v-avatar :color="currentStep >= s.step ? 'teal' : 'grey-lighten-3'" size="32"
              :class="currentStep >= s.step ? 'text-white font-weight-bold' : 'text-grey-darken-1 font-weight-bold'">
              {{ s.step }}
            </v-avatar>
            <span class="text-caption mt-1"
              :class="currentStep >= s.step ? 'text-teal-darken-2 font-weight-bold' : 'text-medium-emphasis'">
              {{ s.title }}
            </span>
          </div>

          <!-- Connecting Arrow Line -->
          <div v-if="idx < wizardSteps.length - 1" class="step-connector d-flex align-center flex-grow-1 mx-3">
            <div class="connector-line" :class="{ active: currentStep > s.step }"></div>
            <v-icon icon="mdi-chevron-right" size="18" :color="currentStep > s.step ? 'teal' : 'grey-lighten-1'" class="ml-n2" />
          </div>
        </template>
      </div>
    </v-card>

    <!-- Step Content -->
    <div>
      <QuoteWizardStepHeader v-if="currentStep === 1" :quote="appStore.currentQuote" />

      <QuoteWizardStepSelector v-else-if="currentStep === 2" v-model:selected-items-map="selectedItemsMap" />

      <QuoteWizardStepRooms v-else-if="currentStep === 3" v-model:selected-items-map="selectedItemsMap" />

      <QuoteProposalWorksheet v-else-if="currentStep === 4" :quote="appStore.currentQuote"
        v-model:selected-items-map="selectedItemsMap" @save="saveQuote" @print="exportPdf" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import QuoteWizardStepHeader from '@/components/quote-builder/QuoteWizardStepHeader.vue'
import QuoteWizardStepSelector from '@/components/quote-builder/QuoteWizardStepSelector.vue'
import QuoteWizardStepRooms from '@/components/quote-builder/QuoteWizardStepRooms.vue'
import QuoteProposalWorksheet from '@/components/quote-builder/QuoteProposalWorksheet.vue'

const props = defineProps({
  id: {
    type: String,
    default: ''
  }
})

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const currentStep = ref(1)

const wizardSteps = [
  { step: 1, title: 'Header Info' },
  { step: 2, title: 'Items & Groups' },
  { step: 3, title: 'Room Summary' },
  { step: 4, title: 'Proposal Worksheet' }
]

const selectedItemsMap = ref({})

const initSelectedItemsMap = () => {
  if (!appStore.currentQuote?.rooms) return

  const map = {}

  appStore.currentQuote.rooms.forEach(room => {
    ; (room.items || []).forEach(item => {
      if (!map[item.id]) {
        map[item.id] = {
          id: item.id,
          name: item.name,
          group: item.group || item.category || 'General',
          category: item.category || 'General',
          defaultRoom: item.defaultRoom || room.name,
          assignedRooms: [room.name],
          assignedRoom: room.name,
          quantity: item.quantity || 1,
          unit: item.unit || 'each',
          isAllowanceFull: !!item.isAllowanceFull,
          rawlineItems:
            item.lineItemsData ||
            appStore.lineItems?.find(a => a.id === item.id) ||
            item
        }
      } else {
        if (!map[item.id].assignedRooms.includes(room.name)) {
          map[item.id].assignedRooms.push(room.name)
        }
      }
    })
  })

  selectedItemsMap.value = map
}

const syncRouteQuote = async () => {
  const targetId = props.id || route.params.id
  if (targetId) {
    if (appStore.currentQuote?.id !== targetId) {
      await appStore.loadQuote(targetId)
    }
  } else if (appStore.currentQuote?.id) {
    router.replace({ name: 'quote-builder', params: { id: appStore.currentQuote.id } })
  } else {
    router.push({ name: 'quotes' })
  }
  initSelectedItemsMap()
}

onMounted(async () => {
  await syncRouteQuote()
})

watch(
  () => props.id || route.params.id,
  async (newId) => {
    if (newId) {
      await syncRouteQuote()
    }
  }
)

watch(
  () => appStore.currentQuote,
  initSelectedItemsMap,
  { deep: true }
)

const syncQuoteWithStore = () => {
  if (!appStore.currentQuote) return

  const roomsMap = {}

  Object.values(selectedItemsMap.value).forEach(item => {
    const assignedList = Array.isArray(item.assignedRooms) && item.assignedRooms.length
      ? item.assignedRooms
      : [item.assignedRoom || item.defaultRoom || 'General']

    assignedList.forEach(roomName => {
      if (!roomsMap[roomName]) {
        roomsMap[roomName] = {
          id: `room_${roomName.toLowerCase().replace(/\s+/g, '_')}`,
          name: roomName,
          order: Object.keys(roomsMap).length + 1,
          items: []
        }
      }

      roomsMap[roomName].items.push({
        id: item.id,
        name: item.name,
        group: item.group,
        category: item.category,
        defaultRoom: item.defaultRoom,
        quantity: item.quantity,
        unit: item.unit,
        type: 'lineItems',
        isAllowanceFull: !!item.isAllowanceFull,
        lineItemsData: item.rawlineItems || {}
      })
    })
  })

  appStore.currentQuote.rooms = Object.values(roomsMap)
}

const saveQuote = async () => {
  try {
    syncQuoteWithStore()
    await appStore.saveCurrentQuote()
  } catch (err) {
    appStore.error = `Error saving quote: ${err.message}`
  }
}

const exportPdf = () => {
  syncQuoteWithStore()
  saveQuote()

  setTimeout(() => {
    window.print()
  }, 400)
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.step-connector {
  margin-top: -16px;
}

.connector-line {
  flex: 1;
  height: 2px;
  background-color: #e0e0e0;
  transition: background-color 0.2s ease;
}

.connector-line.active {
  background-color: #009688;
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>