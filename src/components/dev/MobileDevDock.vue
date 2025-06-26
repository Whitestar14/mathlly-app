<template>
  <div class="fixed bottom-0 left-0 right-0 z-50">
    <!-- Mobile Dock Trigger -->
    <div
      v-if="!isExpanded"
      class="flex justify-center"
    >
      <button
        class="bg-gray-900/95 backdrop-blur-xl rounded-t-2xl border border-gray-700/50 border-b-0 shadow-2xl px-4 py-2 flex items-center gap-2 hover:bg-gray-800/95 transition-colors"
        @click="$emit('toggleExpanded')"
      >
        <div class="flex items-center gap-1">
          <div
            v-for="panel in activePanelKeys"
            :key="panel"
            class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"
          />
        </div>
        <span class="text-gray-100 text-xs font-medium">
          Dev Tools {{ activePanelCount > 0 ? `(${activePanelCount})` : '' }}
        </span>
        <ChevronUpIcon class="h-4 w-4 text-gray-100" />
      </button>
    </div>
    
    <!-- Mobile Expanded Panel -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="transform translate-y-full"
      enter-to-class="transform translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="transform translate-y-0"
      leave-to-class="transform translate-y-full"
    >
      <div
        v-if="isExpanded"
        class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl h-[85vh] flex flex-col"
      >
        <!-- Mobile Header -->
        <div class="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">
            Developer Tools
          </h2>
          <button
            class="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            @click="$emit('toggleExpanded')"
          >
            <ChevronDownIcon class="h-5 w-5" />
          </button>
        </div>
        
        <!-- Mobile Tool Selector -->
        <div class="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div class="grid grid-cols-3 gap-2 max-w-sm mx-auto">
            <MobileDockItem
              v-for="tool in tools"
              :key="tool.key"
              :icon="tool.icon"
              :label="tool.label"
              :active="activePanels[tool.key]"
              @click="$emit('togglePanel', tool.key)"
            />
          </div>
        </div>
        
        <!-- Mobile Panel Content -->
        <div class="flex-1 overflow-hidden bg-white dark:bg-gray-900">
          <div
            v-if="activePanelKeys.length === 0"
            class="flex items-center justify-center h-full text-gray-600 dark:text-gray-400"
          >
            <div class="text-center px-4">
              <DatabaseIcon class="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <p class="text-sm font-medium">
                Select a tool to get started
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Choose from the options above
              </p>
            </div>
          </div>
          
          <!-- Active Panels (Mobile shows one at a time) -->
          <div
            v-for="(panelKey, index) in activePanelKeys"
            v-show="index === activeMobilePanelIndex"
            :key="panelKey"
            class="h-full overflow-y-auto"
          >
            <div class="p-3">
              <component :is="getPanelComponent(panelKey)" />
            </div>
          </div>
          
          <!-- Mobile Panel Navigation -->
          <div
            v-if="activePanelKeys.length > 1"
            class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-full px-3 py-2 shadow-lg border border-gray-700/50"
          >
            <!-- Previous Button -->
            <button
              :disabled="activeMobilePanelIndex === 0"
              class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
              :class="activeMobilePanelIndex === 0 
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white hover:scale-105'"
              @click="activeMobilePanelIndex > 0 && $emit('setActiveMobilePanelIndex', activeMobilePanelIndex - 1)"
            >
              <ChevronLeftIcon class="h-3.5 w-3.5" />
            </button>
            
            <!-- Panel Indicators -->
            <div class="flex items-center gap-1.5">
              <button
                v-for="(panelKey, index) in activePanelKeys"
                :key="panelKey"
                class="w-1.5 h-1.5 rounded-full transition-all duration-200"
                :class="index === activeMobilePanelIndex 
                  ? 'bg-indigo-400 scale-125' 
                  : 'bg-gray-600 hover:bg-gray-500'"
                @click="$emit('setActiveMobilePanelIndex', index)"
              />
            </div>
            
            <!-- Panel Counter -->
            <span class="text-[10px] font-medium text-gray-300 px-1.5">
              {{ activeMobilePanelIndex + 1 }}/{{ activePanelKeys.length }}
            </span>
            
            <!-- Next Button -->
            <button
              :disabled="activeMobilePanelIndex === activePanelKeys.length - 1"
              class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
              :class="activeMobilePanelIndex === activePanelKeys.length - 1
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white hover:scale-105'"
              @click="activeMobilePanelIndex < activePanelKeys.length - 1 && $emit('setActiveMobilePanelIndex', activeMobilePanelIndex + 1)"
            >
              <ChevronRightIcon class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, DatabaseIcon } from 'lucide-vue-next';
import MobileDockItem from './MobileDockItem.vue';

interface Tool {
  key: string;
  icon: string;
  label: string;
  component: any;
  title: string;
}

interface Props {
  tools: Tool[];
  activePanels: Record<string, boolean>;
  activePanelKeys: string[];
  activeMobilePanelIndex: number;
  isExpanded: boolean;
}

const props = defineProps<Props>();

defineEmits<{
  toggleExpanded: [];
  togglePanel: [panel: string];
  setActiveMobilePanelIndex: [index: number];
}>();

const activePanelCount = computed(() => {
  return Object.values(props.activePanels).filter(Boolean).length;
});

const getPanelComponent = (panelKey: string) => {
  const tool = props.tools.find(t => t.key === panelKey);
  return tool?.component;
};
</script>
