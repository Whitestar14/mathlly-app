<template>
  <header
    class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 h-[64.75px]"
  >
    <div class="container mx-auto flex justify-between items-center">
      <!-- Logo and Sidebar Toggle Section -->
      <div class="flex items-center justify-between pb-1">
        <button
          @click="$emit('toggle-sidebar')"
          v-tippy="{content:'Open Sidebar', placement:'bottom'}"
          class="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 custom-transition"
          :class="[isSidebarOpen ? 'opacity-0 pointer-none' : '']"
        >
          <PanelRightIcon class="h-6 w-6" />
        </button>
      </div>
      <!-- Mode Toggle and Theme Switch -->
      <div class="flex-grow flex justify-center sm:justify-end items-center">
        <div
          class="w-full sm:w-auto flex justify-between sm:justify-end items-center space-x-4"
        >
          <!-- Spacer for left alignment on mobile -->
          <div class="w-8 sm:hidden"></div>

          <!-- Mode Toggler -->
          <SelectRoot v-model="selectedMode" class="relative w-[70%] sm:w-36">
            <SelectTrigger
              class="w-full px-3 py-2 text-sm font-medium sm:w-36 text-gray-700 bg-gray-100 rounded-md transition-all hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center justify-between"
            >
              <SelectValue :placeholder="mode" />
              <SelectIcon>
                <ChevronDown class="w-4 h-4 ml-1" />
              </SelectIcon>
            </SelectTrigger>
            <SelectPortal>
              <SelectContent
                class="bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <SelectViewport class="p-1 rounded-lg">
                  <SelectItem
                    v-for="option in ['Basic', 'Standard', 'Programmer']"
                    :key="option"
                    :value="option"
                    class="px-3 py-2 text-sm text-gray-700 rounded-sm dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none"
                  >
                    <SelectItemText>{{ option }}</SelectItemText>
                  </SelectItem>
                </SelectViewport>
              </SelectContent>
            </SelectPortal>
          </SelectRoot>

          <!-- Theme Toggle Button -->
          <button
            @click="toggleTheme"
            v-tippy="{content:'Toggle theme', placement:'bottom'}"
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
import { useDark, useToggle } from "@vueuse/core";
import { ChevronDown, Moon, PanelRightIcon, Sun } from "lucide-vue-next";
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "radix-vue";
import { defineEmits, defineProps, ref, watch } from "vue";

const props = defineProps(["mode", "isSidebarOpen", "isMobile"]);
const emit = defineEmits(["update:mode", "toggle-sidebar"]);
const isDark = useDark();
const toggleDark = useToggle(isDark);
const selectedMode = ref(props.mode);

watch(selectedMode, (newMode) => emit("update:mode", newMode));

const toggleTheme = () => toggleDark();
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

.pointer-none {
  pointer-events: none;
}

.custom-transition {
  transition: opacity 0.3s ease;
}
</style>
