<script setup>
import { useBadge } from '@/composables/useBadge';
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'soon',
    validator: (value) => ['soon', 'new', 'special', 'version'].includes(value)
  },
  text: {
    type: String,
    default: ''
  },
  showNotch: {
    type: Boolean,
    default: false
  },
  pulse: {
    type: Boolean,
    default: false
  }
});

/**
 * Get badge properties from the useBadge composable
 */
const { getBadgeProps, badgeClasses } = useBadge(props.type, props.text);

/**
 * Determine if badge should show animation
 */
const shouldPulse = computed(() => 
  props.pulse || props.type === 'new'
);

/**
 * Get notch color based on badge type
 */
const notchColorClass = computed(() => {
  const colors = {
    soon: 'bg-gray-400 dark:bg-gray-500',
    new: 'bg-green-500 dark:bg-green-400',
    special: 'bg-yellow-500 dark:bg-yellow-400',
    version: 'bg-indigo-500 dark:bg-indigo-400'
  };
  return colors[props.type] || colors.soon;
});

/**
 * Get badge text with fallback
 */
const badgeText = computed(() => {
  if (props.type === 'version' && props.text) {
    return props.text;
  }
  
  const texts = {
    soon: 'Coming Soon',
    new: 'New',
    special: 'Special',
    version: 'Version'
  };
  
  return texts[props.type] || 'Badge';
});
</script>

<template>
  <span
    class="inline-flex items-center ml-auto text-xs px-2 py-0.5 font-medium font-mono rounded-full"
    :class="[badgeClasses, { 'animate-pulse': shouldPulse }]"
  >
    <span 
      v-if="showNotch" 
      aria-label="notch" 
      class="h-2 w-2 rounded-full mr-2"
      :class="notchColorClass"
    />
    {{ props.text || badgeText || getBadgeProps?.text }}
  </span>
</template>

<style scoped>
@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse {
  animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
