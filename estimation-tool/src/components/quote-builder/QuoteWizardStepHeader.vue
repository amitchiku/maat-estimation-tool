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
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field v-model="quote.name" label="Proposal name / title *" variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field v-model="quote.date" label="Date" type="date" variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" class="prepared-title">Prepared For:</v-col>

        <v-col cols="12" md="6">
          <v-text-field v-model="quote.clientName" label="Customer name *" prepend-inner-icon="mdi-account-outline" variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field v-model="quote.clientStreet" label="Customer street address *" prepend-inner-icon="mdi-map-marker-outline" variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field v-model="quote.clientCityState" label="City *" prepend-inner-icon="mdi-city-variant-outline" variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field label="State *" prepend-inner-icon="mdi-map-outline" append-inner-icon="mdi-chevron-down" variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field label="ZIP *" prepend-inner-icon="mdi-email-outline" variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" md="10">
          <v-text-field v-model="quote.projectAddress" label="Project address *" prepend-inner-icon="mdi-map-marker-outline" variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" md="2" class="copy-wrapper">
          <v-btn variant="outlined" class="copy-address" prepend-icon="mdi-content-copy" @click="copyCustomerAddress">
            {{ copied ? 'Copied!' : 'Copy Address' }}
          </v-btn>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field v-model="quote.preparedBy" label="Prepared by *" prepend-inner-icon="mdi-account-outline" variant="outlined" hide-details class="estimate-field" />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field v-model="quote.preparedByPhone" label="Prepared by phone number (optional)" prepend-inner-icon="mdi-phone-outline" variant="outlined" hide-details class="estimate-field" />
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

const getToday = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

onMounted(() => {
  if (!props.quote.date) props.quote.date = getToday()
})

const copyCustomerAddress = async () => {
  const street = props.quote.clientStreet?.trim() || ''
  const city = props.quote.clientCityState?.trim() || ''
  const address = [street, city].filter(Boolean).join(', ')
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
.header-step{width:100%;color:var(--wizard-text)}
.company-row{min-height:32px;display:flex;align-items:center;margin:0 0 27px 18px}
.company-icon{margin-right:15px;color:#079b91;font-size:24px}
.company-details{display:flex;align-items:center;flex-wrap:wrap;gap:13px;color:var(--wizard-muted);font-size:14px;line-height:1.5}
.company-details strong{color:var(--wizard-heading);font-size:14px;font-weight:700}

.form-card{width:100%;padding:38px 30px 28px;border:1px solid var(--wizard-border)!important;border-radius:6px!important;background:var(--wizard-surface)!important;box-shadow:none!important}

.estimate-field{width:100%}
.estimate-field :deep(.v-field){min-height:56px;border-radius:6px;background:var(--wizard-input)!important;box-shadow:none}
.estimate-field :deep(.v-field__outline){--v-field-border-opacity:1;color:var(--wizard-border)}
.estimate-field :deep(.v-field__input){min-height:54px;padding-top:0;padding-bottom:0;color:var(--wizard-text);font-size:14px}
.estimate-field :deep(.v-label){color:var(--wizard-muted);font-size:14px}
.estimate-field :deep(.v-field--focused .v-field__outline){color:#079b91}
.estimate-field :deep(.v-icon){color:var(--wizard-icon)}

.prepared-title{padding-top:17px!important;padding-bottom:7px!important;color:var(--wizard-heading);font-size:18px;font-weight:700}

.copy-wrapper{display:flex;align-items:center}
.copy-address{width:100%;height:56px!important;border:1px solid #a9ddd8!important;border-radius:6px;color:#07958d!important;background:var(--wizard-surface)!important;font-size:13px;font-weight:600;text-transform:none;letter-spacing:0}
.copy-address :deep(.v-icon){color:#07958d}
.copy-address:hover{background:var(--wizard-hover)!important}

:global(.v-theme--light) .header-step{
  --wizard-surface:#ffffff;
  --wizard-input:#ffffff;
  --wizard-text:#26385e;
  --wizard-heading:#101e44;
  --wizard-muted:#617397;
  --wizard-icon:#34476a;
  --wizard-border:#d4dce7;
  --wizard-hover:#f2fbfa;
}

:global(.v-theme--dark) .header-step{
  --wizard-surface:#1e1e1e;
  --wizard-input:#242424;
  --wizard-text:#e6e8eb;
  --wizard-heading:#ffffff;
  --wizard-muted:#aeb5c0;
  --wizard-icon:#b9c0ca;
  --wizard-border:#3b3f46;
  --wizard-hover:#293735;
}

@media (max-width:900px){
  .company-row{margin-left:0}
  .company-details{gap:7px}
  .form-card{padding:25px 18px}
}
</style>