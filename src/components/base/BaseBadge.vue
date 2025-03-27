<script setup>
import { useBadge } from '@/composables/useBadge'

const props = defineProps({
  type: {
    type: String,
    default: 'soon'
  },
  text: {
    type: String,
    default: ''
  },
  showNotch: {
    type: Boolean,
    default: false
  }
})

const { getBadgeProps } = useBadge(props.type, props.text)
</script>

<template>
  <span
    class="inline-flex items-center ml-auto text-xs px-2 py-0.5 font-medium font-mono rounded-full"
    :class="getBadgeProps.classes"
  >
  <span v-if="showNotch" aria-label="notch" class="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-2" />
  {{ getBadgeProps.text }}
  </span>
</template>