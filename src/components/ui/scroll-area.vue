<script setup>
import { ScrollArea as ScrollAreaPrimitive } from 'radix-vue'
</script>

<template>
  <ScrollAreaPrimitive class="relative overflow-hidden">
    <ScrollAreaPrimitive.Viewport class="h-full w-full rounded-[inherit]">
      <slot />
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar
      class="flex touch-none select-none transition-colors"
      orientation="vertical"
    >
      <ScrollAreaPrimitive.Thumb class="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive>
</template>


