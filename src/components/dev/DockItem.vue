<template>
  <button
    v-tippy="{ content: label, placement: 'top' }"
    class="group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
    :class="[
      active 
        ? 'bg-indigo-500 text-white shadow-lg' 
        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 hover:text-white'
    ]"
    @click="$emit('click')"
  >
    <component
      :is="iconComponent"
      class="h-5 w-5 transition-transform duration-200"
      :class="{ 
        'group-hover:rotate-12': icon === 'RefreshCw',
        'group-hover:scale-110': ['Info', 'Activity', 'Terminal', 'Database', 'Keyboard'].includes(icon)
      }"
    />
    
    <!-- Active indicator dot (no pulse) -->
    <div
      v-if="active"
      class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"
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
