<script setup lang="ts">
import {
  ref as dbRef,
  limitToLast,
  orderByChild,
  query,
} from "firebase/database";
import { useDatabase, useDatabaseList, useDatabaseObject } from "vuefire";
import {
  differenceInMinutes,
  formatDuration,
  intervalToDuration,
  formatDistanceToNow,
  addMinutes,
} from "date-fns";

const colorMode = useColorMode();

interface HohStatus {
  status: string;
  started_at: string;
  completed_at: string;
  step: string;
}

interface HohHistoryData {
  started_at: string;
  completed_at: string;
  events: string;
}

const db = useDatabase();
const statusRef = dbRef(db, "/hohtracker");
const { data: statusData } = useDatabaseObject<HohStatus>(statusRef);

const historyRef = dbRef(db, "/hohtracker/history");
const historyQuery = query(
  historyRef,
  orderByChild("created_at"),
  limitToLast(5),
);

const { data: historyDataRaw, pending: historyPending } =
  useDatabaseList<HohHistoryData>(historyQuery, { once: true });
const historyData = computed(() => {
  if (!historyDataRaw.value) return [];
  return [...historyDataRaw.value].reverse();
});

const gaugePrimaryColor = computed(() => {
  return statusData.value?.status === "True"
    ? "rgb(74 222 128)"
    : "rgb(233,0,82)";
});

const gaugeSecondaryColor = computed(() =>
  colorMode.value === "dark"
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)",
);

const now = useNow({ interval: 1000 });
const TOTAL_DURATION_MINUTES = 39;
const FAILURE_THRESHOLD_MINUTES = TOTAL_DURATION_MINUTES + 10;

const completedAt = computed(() =>
  statusData.value?.completed_at
    ? new Date(statusData.value.completed_at)
    : null,
);

const targetTime = computed(() =>
  addMinutes(completedAt.value ?? now.value, TOTAL_DURATION_MINUTES),
);

const elapsedMinutes = computed(() => {
  const startTime = completedAt.value ?? now.value;
  const diff = differenceInMinutes(now.value, startTime);
  return Math.min(Math.max(0, diff), TOTAL_DURATION_MINUTES);
});

const elapsedPercentage = computed(() =>
  Math.round((elapsedMinutes.value / TOTAL_DURATION_MINUTES) * 100),
);

const isFailed = computed(
  () =>
    !!statusData.value?.started_at &&
    !!completedAt.value &&
    differenceInMinutes(now.value, completedAt.value) >
      FAILURE_THRESHOLD_MINUTES,
);

const lastRunLabel = computed(() =>
  completedAt.value
    ? formatDistanceToNow(completedAt.value, { addSuffix: true })
    : "—",
);

const lastRunExact = computed(() =>
  completedAt.value ? completedAt.value.toLocaleString() : "—",
);

const offlineLabel = computed(() =>
  completedAt.value
    ? `Oops! Offline since ${formatDistanceToNow(completedAt.value, { addSuffix: true })}`
    : "Oops! Offline",
);

const remainingTimeString = computed(() => {
  const diffInMillis = targetTime.value.getTime() - now.value.getTime();

  if (diffInMillis <= 0) {
    return "Running";
  }

  const duration = intervalToDuration({
    start: now.value.getTime(),
    end: targetTime.value.getTime(),
  });

  return formatDuration(duration, {
    format: ["minutes", "seconds"],
    zero: true,
  });
});

const getAvatarSrc = (event: string): string => {
  const avatarMap: Record<string, string> = {
    Resources: "/hoh/Resources.svg",
    Energy: "/hoh/CampaignEnergy.svg",
    Egypt: "/hoh/EgyptEvent.svg",
    China: "/hoh/ChinaEvent.svg",
    Vikings: "/hoh/VikingsEvent.webp",
    Google: "/hoh/google-icon-logo.svg",
    Atlantis: "/hoh/Atlantis.png",
    "Historic Battle": "/hoh/HistoricBattle.webp",
    Maya: "/hoh/Maya.webp",
    Arabia: "/hoh/Arabia.webp",
  };

  return avatarMap[event] ?? "/hoh/Resources.svg";
};

const historyLabel = (completed: string) =>
  formatDistanceToNow(new Date(completed), { addSuffix: true });
</script>

