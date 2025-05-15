<template>
    <AccordionRoot
      :type="multiple ? 'multiple' : 'single'"
      :collapsible="true"
      :defaultValue="defaultValue"
      :value="modelValue" 
      @update:value="$emit('update:modelValue', $event)"
      class="w-full space-y-1" :class="rootClass"
    >
      <slot />
    </AccordionRoot>
  </template>
  
  <script setup>
  import { AccordionRoot } from 'radix-vue'
  
  defineProps({
    modelValue: { // For v-model usage
      type: [String, Array],
      default: undefined // Important for Radix: undefined if not controlled, otherwise it expects a value
    },
    defaultValue: { // For initial uncontrolled state
      type: [String, Array],
      default: null
    },
    multiple: {
      type: Boolean,
      default: true // Changed default to true as per original usage
    },
    collapsible: { // Added collapsible prop, true is common for accordions
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
  