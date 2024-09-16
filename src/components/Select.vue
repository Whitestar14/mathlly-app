<template>
  <SelectRoot v-model="selectedValue" :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <SelectTrigger class="inline-flex items-center text-gray-700 dark:text-gray-300 justify-between w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      <SelectValue :placeholder="placeholder" />
      <SelectIcon class="w-5 h-5 ml-2 -mr-1 text-gray-400" aria-hidden="true">
        <ChevronDownIcon />
      </SelectIcon>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent class="overflow-hidden bg-white dark:bg-gray-700 rounded-md shadow-lg">
        <SelectScrollUpButton class="flex items-center justify-center h-[25px] bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-default">
          <ChevronUpIcon />
        </SelectScrollUpButton>
        <SelectViewport class="p-1">
          <SelectGroup>
            <SelectLabel class="px-2 py-1.5 text-xs font-semibold text-gray-900 dark:text-gray-300">
              {{ label }}
            </SelectLabel>
            <SelectItem v-for="option in options" :key="option.value" :value="option.value" class="relative flex items-center px-8 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md cursor-default select-none hover:bg-gray-100 dark:hover:bg-gray-600">
              <SelectItemText>{{ option.label }}</SelectItemText>
              <SelectItemIndicator class="absolute left-2 inline-flex items-center">
                <CheckIcon class="w-4 h-4" />
              </SelectItemIndicator>
            </SelectItem>
          </SelectGroup>
        </SelectViewport>
        <SelectScrollDownButton class="flex items-center justify-center h-[25px] bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-default">
          <ChevronDownIcon />
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue';
import { SelectRoot, SelectTrigger, SelectValue, SelectIcon, SelectPortal, SelectContent, SelectScrollUpButton, SelectViewport, SelectGroup, SelectLabel, SelectItem, SelectItemText, SelectItemIndicator, SelectScrollDownButton } from 'radix-vue';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from 'lucide-vue-next';

const props = defineProps({
  modelValue: Number,
  options: Array,
  placeholder: {
    type: String,
    default: 'Select an option'
  },
  label: {
    type: String,
    default: 'Options'
  }
});

const emit = defineEmits(['update:modelValue']);

const selectedValue = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  selectedValue.value = newValue;
});

watch(selectedValue, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>