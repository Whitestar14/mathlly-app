<template>
  <div>
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      @click="closePanel"
    ></div>
    <div
      :class="[
        'fixed z-50 bg-white dark:bg-gray-800 shadow-lg overflow-hidden transition-all duration-300 ease-in-out',
        isMobile
          ? 'bottom-0 left-0 right-0 rounded-t-lg h-1/2'
          : ' h-full w-80'
      ]"
      :style="isMobile ? panelStyle : {}"
    >
      <div class="p-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">History</h2>
          <button
            @click="closePanel"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="space-y-2 overflow-y-auto" :class="isMobile ? ' h-[calc(50vh-8rem)]':'h-[calc(100vh-8rem)]'">
          <div
            v-for="(item, index) in history"
            :key="index"
            class="p-2 bg-gray-100 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            @click="onSelectHistoryItem(item)"
          >
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ item.expression }}</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.result }}</div>
          </div>
        </div>
        <button
          v-if="history.length > 0"
          @click="clearHistory"
          class="mt-4 flex items-center justify-center w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          <TrashIcon class="w-4 h-4 mr-2" />
          Clear History
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { TrashIcon, XIcon } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  isMobile: Boolean,
  history: Array,
  clearHistory: Function,
  onSelectHistoryItem: Function,
});

const emit = defineEmits(['close']);

const closePanel = () => {
  emit('close');
};

const panelStyle = computed(() => ({
  transform: props.isOpen ? 'translateY(0)' : 'translateY(100%)',
}));
</script>