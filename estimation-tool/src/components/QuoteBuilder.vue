<template>
  <div v-if="appStore.currentQuote" class="wizard-page">
    <!-- Header -->
    <div class="wizard-header no-print">
      <div class="wizard-heading">
        <div class="wizard-title">Proposal Builder Wizard</div>
        <span class="wizard-dot">•</span>
        <div class="wizard-id">{{ appStore.currentQuote.id }}</div>
      </div>

      <v-btn v-if="currentStep < 4" class="next-btn" elevation="0" @click="currentStep++">
        Next
        <v-icon icon="mdi-arrow-right" size="18" />
      </v-btn>

      <v-btn v-else class="save-final-btn" elevation="0" @click="saveQuote">
        <v-icon icon="mdi-content-save-outline" size="19" class="save-icon" />
        <span>Save Final Proposal</span>
      </v-btn>
    </div>

    <!-- Steps -->
    <div class="wizard-steps no-print">
      <div v-for="s in wizardSteps" :key="s.step" class="wizard-step" :class="{
        active: currentStep === s.step,
        completed: currentStep > s.step
      }" @click="currentStep = s.step">
        <div class="step-track">
          <div class="step-circle">{{ s.step }}</div>
          <div v-if="s.step < 4" class="step-line"></div>
        </div>

        <div class="step-label">{{ s.title }}</div>
      </div>
    </div>

    <!-- Content -->
    <div class="wizard-body">
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
import { useAppStore } from '@/stores/app'
import QuoteWizardStepHeader from '@/components/quote-builder/QuoteWizardStepHeader.vue'
import QuoteWizardStepSelector from '@/components/quote-builder/QuoteWizardStepSelector.vue'
import QuoteWizardStepRooms from '@/components/quote-builder/QuoteWizardStepRooms.vue'
import QuoteProposalWorksheet from '@/components/quote-builder/QuoteProposalWorksheet.vue'

const appStore = useAppStore()
const currentStep = ref(1)

/* Details hidden by default */
const isHeaderCollapsed = ref(true)

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
        rawlineItems:
          item.lineItemsData ||
          appStore.lineItems?.find(a => a.id === item.id) ||
          item
      }
    })
  })

  selectedItemsMap.value = map
}

onMounted(initSelectedItemsMap)

watch(
  () => appStore.currentQuote,
  initSelectedItemsMap,
  { deep: true }
)

const syncQuoteWithStore = () => {
  if (!appStore.currentQuote) return

  const roomsMap = {}

  Object.values(selectedItemsMap.value).forEach(item => {
    const roomName =
      item.assignedRoom ||
      item.defaultRoom ||
      'General'

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
.wizard-page {
  width: 100%;
  min-height: 100%;
  padding: 1px 2px 5px;
  box-sizing: border-box;
  background: var(--wizard-page-bg);
  color: var(--wizard-text);
  transition: background-color .2s ease, color .2s ease;
}

:global(.v-theme--light) .wizard-page {
  --wizard-page-bg: #fff;
  --wizard-text: #26385f;
  --wizard-heading: #111e43;
  --wizard-muted: #617397;
  --wizard-step-bg: #edf0f3;
  --wizard-line: #d9dfe6;
}

:global(.v-theme--dark) .wizard-page {
  --wizard-page-bg: #121212;
  --wizard-text: #e3e6eb;
  --wizard-heading: #fff;
  --wizard-muted: #aeb5c0;
  --wizard-step-bg: #2a2d31;
  --wizard-line: #41454b;
}

.wizard-header {
  width: 100%;
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.wizard-heading {
  display: flex;
  align-items: center;
  min-width: 0;
  white-space: nowrap;
}

.wizard-title {
  color: var(--wizard-heading);
  font-size: 16px;
  font-weight: 700;
}

.wizard-dot {
  margin: 0 11px;
  color: var(--wizard-muted);
}

.wizard-id {
  color: var(--wizard-text);
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.next-btn {
  width: 110px;
  min-width: 110px;
  height: 42px !important;
  border-radius: 9px;
  background: #079a91 !important;
  color: #fff !important;
  font-size: 14px;
  font-weight: 700;
  text-transform: none;
  transition: transform .15s ease, box-shadow .15s ease;
}

.next-btn:hover {
  background: #078b83 !important;
  transform: translateY(-1px);
  box-shadow: 0 5px 14px rgba(7, 154, 145, .22);
}

.next-btn .v-icon {
  margin-left: 7px;
}

.save-final-btn {
  width: 190px;
  min-width: 190px;
  height: 44px !important;
  padding: 0 16px !important;
  border-radius: 10px;
  background: linear-gradient(135deg, #079a91, #087f78) !important;
  color: #fff !important;
  font-size: 13px;
  font-weight: 700;
  text-transform: none;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(7, 154, 145, .18);
  transition: transform .15s ease, box-shadow .15s ease;
}

.save-final-btn:hover {
  background: linear-gradient(135deg, #08a69b, #087f78) !important;
  transform: translateY(-1px);
  box-shadow: 0 7px 18px rgba(7, 154, 145, .28);
}

.save-final-btn .save-icon {
  margin-right: 8px;
}

.wizard-steps {
  width: 94%;
  margin: 0 auto 31px;
  display: flex;
}

.wizard-step {
  position: relative;
  flex: 1;
  cursor: pointer;
  text-align: center;
}

.step-track {
  position: relative;
  height: 30px;
  display: flex;
  align-items: center;
}

.step-circle {
  position: relative;
  z-index: 2;
  width: 30px;
  height: 30px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--wizard-step-bg);
  color: var(--wizard-text);
  font-size: 12px;
  font-weight: 700;
}

.step-line {
  position: absolute;
  z-index: 1;
  top: 14px;
  left: 50%;
  width: 100%;
  height: 1px;
  background: var(--wizard-line);
}

.wizard-step.active .step-circle,
.wizard-step.completed .step-circle {
  background: #0a9b91;
  color: #fff;
}

.wizard-step.active .step-line,
.wizard-step.completed .step-line {
  background: #0a9b91;
}

.step-label {
  margin-top: 8px;
  color: var(--wizard-muted);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.wizard-step.active .step-label,
.wizard-step.completed .step-label {
  color: #079a91;
}

.wizard-step.active .step-label {
  font-weight: 700;
}

.wizard-body {
  width: 100%;
}

@media (max-width: 900px) {
  .wizard-page {
    padding: 10px 16px 40px;
  }

  .wizard-steps {
    width: 100%;
    margin-bottom: 28px;
  }

  .save-final-btn {
    width: 175px;
    min-width: 175px;
  }
}

@media (max-width: 600px) {
  .wizard-header {
    gap: 10px;
  }

  .wizard-heading {
    overflow: hidden;
  }

  .wizard-title,
  .wizard-id {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .wizard-title {
    font-size: 14px;
  }

  .wizard-id {
    font-size: 11px;
  }

  .wizard-dot {
    margin: 0 7px;
  }

  .next-btn {
    width: 90px;
    min-width: 90px;
  }

  .save-final-btn {
    width: 150px;
    min-width: 150px;
    height: 40px !important;
    padding: 0 10px !important;
    font-size: 11px;
  }

  .save-final-btn .save-icon {
    margin-right: 5px;
  }

  .step-circle {
    width: 27px;
    height: 27px;
    font-size: 11px;
  }

  .step-line {
    top: 13px;
  }

  .step-label {
    font-size: 10px;
  }
}

@media print {
  .no-print {
    display: none !important;
  }

  .wizard-page {
    padding: 0;
    background: #fff !important;
    color: #000 !important;
  }
}
</style>