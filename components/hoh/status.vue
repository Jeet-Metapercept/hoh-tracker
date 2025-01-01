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
}

const db = useDatabase();
const statusRef = dbRef(db, "/");
const { data: statusData } = useDatabaseObject<HohStatus>(statusRef);

const historyRef = dbRef(db, "/history");
const historyQuery = query(
  historyRef,
  orderByChild("created_at"),
  limitToLast(5),
);

const { data: historyDataRaw, pending: historyPending } =
  useDatabaseList<HohHistoryData>(historyQuery);
const historyData = computed(() => {
  if (!historyDataRaw.value) return [];
  return [...historyDataRaw.value].reverse();
});

const gaugePrimaryColor = computed(() => {
  return statusData.value?.status === "True" ?  "rgb(0,255,133)": "rgb(233,0,82)";
});

const gaugeSecondaryColor = computed(() =>
  colorMode.value === "dark"
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)",
);
// const stepIndex = ref(3)
// const steps = [
//   {
//     step: 1,
//     icon: 'lucide:user',
//     title: 'Your details',
//     description: 'Provide your name and email',
//   },
//   {
//     step: 2,
//     icon: 'lucide:salad',
//     title: 'Company details',
//     description: 'A few details about your company',
//   },
//   {
//     step: 3,
//     icon: 'lucide:vibrate-off',
//     title: 'Invite your team',
//     description: 'Start collaborating with your team',
//   },
// ]

const now = useNow({ interval: 1000 });
const totalDurationMinutes = 60;

const targetTime = computed(() => {
  return addMinutes(
    new Date(statusData.value?.completed_at || Date.now()),
    totalDurationMinutes,
  );
});

const elapsedMinutes = computed(() => {
  const startTime = new Date(statusData.value?.completed_at || Date.now());
  const diff = differenceInMinutes(now.value, startTime);
  const clampedMinutes = Math.min(Math.max(0, diff), totalDurationMinutes);
  return clampedMinutes;
});

// Scale elapsedMinutes to 0–100
const elapsedPercentage = computed(() => {
  return Math.round((elapsedMinutes.value / totalDurationMinutes) * 100);
});

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
</script>

