<template>
  <SelectRoot
    v-model="selectedValue"
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <SelectTrigger
      class="inline-flex items-center text-gray-700 dark:text-gray-300 justify-between w-full font-medium px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/30 focus-colors"
    >
      <SelectValue :placeholder="placeholder" />
      <ChevronDownIcon class="h-4 w-4" />
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        class="z-20 overflow-hidden text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-md"
        :position="position"
        :side-offset="5"
      >
        <SelectScrollUpButton
          class="flex items-center justify-center text-gray-700 dark:text-gray-300 h-[25px] bg-white dark:bg-gray-700 cursor-default"
        >
          <chevron-up-icon class="h-4 w-4" />
        </SelectScrollUpButton>

        <SelectViewport>
          <SelectGroup>
            <div v-if="props.label !== ''">
              <SelectLabel
                class="px-1.5 py-1 text-xs font-medium"
              >
                {{ label }}
              </SelectLabel>
            </div>
            <SelectItem
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              class="outline-none flex w-full items-center text-gray-700 dark:text-gray-300 px-2 py-1.5 text-sm hover:bg-gray-100 first:rounded-t-md last:rounded-b-md dark:hover:bg-gray-700/50 select-none"
            >
              <SelectItemText>{{ option.label }}</SelectItemText>
            </SelectItem>
          </SelectGroup>
        </SelectViewport>

        <SelectScrollDownButton
          class="flex items-center text-gray-700 dark:text-gray-300 justify-center h-[25px] bg-white dark:bg-gray-700cursor-default"
        >
          <ChevronDownIcon class="h-4 w-4" />
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<script setup>
import { ref, watch } from "vue";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectScrollUpButton,
  SelectViewport,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectItemText,
  SelectScrollDownButton,
} from "radix-vue";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: [Number, String],
    required: true,
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "Select an option",
  },
  label: {
    type: String,
    default: "Options",
  },
  position: {
    type: String,
    default: "item-aligned",
  },
});

const emit = defineEmits(["update:model-value"]);

const selectedValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    selectedValue.value = newValue;
  }
);

watch(selectedValue, (newValue) => {
  emit("update:model-value", newValue);
});
</script>

<style>
[data-radix-popper-content-wrapper] {
  width: var(--radix-popper-anchor-width);
  z-index: 20 !important;
}
</style>
