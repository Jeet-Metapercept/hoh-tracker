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
  status: string
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

    <div
    class="relative flex h-[450px] w-full flex-col items-center justify-center overflow-hidden rounded-lg lg:w-full md:w-full"
  >
    <p
      class="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-black dark:text-white"
    >
      Ripple
    </p>
    <InspiraRippleComponentRipple
      class="bg-white/5 [mask-image:linear-gradient(to_bottom,white,transparent)]"
      circle-class="border-[hsl(var(--primary))] bg-[#0000]/25 dark:bg-[#fff]/25 rounded-full"
    />
  </div>
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
        <Badge :variant="statusData?.status === 'True' ? 'default' : 'destructive'">
          {{ statusData?.status ? "Online" : "Offline" }}
        </Badge>
      </div>
      <Separator label="History" />

      <!-- History List -->
      <div class="max-w-2xl mx-auto w-full">
        <InspiraTracingBeam v-if="!historyPending" class="px-10">
          <div class="relative max-w-2xl pt-3 antialiased text-left">
            <div v-for="(item) in historyData" :key="item.id" class="mb-10">
              <div class="flex justify-between items-center">
                <Badge class="mb-2" variant="secondary">
                {{ new Date(item.started_at).toLocaleString() }}
                </Badge>

                <Badge class="mb-2 bg-emerald-500" variant="default">
                  Complete
                </Badge>
                </div>
            

              <div class="mb-2">
                <Alert>
                  <div class="flex gap-2">
                    <Icon name="lucide:terminal" class="w-4 h-4" />
                    <AlertDescription>{{new Date(item.completed_at).toLocaleString()}}</AlertDescription>
                  </div>
                  <!-- <Progress :model-value="index * 10" class="my-2" /> -->
                  <!-- <p class=" text-sm text-gray-500">Progress: {{ index * 10 }}%</p> -->
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