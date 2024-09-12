<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
    <div class="container mx-auto flex justify-between items-center">
      <!-- Logo Section -->
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8">
          <img src="@/assets/mathlly-logo.svg" alt="Mathlly Logo" class="w-full h-full" />
        </div>
      </div>
      <!-- Mode Toggle and Theme Switch -->
      <div class="flex-grow flex justify-center sm:justify-end items-center">
        <div class="w-full sm:w-auto flex justify-between sm:justify-end items-center space-x-4">
          <!-- Spacer for left alignment on mobile -->
          <div class="w-8 sm:hidden"></div>

          <!-- Mode Toggler -->
          <SelectRoot v-model="selectedMode" class="relative w-[70%] sm:w-36">
            <SelectTrigger class="w-full px-3 py-2 text-sm font-medium sm:w-36 text-gray-700 bg-gray-100 rounded-md transition-all hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center justify-between">
              <SelectValue :placeholder="mode" />
              <SelectIcon>
                <ChevronDown class="w-4 h-4 ml-1" />
              </SelectIcon>
            </SelectTrigger>
            <SelectPortal>
              <SelectContent class="bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 overflow-hidden border border-gray-200 dark:border-gray-700">
                <SelectViewport class="py-1">
                  <SelectItem v-for="option in ['Basic', 'Standard', 'Programmer']" :key="option" :value="option" class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none">
                    <SelectItemText>{{ option }}</SelectItemText>
                  </SelectItem>
                </SelectViewport>
              </SelectContent>
            </SelectPortal>
          </SelectRoot>

          <!-- Theme Toggle Button -->
          <button
            @click="toggleTheme"
            class="p-2 text-gray-500 rounded-full hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Sun v-if="isDark" class="h-5 w-5" />
            <Moon v-else class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useDark, useToggle } from '@vueuse/core';
import { Sun, Moon, ChevronDown } from 'lucide-vue-next';
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
} from 'radix-vue';

const props = defineProps(['mode']);
const emit = defineEmits(['update:mode']);

const isDark = useDark();
const toggleDark = useToggle(isDark);

const selectedMode = ref(props.mode);

watch(selectedMode, (newMode) => {
  emit('update:mode', newMode);
});

const toggleTheme = () => {
  toggleDark();
};
</script>

<style scoped>
:root {
  --select-content-width: 144px;
}

.select-content {
  width: var(--select-content-width);
}

@media (min-width: 640px) {
  .select-content {
    width: var(--select-content-width);
  }
}
</style>