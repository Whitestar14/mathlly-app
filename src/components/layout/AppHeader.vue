<template>
  <header
    class="flex justify-center items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 min-h-14"
  >
    <div class="container mx-auto flex justify-between items-center gap-2">
      <div class="flex items-center justify-between gap-3">
        <Button
          v-tippy="{ content: isSidebarOpen ? 'Close Sidebar': 'Open Sidebar', placement: 'right' }"
          variant="ghost"
          size="icon"
          @click="$emit('toggle-sidebar')"
        >
          <component
            :is="isSidebarOpen ? CircleMinus : CircleEqual"
            class="h-5 w-5"
          />
        </Button>
        <offline-indicator />
      </div>

      <div class="flex-grow flex justify-center sm:justify-end items-center">
        <div class="w-full sm:w-auto flex justify-end items-center space-x-4">
          <Suspense v-if="isCalculatorRoute">
            <div class="w-full inline-flex gap-1 items-center rounded-lg shadow-sm bg-gray-100 dark:bg-gray-700/50 p-1">
              <button
                v-for="mode in availableModes"
                :key="mode.value"
                class="flex-1 px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200"
                :class="[
                  currentCalculatorMode === mode.value 
                    ? 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'
                ]"
                @click="onModeChange(mode.value)"
              >
                {{ mode.shortLabel || mode.label }}
              </button>
            </div>
            <template #fallback>
              <div class="w-full inline-flex items-center rounded-md bg-gray-200 dark:bg-gray-700 p-1 h-10 animate-pulse" />
            </template>
          </Suspense>

          <div class="flex items-center justify-between gap-2">
            <Button
              v-tippy="{content: 'Keyboard Shortcuts'}"
              class="hidden md:flex"
              variant="ghost"
              size="icon"
              @click="$emit('open-shortcut-modal')"
            >
              <Command class="h-5 w-5" />
              <span class="sr-only">Keyboard Shortcuts</span>
            </Button>

            <Button
              v-tippy="{ content: isMenubarOpen ? 'Close Menu': 'Open Menu', placement: 'left' }"
              variant="ghost"
              size="icon"
              @click="$emit('toggle-menubar')"
            >
              <component 
                :is="isMenubarOpen ? CircleMinus : CircleEqual" 
                class="h-5 w-5" 
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import {
  Command,
  CircleEqual,
  CircleMinus, 
} from "lucide-vue-next";
import { useRoute } from "vue-router";
import Button from "@/components/base/BaseButton.vue";
import OfflineIndicator from '@/components/ui/OfflineIndicator.vue';

const props = defineProps({
  currentCalculatorMode: {
    type: String,
    required: true,
  },
  isSidebarOpen: {
    type: Boolean,
    default: false,
  },
  isMenubarOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:mode", 
  "toggle-sidebar", 
  "toggle-menubar",
  "open-shortcut-modal"
]);

const availableModes = [
  { value: 'Standard', label: 'Standard', shortLabel: 'Std' },
  { value: 'Scientific', label: 'Scientific', shortLabel: 'Sci' },
  { value: 'Programmer', label: 'Programmer', shortLabel: 'Prog' }
];

const route = useRoute();
const isCalculatorRoute = computed(() => route.path === '/calculator' || route.path.startsWith('/calculator/'));

const onModeChange = (newMode) => {
  emit("update:mode", newMode);
};
</script>
