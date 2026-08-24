<template>
  <div class="header-step">
    <div class="company-row">
      <v-icon icon="mdi-office-building-outline" class="company-icon" />
      <div class="company-details">
        <strong>{{ appStore.settings?.companyHeader?.companyName || 'Sycamore Design Build, Inc.' }}</strong>
        <span>|</span>
        <span>{{ appStore.settings?.companyHeader?.address || '4427 Chestnut La. Rockville, MD 20853' }}</span>
        <span>|</span>
        <span>Ph: {{ appStore.settings?.companyHeader?.phone || '(301) 924-9322' }}</span>
        <span>|</span>
        <span>{{ appStore.settings?.companyHeader?.mhic || 'MHIC 68498' }}</span>
      </div>
    </div>

    <v-card class="form-card" elevation="0">
      <v-row class="header-form-row">
        <v-col cols="12" md="6">
          <v-text-field v-model="quote.name" label="Proposal Name / Title *" variant="outlined" hide-details
            class="estimate-field" />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-menu v-model="menuDate" :close-on-content-click="false" location="bottom start">
            <template #activator="{ props: menuProps }">
              <v-text-field v-model="quote.date" label="Date *" prepend-inner-icon="mdi-calendar" readonly
                v-bind="menuProps" variant="outlined" hide-details class="estimate-field cursor-pointer" />
            </template>
            <v-date-picker v-model="pickerDate" color="teal" elevation="4" @update:model-value="onDateSelected" />
          </v-menu>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-menu v-model="menuDateOfLoss" :close-on-content-click="false" location="bottom start">
            <template #activator="{ props: menuProps }">
              <v-text-field v-model="quote.dateOfLoss" label="Date Of Loss" prepend-inner-icon="mdi-calendar-alert"
                readonly v-bind="menuProps" variant="outlined" hide-details class="estimate-field cursor-pointer" />
            </template>
            <v-date-picker v-model="pickerDateOfLoss" color="teal" elevation="4"
              @update:model-value="onDateOfLossSelected" />
          </v-menu>
        </v-col>

        <v-col cols="12" class="prepared-title">Prepared For:</v-col>

        <v-col cols="12" md="6">
          <v-text-field v-model="quote.clientName" label="Customer Name *" prepend-inner-icon="mdi-account-outline"
            variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field v-model="quote.clientStreet" label="Customer Street Address *"
            prepend-inner-icon="mdi-map-marker-outline" variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field v-model="quote.clientCityState" label="City *" prepend-inner-icon="mdi-city-variant-outline"
            variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-combobox v-model="quote.clientState" :items="usStates" item-title="title" item-value="value"
            :return-object="false" label="State *" prepend-inner-icon="mdi-map-outline" variant="outlined" hide-details
            class="estimate-field" :input-props="{ autocomplete: 'new-password', role: 'presentation' }" />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-text-field v-model="quote.clientZip" label="Zip *" prepend-inner-icon="mdi-email-outline"
            variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" md="10">
          <v-text-field v-model="quote.projectAddress" label="Project Address *"
            prepend-inner-icon="mdi-map-marker-outline" variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" md="2" class="copy-wrapper">
          <v-btn variant="outlined" class="copy-address" prepend-icon="mdi-content-copy" @click="copyCustomerAddress">
            {{ copied ? 'Copied!' : 'Copy Address' }}
          </v-btn>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field v-model="quote.preparedBy" label="Prepared By *" prepend-inner-icon="mdi-account-outline"
            variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field v-model="quote.preparedByPhone" label="Prepared By Phone Number"
            prepend-inner-icon="mdi-phone-outline" variant="outlined" hide-details class="estimate-field" />
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  quote: {
    type: Object,
    required: true
  }
})

const appStore = useAppStore()
const copied = ref(false)

const menuDate = ref(false)
const menuDateOfLoss = ref(false)