<template>
  <div class="gague">
    <div class="flex flex-col justify-center gap-4 mb-8">
      <div
        class="relative flex h-[350px] w-full flex-col items-center justify-center overflow-hidden rounded-lg lg:w-full md:w-full">
        <div
          class="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-black dark:text-white">
          <InspiraAnimatedCircularProgressBar
            :gauge-primary-color="gaugePrimaryColor" :gauge-secondary-color="gaugeSecondaryColor" :no-decimals="true"
            :max="100" :min="0"
            :value="statusData?.status === 'True' ? 100 : elapsedPercentage" />
        </div>
        <InspiraRippleComponentRipple
          class="bg-white/5 [mask-image:linear-gradient(to_bottom,white,transparent)]"
          circle-class="border-[hsl(var(--primary))] bg-[#0000]/25 dark:bg-[#fff]/25 rounded-full"
          :base-circle-size="180" :number-of-circles="3" :space-between-circle="40" />
      </div>

      <!-- Status Controls -->
      <div class="max-w-4xl flex flex-col justify-center mx-auto gap-4 -mt-8">
        <Badge v-if="isFailed" :variant="'destructive'" class="justify-center bg-red-600">
          {{ statusData?.status === "True" ? "Offline" : "Failed" }}
        </Badge>
        <Badge
          v-else :variant="'default'" class="justify-center text-white"
          :class="statusData?.status === 'True' ? 'bg-green-400' : 'bg-premier'">
          {{ statusData?.status === "True" ? "Live" : "Snoozed" }}
        </Badge>

        <Alert
          variant="destructive" class="text-center min-w-[300px]"
          :class="statusData?.status === 'True' ? 'border-green-400' : 'border-premier'">
          <AlertDescription v-if="isFailed" class="flex items-center justify-center gap-1">
            <Icon name="lucide:triangle-alert" />
            {{ offlineLabel }}
          </AlertDescription>
          <AlertDescription
            v-else :class="statusData?.status === 'True' ? 'text-green-400' : 'text-premier'"
            class="dark:text-white">{{ statusData?.step || "???" }}
          </AlertDescription>
        </Alert>
      </div>

      <div class="flex flex-col justify-between gap-4 px-4">
        <!-- Last Run -->
        <article class="rounded-lg border border-gray-100 p-4 dark:border-zinc-800">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Last Run</p>
            <p class="text font-medium text-gray-900 dark:text-gray-100">
              {{ lastRunLabel }}
            </p>
          </div>

          <div class="mt-1 flex gap-1 text-green-600 dark:text-green-400">
            <Icon name="lucide:check-check" />
            <p class="flex gap-2 text-xs">
              <span class="text-gray-500 dark:text-gray-400">{{ lastRunExact }}</span>
            </p>
          </div>
        </article>

        <!-- Next Run -->
        <article class="rounded-lg border border-gray-100 p-4 dark:border-zinc-800 text-end">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Next Schdule</p>
            <p class="text font-medium text-gray-900 dark:text-gray-100">
              {{ remainingTimeString }}
            </p>
          </div>

          <div class="mt-1 flex gap-1 text-green-600 dark:text-green-400 justify-end">
            <Icon name="lucide:check-check" />
            <p class="flex gap-2 text-xs">
              <span class="text-gray-500 dark:text-gray-400">{{ targetTime.toLocaleString() }}</span>
            </p>
          </div>
        </article>
      </div>

      <div class="flex items-center gap-3 my-2">
        <Separator class="flex-1" />
        <span class="text-xs text-muted-foreground">History</span>
        <Separator class="flex-1" />
      </div>

      <!-- History List -->
      <div class="max-w-2xl mx-auto w-full">
        <InspiraTracingBeam v-if="!historyPending" class="px-10">
          <div class="relative max-w-2xl pt-3 antialiased text-left">
            <div v-for="item in historyData" :key="item.id" class="mb-10">
              <div class="flex justify-between items-center">
                <Badge class="mb-2" variant="secondary">
                  {{ historyLabel(item.completed_at) }}
                </Badge>
              </div>

              <div class="mb-2">
                <Alert>
                  <div class="flex gap-2 align-center">
                    <AlertDescription class="flex justify-between align-center w-full">
                      <div class="flex space-x-2">
                        <img
                          v-for="(event, index) in item.events.trim().split(',').filter(Boolean)" :key="index"
                          :src="getAvatarSrc(event.trim())" :alt="event" :title="event"
                          class="w-6 h-6 rounded-full" />
                      </div>

                      <Badge class="bg-green-400" variant="default">
                        Complete
                      </Badge>
                    </AlertDescription>
                  </div>
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
