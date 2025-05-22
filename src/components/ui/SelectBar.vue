<template>
  <div class="relative w-full">
    <SelectRoot
      :model-value="modelValue"
      @update:model-value="$emit('update:model-value', $event)"
    >
      <SelectTrigger
        class="inline-flex items-center text-gray-700 dark:text-gray-300 justify-between w-full font-medium px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/30 focus-colors"
      >
        <SelectValue :placeholder="placeholder" />
        <ChevronDownIcon class="h-4 w-4 flex-shrink-0" />
      </SelectTrigger>

      <SelectPortal>
        <SelectContent
          class="select-content z-20 overflow-hidden text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 shadow-md"
          :position="position"
          :side-offset="5"
          :align="align"
        >
          <SelectViewport class="p-1">
            <SelectGroup>
              <SelectLabel
                v-if="label"
                class="px-1.5 py-1 text-xs font-medium"
              >
                {{ label }}
              </SelectLabel>
              
              <SelectItem
                v-for="option in options"
                :key="option.value"
                :value="option.value"
                class="outline-none flex w-full items-center text-gray-700 dark:text-gray-300 px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 select-none rounded"
              >
                <SelectItemText>{{ option.label }}</SelectItemText>
              </SelectItem>
            </SelectGroup>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>

<script setup>
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectItemText,
} from "radix-vue";
import { ChevronDownIcon } from "lucide-vue-next";

defineProps({
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
    default: "",
  },
  position: {
    type: String,
    default: "item-aligned",
  },
  align: {
    type: String,
    default: "center",
  }
});

defineEmits(["update:model-value"]);
</script>

<style>
[data-radix-popper-content-wrapper] {
  width: var(--radix-popper-anchor-width);
  z-index: 20 !important;
}

/* Animation for the select dropdown */
.select-content {
  transform-origin: var(--radix-popper-transform-origin);
  animation: selectContentShow 0.2s ease-out;
}

@keyframes selectContentShow {
  from {
    opacity: 0;
    transform: translateY(-2px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Animation for when the select dropdown is closing */
.select-content[data-state="closed"] {
  animation: selectContentHide 0.1s ease-in;
}

@keyframes selectContentHide {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-2px) scale(0.98);
  }
}

/* Ensure the animation plays smoothly */
.select-content {
  will-change: transform, opacity;
  backface-visibility: hidden;
}
</style>