<template>
  <div class="gague">
    <div class="flex flex-col justify-center gap-4 mb-8">
      <div
        class="relative flex h-[350px] w-full flex-col items-center justify-center overflow-hidden rounded-lg lg:w-full md:w-full"
      >
        <div
          class="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-black dark:text-white"
        >
          <InspiraAnimatedCircularProgressBar
            :gauge-primary-color="gaugePrimaryColor"
            :gauge-secondary-color="gaugeSecondaryColor"
            :no-decimals="true"
            :max="100"
            :min="0"
            :value="statusData?.status === 'True' ? 100 : elapsedPercentage"
          />
        </div>
        <InspiraRippleComponentRipple
          class="bg-white/5 [mask-image:linear-gradient(to_bottom,white,transparent)]"
          circle-class="border-[hsl(var(--primary))] bg-[#0000]/25 dark:bg-[#fff]/25 rounded-full"
          :base-circle-size="180"
          :number-of-circles="3"
          :space-between-circle="40"
        />
      </div>

      <!-- Status Controls -->
      <div class="max-w-4xl flex flex-col justify-center mx-auto gap-4 -mt-8">
        <Badge
          :variant="statusData?.status === 'True' ? 'default' : 'destructive'"
          class="justify-center"
          :class="statusData?.status === 'True' ? 'bg-green-400' : ''"
        >
          {{ statusData?.status === "True" ? "Live" : "Offline" }}
        </Badge>

        <Alert variant="destructive" class="text-center min-w-[250px]">
          <AlertDescription>{{ statusData?.step || "???" }}</AlertDescription>
        </Alert>

        <!-- <div class="my-4">
          <Stepper v-model="stepIndex" class="flex w-full items-start gap-2">
            <StepperItem
              v-for="step in steps"
              :key="step.step"
              v-slot="{ state }"
              class="relative flex w-full flex-col items-center justify-center"
              :step="step.step"
            >
              <StepperSeparator
                v-if="step.step !== steps[steps.length - 1].step"
                class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
              />

              <StepperTrigger as-child>
                <Button
                  :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
                  size="icon"
                  class="z-10 rounded-full shrink-0 pointer-events-none"
                  :class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']"
                >
                  <Icon v-if="state === 'completed'" name="lucide:check" class="w-5 h-5"/>
                  <Icon v-if="state === 'active'" name="svg-spinners:180-ring" class="w-5 h-5"/>
                  <Icon v-if="state === 'inactive'"  name="lucide:circle" class="w-5 h-5"/>
                </Button>
              </StepperTrigger>

              <div class="mt-5 flex flex-col items-center text-center">
                <StepperTitle
                  :class="[state === 'active' && 'text-primary']"
                  class="text-sm font-medium transition lg:text-base"
                >
                  {{ step.title }}
                </StepperTitle>
                <StepperDescription
                  :class="[state === 'active' && 'text-primary']"
                  class="sr-only font-light text-xs text-muted-foreground transition md:not-sr-only lg:text-sm"
                >
                  {{ step.description }}
                </StepperDescription>
              </div>
            </StepperItem>
          </Stepper>
        </div> -->
      </div>

      <div class="flex flex-col justify-between gap-4 px-4">
        <!-- Last Run -->
        <article
          class="rounded-lg border border-gray-100 p-4 dark:border-zinc-800"
        >
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Last Run</p>
            <p class="text font-medium text-gray-900 dark:text-gray-100">
              {{
                formatDistanceToNow(new Date(historyData[0].completed_at), {
                  addSuffix: true,
                })
              }}
            </p>
          </div>

          <div class="mt-1 flex gap-1 text-green-600 dark:text-green-400">
            <Icon name="lucide:check-check" />
            <p class="flex gap-2 text-xs">
              <span class="text-gray-500 dark:text-gray-400">
                {{ new Date(historyData[0].completed_at).toLocaleString() }}
              </span>
            </p>
          </div>
        </article>

        <!-- Next Run -->
        <article
          class="rounded-lg border border-gray-100 p-4 dark:border-zinc-800 text-end"
        >
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Next Schdule</p>
            <p class="text font-medium text-gray-900 dark:text-gray-100">
              {{ remainingTimeString }}
            </p>
          </div>

          <div
            class="mt-1 flex gap-1 text-green-600 dark:text-green-400 justify-end"
          >
            <Icon name="lucide:check-check" />
            <p class="flex gap-2 text-xs">
              <span class="text-gray-500 dark:text-gray-400">
                {{ new Date(targetTime).toLocaleString() }}
              </span>
            </p>
          </div>
        </article>
      </div>

      <Separator label="History" class="mb-2" />

      <!-- History List -->
      <div class="max-w-2xl mx-auto w-full">
        <InspiraTracingBeam v-if="!historyPending" class="px-10">
          <div class="relative max-w-2xl pt-3 antialiased text-left">
            <div v-for="item in historyData" :key="item.id" class="mb-10">
              <div class="flex justify-between items-center">
                <Badge class="mb-2" variant="secondary">
                  <!-- {{ new Date(item.started_at).toLocaleString() }} -->
                  {{
                    formatDistanceToNow(new Date(item.completed_at), {
                      addSuffix: true,
                    })
                  }}
                </Badge>

              </div>

              <div class="mb-2">
                <Alert>
                  <div class="flex gap-2">
                    <Icon name="lucide:terminal" class="w-4 h-4" />
                    <AlertDescription class="flex justify-between align-center w-full">{{
                      new Date(item.completed_at).toLocaleString()
                    }}
                  
                      <Badge class="bg-green-400" variant="default">
                        Complete
                      </Badge>  
                  </AlertDescription>
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
