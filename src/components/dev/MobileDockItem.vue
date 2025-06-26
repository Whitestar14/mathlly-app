<template>
  <button
    class="flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 min-h-[64px] relative overflow-hidden group"
    :class="[
      active 
        ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md ring-1 ring-indigo-300 dark:ring-indigo-400' 
        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
      'hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900'
    ]"
    @click="$emit('click')"
  >
    <!-- Background gradient for active state -->
    <div
      v-if="active"
      class="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600 opacity-90"
    />
    
    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center">
      <component
        :is="iconComponent"
        class="h-5 w-5 mb-1.5 transition-transform duration-200 group-hover:scale-105"
        :class="active ? 'text-white' : 'text-gray-600 dark:text-gray-400'"
      />
      <span 
        class="text-[10px] font-medium text-center leading-tight"
        :class="active ? 'text-white' : 'text-gray-700 dark:text-gray-300'"
      >
        {{ label }}
      </span>
    </div>
    
    <!-- Active indicator -->
    <div
      v-if="active"
      class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full shadow-sm"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  RefreshCwIcon,
  InfoIcon,
  ActivityIcon,
  TerminalIcon,
  DatabaseIcon,
  KeyboardIcon
} from 'lucide-vue-next';

interface Props {
  icon: string;
  label: string;
  active?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  active: false
});

defineEmits<{
  click: [];
}>();

const iconMap = {
  RefreshCw: RefreshCwIcon,
  Info: InfoIcon,
  Activity: ActivityIcon,
  Terminal: TerminalIcon,
  Database: DatabaseIcon,
  Keyboard: KeyboardIcon
};

const iconComponent = computed(() => iconMap[props.icon as keyof typeof iconMap]);
</script>
