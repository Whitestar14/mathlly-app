<template>
  <button
    class="flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200"
    :class="[
      active 
        ? 'bg-indigo-500 text-white shadow-lg' 
        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
      'hover:scale-105 active:scale-95'
    ]"
    @click="$emit('click')"
  >
    <component
      :is="iconComponent"
      class="h-5 w-5 mb-1"
    />
    <span class="text-xs font-medium">{{ label }}</span>
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
