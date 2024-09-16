<template>
  <SwitchRoot
    :checked="modelValue"
    @update:checked="updateChecked"
    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    :class="modelValue ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'"
  >
    <SwitchThumb
      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
      :class="modelValue ? 'translate-x-6' : 'translate-x-1'"
    />
  </SwitchRoot>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { SwitchRoot, SwitchThumb } from 'radix-vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const updateChecked = (checked) => {
  emit('update:modelValue', checked);
};
</script>