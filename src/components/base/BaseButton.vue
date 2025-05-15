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

const variantClass = computed(() => props.variant === 'default' ? 'btn-default' : `btn-${props.variant}`)
const sizeClass = computed(() => props.size === 'default' ? 'btn-default-size' : `btn-${props.size}`)
const classes = {[variantClass.value]: true, [sizeClass.value]: true, 'btn': true};
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="classes"
  >
    <slot />
  </button>
</template>

