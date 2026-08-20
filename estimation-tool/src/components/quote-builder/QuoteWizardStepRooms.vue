<template>
  <v-card border elevation="0" class="rounded-xl pa-4">
    <div class="d-flex align-center mb-4">
      <v-avatar color="teal-lighten-5" size="44" class="mr-3">
        <v-icon icon="mdi-home-group" color="teal" size="24"></v-icon>
      </v-avatar>
      <div>
        <h2 class="text-h6 font-weight-bold text-slate-800">Room Summary & Auto-Collection</h2>
        <p class="text-caption text-medium-emphasis mb-0">Step 3 of 4: Rooms collected automatically from selected items' default rooms</p>
      </div>
      <v-spacer></v-spacer>
      <v-chip color="teal" variant="flat" class="font-weight-bold">
        {{ roomSummaryCards.length }} Rooms Collected
      </v-chip>
    </div>

    <v-divider class="mb-4"></v-divider>

    <!-- Room Summary Chips & Count Cards -->
    <div class="mb-4">
      <div class="text-subtitle-2 font-weight-bold text-slate-800 mb-2">Collected Rooms Overview</div>
      <v-row density="compact">
        <v-col v-for="rm in roomSummaryCards" :key="rm.name" cols="12" sm="6" md="3">
          <v-card border elevation="0" class="pa-3 rounded-lg bg-teal-lighten-5">
            <div class="d-flex align-center justify-space-between">
              <span class="font-weight-bold text-teal-darken-3">{{ rm.name }}</span>
              <v-chip size="x-small" color="teal" variant="flat" class="font-weight-bold">
                {{ rm.count }} {{ rm.count === 1 ? 'Item' : 'Items' }}
              </v-chip>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Items Room Assignment Table -->
    <div class="text-subtitle-2 font-weight-bold text-slate-800 mb-2">
      Adjust Item Room Assignments
    </div>
    <v-card border elevation="0" class="rounded-lg overflow-hidden">
      <v-table density="compact">
        <thead>
          <tr>
            <th class="font-weight-bold">Item Name</th>
            <th class="font-weight-bold">Group</th>
            <th class="font-weight-bold">Default Room</th>
            <th class="font-weight-bold" style="width: 240px;">Assigned Proposal Room</th>
            <th class="font-weight-bold text-center">Qty</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="selectedItemsList.length === 0">
            <td colspan="5" class="text-center py-6 text-medium-emphasis">
              No items selected in Step 2. Please return to Step 2 to select items.
            </td>
          </tr>
          <tr v-for="item in selectedItemsList" :key="item.id">
            <td class="font-weight-medium">{{ item.name }}</td>
            <td>
              <v-chip size="x-small" color="teal-lighten-4" class="text-teal-darken-3 font-weight-medium">
                {{ item.group || 'General' }}
              </v-chip>
            </td>
            <td class="text-medium-emphasis">{{ item.defaultRoom || '-' }}</td>
            <td class="py-1">
              <v-combobox
                :model-value="item.assignedRoom || item.defaultRoom || 'General'"
                :items="predefinedRoomsList"
                variant="outlined"
                density="compact"
                hide-details
                @update:model-value="val => updateAssignedRoom(item.id, val)"
              ></v-combobox>
            </td>
            <td class="text-center font-weight-bold">{{ item.quantity }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { useAppStore } from '@/stores/app';

const props = defineProps({
  selectedItemsMap: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:selectedItemsMap']);

const appStore = useAppStore();

const selectedItemsList = computed(() => {
  return Object.values(props.selectedItemsMap);
});

const predefinedRoomsList = computed(() => {
  if (!appStore.settings?.rooms) return ['General'];
  return appStore.settings.rooms.map(r => r.code || r.description);
});

const roomSummaryCards = computed(() => {
  const counts = {};
  selectedItemsList.value.forEach(item => {
    const rm = item.assignedRoom || item.defaultRoom || 'General';
    counts[rm] = (counts[rm] || 0) + 1;
  });

  return Object.keys(counts).map(rm => ({
    name: rm,
    count: counts[rm]
  }));
});

const updateAssignedRoom = (id, newRoom) => {
  const targetRoom = typeof newRoom === 'object' ? (newRoom.value || newRoom.title || newRoom) : newRoom;
  const next = { ...props.selectedItemsMap };
  if (next[id]) {
    next[id].assignedRoom = targetRoom;
    emit('update:selectedItemsMap', next);
  }
};
</script>
