<script setup lang="ts">
import {
  ref as dbRef,
  query,
  equalTo,
  orderByChild,
} from 'firebase/database'
import { useDatabase, useDatabaseList } from 'vuefire'

const db = useDatabase()
const hohRef = dbRef(db, 'data')

// Filters
const completedItems = query(hohRef, orderByChild('status'), equalTo(true))
const pendingItems = query(hohRef, orderByChild('status'), equalTo(false))

const filter = ref<'all' | 'completed' | 'pending'>('all')

const filteredItems = computed(() => {
  if (filter.value === 'completed') return completedItems
  if (filter.value === 'pending') return pendingItems
  return hohRef
})

const { data: items, pending } = useDatabaseList<HohData>(filteredItems)
</script>

<template>
  <div class="w-full max-w-2xl mx-auto">
    <div v-if="pending" class="flex justify-center py-8">
      <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>

    <div v-else class="space-y-4">
      <div class="flex gap-4">
        <Button 
          :variant="filter === 'all' ? 'default' : 'outline'"
          @click="filter = 'all'"
        >
          All
        </Button>
        <Button 
          :variant="filter === 'completed' ? 'default' : 'outline'"
          @click="filter = 'completed'"
        >
          Completed
        </Button>
        <Button 
          :variant="filter === 'pending' ? 'default' : 'outline'"
          @click="filter = 'pending'"
        >
          Pending
        </Button>
      </div>

      <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto">
        {{ items }}
      </pre>
    </div>
  </div>
</template>