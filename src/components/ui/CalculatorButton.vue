<template>
  <button
    :class="[
      'calc-btn calc-btn-grid disabled:calc-btn-disabled',
      `calc-${variant}-btn`,
    ]"
    :disabled="disabled"
    @click="$emit('click', value)"
  >
    <component 
      v-if="icon" 
      :is="icon" 
      class="w-6 h-6 mx-auto"
    />
    <span v-else>{{ value }}</span>
  </button>
</template>

<script setup>
defineProps({
  value: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'number',
    validator: (val) => ['number', 'operator', 'function', 'memory'].includes(val)
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>
