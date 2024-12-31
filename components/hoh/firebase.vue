<script setup lang="ts">
import { 
  ref as dbRef,
  limitToLast,
  orderByChild,
  push,
  query,
  serverTimestamp,
  update 
} from "firebase/database"
import { useDatabase, useDatabaseList, useDatabaseObject } from "vuefire"

interface HohStatus {
  status: boolean
}

interface HohData {
  id: string
  step: string
  status: boolean
  process: number
  created_at: Date
  updated_at: Date
}

const db = useDatabase()
const statusRef = dbRef(db, "status")
const { data, pending } = useDatabaseObject<HohStatus>(statusRef)

const toggleStatus = async () => {
  await update(statusRef, { status: !data.value?.status })
}

// # When status is true, setting to false
// curl -X PATCH \
//   'https://hoh-stats-default-rtdb.asia-southeast1.firebasedatabase.app/.json' \
//   -H 'Content-Type: application/json' \
//   -d '{"status": false}'


const historyRef = dbRef(db, "history")
const historyQuery = query(
  historyRef,
  orderByChild("created_at"),
  limitToLast(2)
)

const { data: historyData, pending: historyPending } = useDatabaseList<HohData>(historyQuery)

const newStep = ref("")
const newProcess = ref(0)

const addHistoryItem = async () => {
  try {
    if (!newStep.value) return

    const newItem = {
      step: newStep.value,
      status: false,
      process: newProcess.value,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    }

    await push(historyRef, newItem)
    newStep.value = ""
    newProcess.value = Math.min(newProcess.value + 10, 100)
  } catch (error) {
    console.error("Error adding history item:", error)
  }
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto">
    <!-- Status Section -->
    <div v-if="pending" class="flex justify-center py-8">
      <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>

    <div v-else class="space-y-4">
      <Badge :variant="data?.status ? 'default' : 'destructive'">
        {{ data?.status ? "Online" : "Offline" }}
      </Badge>
    </div>

    <pre class="mt-4 p-4 rounded bg-gray-100 dark:bg-gray-800">{{ data }}</pre>
    
    <Button :disabled="pending" @click="toggleStatus">Toggle Status</Button>

    <!-- Add History Form -->
    <div class="mt-8">
      <form class="flex gap-4 mb-8" @submit.prevent="addHistoryItem">
        <input
          v-model="newStep"
          type="text"
          placeholder="Step description"
          class="flex-1 rounded-md border p-2"
        />
        <input
          v-model="newProcess"
          type="number"
          min="0"
          max="100"
          class="w-24 rounded-md border p-2"
        />
        <Button type="submit" :disabled="!newStep">Add</Button>
      </form>
    </div>

    <!-- History List -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-4">History</h2>
      
      <div v-if="historyPending" class="flex justify-center py-8">
        <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>

      <div v-else-if="historyData?.length" class="space-y-4">
        <div v-for="item in historyData" :key="item.id" class="border rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <Badge :variant="item.status ? 'default' : 'secondary'">
              {{ item.step }}
            </Badge>
            <span class="text-sm text-muted-foreground">
              {{ new Date(item.created_at).toLocaleString() }}
            </span>
          </div>

          <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              class="bg-primary h-2.5 rounded-full transition-all duration-500"
              :style="{ width: `${item.process}%` }"
            />
          </div>
          <p class="mt-2 text-sm text-muted-foreground">
            Progress: {{ item.process }}%
          </p>
        </div>
      </div>

      <div v-else class="text-center py-8 text-muted-foreground">
        No history items available
      </div>
    </div>
  </div>
</template>