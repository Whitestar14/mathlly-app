<template>
  <div class="bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
    <!-- Tool Grid -->
    <div class="p-4">
      <div class="grid grid-cols-3 gap-3 min-w-[240px]">
        <DockItem
          v-for="tool in tools"
          :key="tool.key"
          :icon="tool.icon"
          :label="tool.label"
          :active="activePanels[tool.key]"
          @click="emit('togglePanel', tool.key)"
        />
      </div>
    </div>
    
    <!-- Panel Navigation (when multiple panels are active) -->
    <div
      v-if="activePanelKeys.length > 1"
      class="px-4 py-3 border-t border-gray-600/50 bg-gray-800/50"
    >
      <div class="flex items-center justify-center gap-3">
        <span class="text-xs text-gray-400 font-medium">Active Panels:</span>
        <div class="flex items-center gap-2">
          <button
            v-for="(panelKey, index) in activePanelKeys"
            :key="panelKey"
            v-tippy="{ content: getPanelTitle(panelKey) }"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200"
            :class="panelKey === currentPanel 
              ? 'bg-indigo-500 text-white shadow-lg scale-110' 
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:scale-105'"
            @click="emit('setCurrentPanel', panelKey)"
          >
            {{ index + 1 }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="px-4 py-3 border-t border-gray-600/50 bg-gray-800/30">
      <div class="flex items-center justify-between">
        <button
          v-tippy="{ content: 'Close All Panels' }"
          class="text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
          @click="emit('closeAll')"
        >
          Clear All
        </button>
        
        <div class="flex items-center gap-2">
          <!-- Panel Navigation Arrows -->
          <button
            v-if="activePanelKeys.length > 1 && currentPanelIndex > 0"
            v-tippy="{ content: 'Previous Panel (←)' }"
            class="w-7 h-7 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
            @click="emit('navigatePanel', -1)"
          >
            <ChevronLeftIcon class="h-4 w-4 text-gray-300" />
          </button>
          
          <button
            v-if="activePanelKeys.length > 1 && currentPanelIndex < activePanelKeys.length - 1"
            v-tippy="{ content: 'Next Panel (→)' }"
            class="w-7 h-7 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
            @click="emit('navigatePanel', 1)"
          >
            <ChevronRightIcon class="h-4 w-4 text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';
import DockItem from './DockItem.vue';

interface Tool {
  key: string;
  icon: string;
  label: string;
  title: string;
}

interface Props {
  tools: Tool[];
  activePanels: Record<string, boolean>;
  activePanelKeys: string[];
  currentPanel: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  togglePanel: [panel: string];
  setCurrentPanel: [panel: string];
  navigatePanel: [direction: number];
  closeAll: [];
}>();

const currentPanelIndex = computed(() => {
  if (!props.currentPanel) return -1;
  return props.activePanelKeys.indexOf(props.currentPanel);
});

const getPanelTitle = (panelKey: string) => {
  const tool = props.tools.find(t => t.key === panelKey);
  return tool?.title || '';
};
</script>
