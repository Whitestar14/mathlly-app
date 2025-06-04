<template>
  <AccordionRoot
    :type="multiple ? 'multiple' : 'single'"
    :collapsible="collapsible"
    :default-value="defaultValue"
    :value="modelValue" 
    class="w-full space-y-1"
    :class="rootClass"
    @update:value="$emit('update:modelValue', $event)"
  >
    <slot />
  </AccordionRoot>
</template>
  
  <script setup>
  import { AccordionRoot } from 'radix-vue'
  
  defineProps({
    modelValue: {
      type: [String, Array],
      default: undefined // Important for Radix: undefined if not controlled, otherwise it expects a value
    },
    defaultValue: {
      type: [String, Array],
      default: null
    },
    multiple: {
      type: Boolean,
      default: true
    },
    collapsible: {
      type: Boolean,
      default: true
    },
    rootClass: {
      type: String,
      default: ''
    }
  })
  
  defineEmits(['update:modelValue'])
  </script>
  