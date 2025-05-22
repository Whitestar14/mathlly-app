<script setup>
import { useBadge } from '@/composables/useBadge';

const props = defineProps({
  type: {
    type: String,
    default: 'soon',
    validator: (value) => ['soon', 'new', 'special', 'custom'].includes(value)
  },
  text: String,
  showNotch: {
    type: Boolean,
    default: false
  },
  pulse: {
    type: Boolean,
    default: false
  }
});

const { getBadgeProps } = useBadge(props.type, props.text);

</script>

<template>
  <span
    class="inline-flex items-center ml-auto text-xs px-2 py-0.5 font-medium font-mono rounded-full"
    :class="getBadgeProps.classes"
  >
    <span 
      v-if="showNotch"
      class="h-2 w-2 rounded-full mr-2"
      aria-hidden="true" 
      :class="[getBadgeProps.notch, { 'animate-pulse': props.pulse || props.type === 'new' }]"
    />
    {{ props.text || getBadgeProps.text }}
  </span>
</template>