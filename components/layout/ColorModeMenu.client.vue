<script setup lang="ts">
defineProps<{
  colorMode: string;
}>();

defineEmits<{
  (e: "update:colorMode", value: string): void;
}>();

const colorModeIcons = new Map<string, string>([
  ["system", "lucide:monitor"],
  ["dark", "lucide:moon"],
  ["light", "lucide:sun"],
]);
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        size="icon"
        class="rounded-full text-premier-foreground"
        variant="ghost"
        aria-label="Color Mode Menu"
      >
        <Icon :name="colorModeIcons.get(colorMode)!" size="18" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem @click="$emit('update:colorMode', 'light')">
        Light
      </DropdownMenuItem>
      <DropdownMenuItem @click="$emit('update:colorMode', 'dark')">
        Dark
      </DropdownMenuItem>
      <DropdownMenuItem @click="$emit('update:colorMode', 'system')">
        System
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
