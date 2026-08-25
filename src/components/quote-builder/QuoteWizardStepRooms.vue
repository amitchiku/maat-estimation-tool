<template>
  <v-card
    border
    elevation="0"
    class="rounded-xl pa-3"
  >
    <!-- Section Header -->
    <div class="d-flex align-center mb-3">
      <div class="text-subtitle-1 font-weight-bold text-slate-800">
        Adjust Item Room Assignments
      </div>

      <v-spacer />

      <v-chip
        size="small"
        color="teal"
        variant="tonal"
        class="font-weight-bold"
      >
        {{ selectedItemsList.length }}
        {{ selectedItemsList.length === 1 ? 'Item' : 'Items' }}
      </v-chip>
    </div>

    <!-- Items Room Assignment Table -->
    <v-card
      border
      elevation="0"
      class="rounded-lg overflow-hidden"
    >
      <v-table density="compact">
        <thead>
          <tr>
            <th class="font-weight-bold">
              Item Name
            </th>

            <th class="font-weight-bold">
              Category
            </th>

            <th
              class="font-weight-bold"
              style="width: 320px;"
            >
              Assigned Proposal Room(s)
            </th>

            <th
              class="font-weight-bold text-center"
              style="width: 80px;"
            >
              Qty
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- Empty State -->
          <tr v-if="selectedItemsList.length === 0">
            <td
              colspan="4"
              class="text-center py-8"
            >
              <div class="empty-state">
                <v-icon
                  icon="mdi-home-search-outline"
                  size="38"
                  color="grey"
                  class="mb-2"
                />

                <div class="text-body-2 font-weight-medium">
                  No items selected
                </div>

                <div class="text-caption text-medium-emphasis mt-1">
                  Return to the item selection step to select items.
                </div>
              </div>
            </td>
          </tr>

          <!-- Selected Items -->
          <tr
            v-for="item in selectedItemsList"
            :key="item.id"
          >
            <!-- Item Name -->
            <td class="font-weight-medium">
              {{ item.name }}
            </td>

            <!-- Category -->
            <td>
              <v-chip
                size="x-small"
                color="teal-lighten-4"
                class="text-teal-darken-3 font-weight-medium"
              >
                {{ item.category || item.group || 'General' }}
              </v-chip>
            </td>

            <!-- Assigned Room(s) -->
            <td class="py-1">
              <v-combobox
                :model-value="getItemAssignedRooms(item)"
                :items="predefinedRoomsList"
                multiple
                chips
                closable-chips
                variant="outlined"
                density="compact"
                hide-details
                placeholder="Select room(s)"
                @update:model-value="
                  val => updateAssignedRooms(item.id, val)
                "
              />
            </td>

            <!-- Quantity -->
            <td class="text-center font-weight-bold">
              {{ item.quantity }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  selectedItemsMap: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'update:selectedItemsMap'
])

const appStore = useAppStore()

const selectedItemsList = computed(() => {
  return Object.values(
    props.selectedItemsMap
  )
})

const predefinedRoomsList = computed(() => {
  if (!appStore.settings?.rooms) {
    return ['General']
  }

  return appStore.settings.rooms.map(
    r => r.code || r.description
  )
})

const getItemAssignedRooms = (item) => {
  if (Array.isArray(item.assignedRooms) && item.assignedRooms.length) {
    return item.assignedRooms
  }
  if (Array.isArray(item.assignedRoom)) {
    return item.assignedRoom
  }
  if (item.assignedRoom) {
    return [item.assignedRoom]
  }
  return [item.defaultRoom || 'General']
}

const updateAssignedRooms = (id, newRooms) => {
  const roomsArr = Array.isArray(newRooms)
    ? newRooms.map(r => (typeof r === 'object' ? (r?.value || r?.title || r) : r))
    : [newRooms]

  const next = {
    ...props.selectedItemsMap
  }

  if (next[id]) {
    next[id].assignedRooms = roomsArr
    next[id].assignedRoom = roomsArr[0] || 'General'

    emit(
      'update:selectedItemsMap',
      next
    )
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>