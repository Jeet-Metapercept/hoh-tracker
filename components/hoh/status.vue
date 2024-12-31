<script setup lang="ts">
import { 
  ref as dbRef,
  limitToLast,
  orderByChild,
  // push,
  query,
  // serverTimestamp,
  update
} from "firebase/database"
import { useDatabase, useDatabaseList, useDatabaseObject } from "vuefire"

const colorMode = useColorMode()

const gaugePrimaryColor = computed(() => "rgb(233,0,82)")
const gaugeSecondaryColor = computed(() => 
  colorMode.value === "dark" 
    ? "rgba(255, 255, 255, 0.1)" 
    : "rgba(0, 0, 0, 0.1)"
)

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
const { data: statusData, pending: statusPending } = useDatabaseObject<HohStatus>(statusRef)

// Get the overall progress value from the latest history item
const value = computed(() => {
  if (!historyData.value?.length) return 0
  return historyData.value[0].process
})

const toggleStatus = async () => {
  await update(statusRef, { status: !statusData.value?.status })
}

const historyRef = dbRef(db, "history")
const historyQuery = query(
  historyRef,
  orderByChild("created_at"),
  limitToLast(10)
)

const { data: historyDataRaw, pending: historyPending } = useDatabaseList<HohData>(historyQuery)
const historyData = computed(() => {
  if (!historyDataRaw.value) return []
  return [...historyDataRaw.value].reverse()
})


// const newStep = ref("")
// const newProcess = ref(0)

// const addHistoryItem = async () => {
//     if (!newStep.value) return

//     const newItem = {
//       step: newStep.value,
//       status: false,
//       process: newProcess.value,
//       created_at: serverTimestamp(),
//       updated_at: serverTimestamp()
//     }

//     await push(historyRef, newItem)
//     newStep.value = ""
//     newProcess.value = Math.min(newProcess.value + 10, 100)
// }
</script>

<template>
  <div class="gague max-w-6xl">
    <div class="flex flex-col justify-center gap-8 my-8">
      <!-- Circular Progress Bar -->
      <div class="flex justify-center">
        <InspiraAnimatedCircularProgressBar
          :gauge-primary-color="gaugePrimaryColor"
          :gauge-secondary-color="gaugeSecondaryColor"
          :max="100"
          :min="0"
          :value="value"
        />
      </div>

      <!-- Status Controls -->
      <div class="flex justify-center gap-4">
        <Badge :variant="statusData?.status ? 'default' : 'destructive'">
          {{ statusData?.status ? "Online" : "Offline" }}
        </Badge>
        <Button :disabled="statusPending" @click="toggleStatus">
          Toggle Status
        </Button>
      </div>

      <!-- Add History Form -->
      <!-- <div class="flex justify-center">
        <form class="flex gap-4 max-w-2xl w-full" @submit.prevent="addHistoryItem">
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
      </div> -->

      <!-- History List -->
      <div class="max-w-2xl mx-auto w-full">
        <InspiraTracingBeam v-if="!historyPending" class="px-6">
          <div class="relative max-w-2xl pt-3 antialiased text-left">
            <div v-for="item in historyData" :key="item.id" class="mb-10">
              <Badge class="mb-2" variant="secondary">
                {{ new Date(item.created_at).toLocaleString() }}
              </Badge>

              <div class="mb-2">
                <Alert>
                  <div class="flex gap-2">
                    <Icon name="lucide:terminal" class="w-4 h-4" />
                    <AlertDescription>{{item.step}}</AlertDescription>
                  </div>
                  <Progress :model-value="item.process" class="my-2" />
                  <p class=" text-sm text-gray-500">
                    Progress: {{ item.process }}%
                  </p>
                </Alert>
              </div>
            </div>

            <div
              v-if="historyData && !historyData.length"
              class="text-gray-500 py-4"
            >
              No items available
            </div>
          </div>
        </InspiraTracingBeam>

        <div v-if="historyPending" class="flex justify-center py-8">
          <div
            class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
          />
        </div>
      </div>
    </div>
  </div>
</template>