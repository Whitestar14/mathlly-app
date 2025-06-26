<template>
  <div 
    class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden transition-all duration-200 hover:shadow-2xl"
    :class="panelClasses"
  >
    <!-- Panel Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        {{ title }}
      </h3>
      <button
        v-if="showCloseButton"
        class="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
        @click="$emit('close')"
      >
        <XIcon class="h-4 w-4" />
      </button>
    </div>
    
    <!-- Panel Content -->
    <div 
      class="overflow-y-auto scrollbar-thin"
      :class="contentClasses"
    >
      <div class="p-4">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { XIcon } from 'lucide-vue-next';

interface Props {
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'consistent';
  height?: 'auto' | 'fixed' | 'tall' | 'consistent';
  showCloseButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  height: 'auto',
  showCloseButton: true
});

defineEmits<{
  close: [];
}>();

const panelClasses = computed(() => {
  const classes = [];
  
  // Consistent sizing for desktop dev panels
  if (props.size === 'consistent') {
    classes.push('w-[480px]'); // Fixed consistent width
  } else {
    // Original responsive sizing for mobile/other uses
    classes.push('w-full');
    
    switch (props.size) {
      case 'sm':
        classes.push('md:min-w-64 md:max-w-80');
        break;
      case 'lg':
        classes.push('md:min-w-96 md:max-w-2xl');
        break;
      case 'xl':
        classes.push('md:min-w-[32rem] md:max-w-4xl');
        break;
      default:
        classes.push('md:min-w-80 md:max-w-xl');
    }
  }
  
  return classes.join(' ');
});

const contentClasses = computed(() => {
  const classes = [];
  
  // Consistent height for desktop dev panels
  if (props.height === 'consistent') {
    classes.push('h-[400px]'); // Fixed consistent height
  } else {
    // Original height classes
    switch (props.height) {
      case 'fixed':
        classes.push('h-80');
        break;
      case 'tall':
        classes.push('h-96');
        break;
      default:
        classes.push('max-h-80 md:max-h-96');
    }
  }
  
  return classes.join(' ');
});
</script>
