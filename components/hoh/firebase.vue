<script setup lang="ts">
import { ref as dbRef, update } from "firebase/database";
import { useDatabase, useDatabaseObject } from "vuefire";

interface HohStatus {
  status: boolean;
}

const db = useDatabase();
const statusRef = dbRef(db, "/");
const { data, pending } = useDatabaseObject<HohStatus>(statusRef);

const toggleStatus = async () => {
  await update(statusRef, { status: !data.value?.status });
};

// # When status is true, setting to false
// curl -X PATCH \
//   'https://hoh-stats-default-rtdb.asia-southeast1.firebasedatabase.app/.json' \
//   -H 'Content-Type: application/json' \
//   -d '{"status": false}'

</script>

<template>
  <div class="w-full max-w-2xl mx-auto">
    <div v-if="pending" class="flex justify-center py-8">
      <div
        class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
      ></div>
    </div>

    <div v-else class="space-y-4 mx-auto">
      <Badge :variant="data?.status ? 'default' : 'destructive'">
        {{ data?.status ? "Online" : "Offline" }}
      </Badge>
    </div>

    <pre class="mt-4 p-4 rounded bg-gray-100 dark:bg-gray-800">
      {{ data }}
    </pre>
    <Button :disabled="pending" @click="toggleStatus"> Toggle Status </Button>
  </div>
</template>
