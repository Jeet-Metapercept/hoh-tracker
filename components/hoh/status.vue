<script setup lang="ts">
import { 
  ref as dbRef,
  limitToLast,
  orderByChild,
  query,
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

interface HohHistoryData {
  started_at: Date
  completed_at: Date
}

const db = useDatabase()
const statusRef = dbRef(db, "/")
const { data: statusData } = useDatabaseObject<HohStatus>(statusRef)

const historyRef = dbRef(db, "/history")
const historyQuery = query(
  historyRef,
  orderByChild("created_at"),
  limitToLast(5)
)

const { data: historyDataRaw, pending: historyPending } = useDatabaseList<HohHistoryData>(historyQuery)
const historyData = computed(() => {
  if (!historyDataRaw.value) return []
  return [...historyDataRaw.value].reverse()
})
</script>

<template>
  <div class="gague">
    <div class="flex flex-col justify-center gap-8 my-8">
      <!-- Circular Progress Bar -->
      <div class="flex justify-center">
        <InspiraAnimatedCircularProgressBar
          :gauge-primary-color="gaugePrimaryColor"
          :gauge-secondary-color="gaugeSecondaryColor"
          :max="100"
          :min="0"
          :value="74"
        />
      </div>

      <!-- Status Controls -->
      <div class="flex justify-center gap-4">
        <Badge :variant="statusData?.status ? 'default' : 'destructive'">
          {{ statusData?.status ? "Online" : "Offline" }}
        </Badge>
      </div>

      <!-- History List -->
      <div class="max-w-2xl mx-auto w-full">
        <InspiraTracingBeam v-if="!historyPending" class="px-10">
          <div class="relative max-w-2xl pt-3 antialiased text-left">
            <div v-for="(item, index) in historyData" :key="item.id" class="mb-10">
              <div class="flex justify-between items-center">
                <Badge class="mb-2" variant="secondary">
                {{ new Date(item.started_at).toLocaleString() }}
                </Badge>

                <Badge class="mb-2" variant="default">
                  Complete
                </Badge>
                </div>
            

              <div class="mb-2">
                <Alert>
                  <div class="flex gap-2">
                    <Icon name="lucide:terminal" class="w-4 h-4" />
                    <AlertDescription>{{item.completed_at}}</AlertDescription>
                  </div>
                  <Progress :model-value="index * 10" class="my-2" />
                  <p class=" text-sm text-gray-500">
                    Progress: {{ index * 10 }}%
                  </p>
                </Alert>
              </div>
            </div>
          </div>
        </InspiraTracingBeam>

        <div v-if="historyPending" class="flex justify-center py-8">
          <Icon name="svg-spinners:tadpole" class="w-8 h-8" />
        </div>
      </div>
    </div>
  </div>
</template>