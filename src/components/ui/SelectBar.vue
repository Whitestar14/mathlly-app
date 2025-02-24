<template>
  <select-root
    v-model="selectedValue"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <select-trigger class="inline-flex items-center text-gray-700 dark:text-gray-300 justify-between w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500 dark:focus:ring-indigo-300">
      <select-value :placeholder="placeholder" />
      <select-icon
        class="w-5 h-5 ml-2 -mr-1 text-gray-400"
        aria-hidden="true"
      >
        <chevron-down-icon class="h-5 w-5" />
      </select-icon>
    </select-trigger>
    <select-portal>
      <select-content
        class="overflow-hidden bg-white dark:bg-gray-700 rounded-md shadow-lg"
        :position="position"
        :side-offset="5"
        align-offset="5"
      >
        <select-scroll-up-button class="flex items-center justify-center h-[25px] bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-default">
          <chevron-up-icon class="h-5 w-5" />
        </select-scroll-up-button>
        <select-viewport class="p-1">
          <select-group>
            <div v-if="props.label !== ''">
              <select-label class="px-2 py-1.5 text-xs font-semibold text-gray-900 dark:text-gray-300">
                {{ label }}
              </select-label>
            </div>
            <select-item
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              class="outline-none relative flex items-center px-8 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md cursor-default select-none hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <select-item-text>{{ option.label }}</select-item-text>
              <select-item-indicator class="absolute left-2 inline-flex items-center">
                <check-icon class="h-5 w-5" />
              </select-item-indicator>
            </select-item>
          </select-group>
        </select-viewport>
        <select-scroll-down-button class="flex items-center justify-center h-[25px] bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-default">
          <chevron-down-icon class="h-5 w-5" />
        </select-scroll-down-button>
      </select-content>
    </select-portal>
  </select-root>
</template>

<script setup>
import { ref, watch } from 'vue';
import { SelectRoot, SelectTrigger, SelectValue, SelectIcon, SelectPortal, SelectContent, SelectScrollUpButton, SelectViewport, SelectGroup, SelectLabel, SelectItem, SelectItemText, SelectItemIndicator, SelectScrollDownButton } from 'radix-vue';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: [Number, String],
    required: true
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Select an option'
  },
  label: {
    type: String,
    default: 'Options'
  },
  position: {
    type: String,
    default: 'item-aligned'
  },
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

<style>
[data-radix-popper-content-wrapper] {
  width: var(--radix-popper-anchor-width);
  z-index: 20 !important;
}
</style>