const parseDateObj = (str) => {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

const formatDateStr = (dateVal) => {
  if (!dateVal) return ''
  const d = new Date(dateVal)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const pickerDate = ref(parseDateObj(props.quote.date) || new Date())
const pickerDateOfLoss = ref(parseDateObj(props.quote.dateOfLoss))

const onDateSelected = (val) => {
  props.quote.date = formatDateStr(val)
  menuDate.value = false
}

const onDateOfLossSelected = (val) => {
  props.quote.dateOfLoss = formatDateStr(val)
  menuDateOfLoss.value = false
}

const getToday = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const usStates = [
  { title: 'Alabama (AL)', value: 'AL' },
  { title: 'Alaska (AK)', value: 'AK' },
  { title: 'Arizona (AZ)', value: 'AZ' },
  { title: 'Arkansas (AR)', value: 'AR' },
  { title: 'California (CA)', value: 'CA' },
  { title: 'Colorado (CO)', value: 'CO' },
  { title: 'Connecticut (CT)', value: 'CT' },
  { title: 'Delaware (DE)', value: 'DE' },
  { title: 'District of Columbia (DC)', value: 'DC' },
  { title: 'Florida (FL)', value: 'FL' },
  { title: 'Georgia (GA)', value: 'GA' },
  { title: 'Hawaii (HI)', value: 'HI' },
  { title: 'Idaho (ID)', value: 'ID' },
  { title: 'Illinois (IL)', value: 'IL' },
  { title: 'Indiana (IN)', value: 'IN' },
  { title: 'Iowa (IA)', value: 'IA' },
  { title: 'Kansas (KS)', value: 'KS' },
  { title: 'Kentucky (KY)', value: 'KY' },
  { title: 'Louisiana (LA)', value: 'LA' },
  { title: 'Maine (ME)', value: 'ME' },
  { title: 'Maryland (MD)', value: 'MD' },
  { title: 'Massachusetts (MA)', value: 'MA' },
  { title: 'Michigan (MI)', value: 'MI' },
  { title: 'Minnesota (MN)', value: 'MN' },
  { title: 'Mississippi (MS)', value: 'MS' },
  { title: 'Missouri (MO)', value: 'MO' },
  { title: 'Montana (MT)', value: 'MT' },
  { title: 'Nebraska (NE)', value: 'NE' },
  { title: 'Nevada (NV)', value: 'NV' },
  { title: 'New Hampshire (NH)', value: 'NH' },
  { title: 'New Jersey (NJ)', value: 'NJ' },
  { title: 'New Mexico (NM)', value: 'NM' },
  { title: 'New York (NY)', value: 'NY' },
  { title: 'North Carolina (NC)', value: 'NC' },
  { title: 'North Dakota (ND)', value: 'ND' },
  { title: 'Ohio (OH)', value: 'OH' },
  { title: 'Oklahoma (OK)', value: 'OK' },
  { title: 'Oregon (OR)', value: 'OR' },
  { title: 'Pennsylvania (PA)', value: 'PA' },
  { title: 'Rhode Island (RI)', value: 'RI' },
  { title: 'South Carolina (SC)', value: 'SC' },
  { title: 'South Dakota (SD)', value: 'SD' },
  { title: 'Tennessee (TN)', value: 'TN' },
  { title: 'Texas (TX)', value: 'TX' },
  { title: 'Utah (UT)', value: 'UT' },
  { title: 'Vermont (VT)', value: 'VT' },
  { title: 'Virginia (VA)', value: 'VA' },
  { title: 'Washington (WA)', value: 'WA' },
  { title: 'West Virginia (WV)', value: 'WV' },
  { title: 'Wisconsin (WI)', value: 'WI' },
  { title: 'Wyoming (WY)', value: 'WY' }
]

onMounted(() => {
  if (!props.quote.date) props.quote.date = getToday()
  if (!props.quote.clientState) props.quote.clientState = 'MD'
})

const copyCustomerAddress = async () => {
  const street = props.quote.clientStreet?.trim() || ''
  const city = props.quote.clientCityState?.trim() || ''
  const state = props.quote.clientState?.trim() || ''
  const zip = props.quote.clientZip?.trim() || ''
  const address = [street, city, state, zip].filter(Boolean).join(', ')
  if (!address) return

  try {
    await navigator.clipboard.writeText(address)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch (error) {
    console.error('Unable to copy address:', error)
  }
}
</script>

<style scoped>
.header-step {
  width: 100%;
  color: var(--wizard-text)
}

.company-row {
  min-height: 32px;
  display: flex;
  align-items: center;
  margin: 0 0 27px 18px
}

.company-icon {
  margin-right: 15px;
  color: #079b91;
  font-size: 24px
}

.company-details {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 13px;
  color: var(--wizard-muted);
  font-size: 14px;
  line-height: 1.5
}

.company-details strong {
  color: var(--wizard-heading);
  font-size: 14px;
  font-weight: 700
}

.form-card {
  width: 100%;
  padding: 38px 30px 28px;
  border: 1px solid var(--wizard-border) !important;
  border-radius: 6px !important;
  background: var(--wizard-surface) !important;
  box-shadow: none !important
}

.estimate-field {
  width: 100%
}

.estimate-field :deep(.v-field) {
  min-height: 56px;
  border-radius: 6px;
  background: var(--wizard-input) !important;
  box-shadow: none
}

.estimate-field :deep(.v-field__outline) {
  --v-field-border-opacity: 1;
  color: var(--wizard-border)
}

.estimate-field :deep(.v-field__input) {
  min-height: 54px;
  padding-top: 0;
  padding-bottom: 0;
  color: var(--wizard-text);
  font-size: 14px
}

.estimate-field :deep(.v-label) {
  color: var(--wizard-muted);
  font-size: 14px
}

.estimate-field :deep(.v-field--focused .v-field__outline) {
  color: #079b91
}

.estimate-field :deep(.v-icon) {
  color: var(--wizard-icon)
}

.header-form-row > :deep(.v-col) {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}

.prepared-title {
  padding-top: 24px !important;
  padding-bottom: 12px !important;
  color: var(--wizard-heading);
  font-size: 18px;
  font-weight: 700
}

.copy-wrapper {
  display: flex;
  align-items: center
}

.copy-address {
  width: 100%;
  height: 56px !important;
  border: 1px solid #a9ddd8 !important;
  border-radius: 6px;
  color: #07958d !important;
  background: var(--wizard-surface) !important;
  font-size: 13px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0
}

.copy-address :deep(.v-icon) {
  color: #07958d
}

.copy-address:hover {
  background: var(--wizard-hover) !important
}

:global(.v-theme--light) .header-step {
  --wizard-surface: #ffffff;
  --wizard-input: #ffffff;
  --wizard-text: #26385e;
  --wizard-heading: #101e44;
  --wizard-muted: #617397;
  --wizard-icon: #34476a;
  --wizard-border: #d4dce7;
  --wizard-hover: #f2fbfa;
}

:global(.v-theme--dark) .header-step {
  --wizard-surface: #1e1e1e;
  --wizard-input: #242424;
  --wizard-text: #e6e8eb;
  --wizard-heading: #ffffff;
  --wizard-muted: #aeb5c0;
  --wizard-icon: #b9c0ca;
  --wizard-border: #3b3f46;
  --wizard-hover: #293735;
}

@media (max-width:900px) {
  .company-row {
    margin-left: 0
  }

  .company-details {
    gap: 7px
  }

  .form-card {
    padding: 25px 18px
  }
}
</style>