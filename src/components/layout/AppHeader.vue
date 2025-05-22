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
          <component :is="isSidebarOpen ? CircleMinus : CircleEqual" class="h-5 w-5" />
        </Button>
        <offline-indicator :is-mobile="isMobile" />
      </div>

      <div class="flex-grow flex justify-center sm:justify-end items-center">
        <div class="w-full sm:w-auto flex justify-end items-center space-x-4">
          <Suspense v-if="isCalculatorRoute">
            <div class="relative w-full min-w-36">
              <SelectBar
                :model-value="props.currentCalculatorMode" :options="availableModes"
                position="popper"
                placeholder="Select mode"
                @update:model-value="onModeChange"
              />
            </div>
            <template #fallback>
              <div class="relative w-full min-w-36 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </template>
          </Suspense>

          <div class="flex items-center justify-between gap-2">
            <Button
              class="hidden md:flex"
              v-tippy="{content: 'Keyboard Shortcuts'}"
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
import SelectBar from '@/components/ui/SelectBar.vue';

const props = defineProps({
  isMobile: {
    type: Boolean,
    required: true,
  },
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
  { value: 'Standard', label: 'Standard' },
  { value: 'Scientific', label: 'Scientific' },
  { value: 'Programmer', label: 'Programmer' }
];

const route = useRoute();
const isCalculatorRoute = computed(() => route.path === '/calculator' || route.path.startsWith('/calculator/'));

const onModeChange = (newMode) => {
  emit("update:mode", newMode);
};
</script>