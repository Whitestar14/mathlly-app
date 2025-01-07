<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
  },
  size: {
    type: String,
    default: 'default',
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const variantStyles = computed(() => {
  switch (props.variant) {
    case 'default':
      return 'bg-primary text-primary-foreground hover:bg-primary/90'
    case 'destructive':
      return 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
    case 'outline':
      return 'border border-input hover:bg-accent hover:text-accent-foreground'
    case 'secondary':
      return 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
    case 'ghost':
      return 'hover:bg-accent hover:text-accent-foreground'
    case 'link':
      return 'underline-offset-4 hover:underline text-primary'
    default:
      return ''
  }
})

const sizeStyles = computed(() => {
  switch (props.size) {
    case 'default':
      return 'h-10 py-2 px-4'
    case 'sm':
      return 'h-9 px-3 rounded-md'
    case 'lg':
      return 'h-11 px-8 rounded-md'
    case 'icon':
      return 'h-10 w-10'
    default:
      return ''
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    v-bind="$attrs"
    class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
    :class="[variantStyles, sizeStyles]"
  >
    <slot />
  </button>
</template>

