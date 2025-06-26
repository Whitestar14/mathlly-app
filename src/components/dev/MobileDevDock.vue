<template>
  <div class="fixed bottom-0 left-0 right-0 z-50">
    <!-- Mobile Dock Trigger -->
    <div
      v-if="!isExpanded"
      class="flex justify-center"
    >
      <button
        class="bg-gray-900/95 backdrop-blur-xl rounded-t-2xl border border-gray-700/50 border-b-0 shadow-2xl px-4 py-2 flex items-center gap-2"
        @click="$emit('toggleExpanded')"
      >
        <div class="flex items-center gap-1">
          <div
            v-for="panel in activePanelKeys"
            :key="panel"
            class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"
          />
        </div>
        <span class="text-white text-xs font-medium">
          Dev Tools {{ activePanelCount > 0 ? `(${activePanelCount})` : '' }}
        </span>
        <ChevronUpIcon class="h-4 w-4 text-white" />
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
        class="bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 shadow-2xl h-[70vh] flex flex-col"
      >
        <!-- Mobile Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Developer Tools</h2>
          <button
            class="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
            @click="$emit('toggleExpanded')"
          >
            <ChevronDownIcon class="h-5 w-5" />
          </button>
        </div>
        
        <!-- Mobile Tool Selector -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-3 gap-2">
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
        <div class="flex-1 overflow-hidden">
          <div
            v-if="activePanelKeys.length === 0"
            class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"
          >
            <div class="text-center">
              <DatabaseIcon class="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Select a tool to get started</p>
            </div>
          </div>
          
          <!-- Active Panels (Mobile shows one at a time) -->
          <div
            v-for="(panelKey, index) in activePanelKeys"
            :key="panelKey"
            v-show="index === activeMobilePanelIndex"
            class="h-full overflow-y-auto p-4"
          >
            <component :is="getPanelComponent(panelKey)" />
          </div>
          
                    <!-- Mobile Panel Navigation -->
          <div
            v-if="activePanelKeys.length > 1"
            class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-gray-900/90 rounded-full p-2"
          >
            <button
              v-for="(panelKey, index) in activePanelKeys"
              :key="panelKey"
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors"
              :class="index === activeMobilePanelIndex 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
              @click="$emit('setActiveMobilePanelIndex', index)"
            >
              {{ index + 1 }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronUpIcon, ChevronDownIcon, DatabaseIcon } from 'lucide-vue-next';
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
