<script setup lang="ts">
import { ref as dbRef } from 'firebase/database'
import { useDatabase, useDatabaseObject } from 'vuefire'

interface HohStatus {
  status: boolean;
}

const db = useDatabase()
const statusRef = dbRef(db, 'status')
const { data, pending } = useDatabaseObject<HohStatus>(statusRef)
</script>

<template>
  <div class="w-full max-w-2xl mx-auto">
    <div v-if="pending" class="flex justify-center py-8">
      <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>

  
    <div v-else class="space-y-4">
      <Badge :variant="data?.status ? 'default' : 'secondary'">
        {{ data?.status ? 'Online' : 'Offline' }}
      </Badge>
    </div>


    
  </div>
</template>