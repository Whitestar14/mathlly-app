<template>
  <SwitchRoot
    :checked="modelValue"
    class="relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500 dark:focus:ring-indigo-300"
    :class="modelValue ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'"
    @update:checked="updateChecked"
  >
    <SwitchThumb
      class="inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform"
      :class="modelValue ? 'translate-x-5' : 'translate-x-1'"
    />
  </SwitchRoot>
</template>

<script setup>
import { SwitchRoot, SwitchThumb } from 'radix-vue';

defineProps({
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