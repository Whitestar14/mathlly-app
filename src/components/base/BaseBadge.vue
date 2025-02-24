<script setup>
import { useBadge } from '@/composables/useBadge'

const props = defineProps({
  type: {
    type: String,
    default: 'soon'
  }
})

const { getBadgeProps } = useBadge(props.type)
</script>

<template>
  <span
    class="ml-auto text-xs px-2 py-0.5 rounded-full"
    :class="getBadgeProps.classes"
  >
    {{ getBadgeProps.text }}
  </span>
</template>