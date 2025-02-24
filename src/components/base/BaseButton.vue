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

const variantClass = computed(() => `btn-${props.variant}`)
const sizeClass = computed(() => props.size === 'default' ? 'btn-default-size' : `btn-${props.size}`)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[variantClass.valueOf(), sizeClass.valueOf()]"
    class="btn"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

