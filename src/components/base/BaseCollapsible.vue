<template>
    <CollapsibleRoot
      v-model:open="isOpen"
      class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm mb-4"
      :class="customClass"
    >
        <CollapsibleTrigger
          class="group flex flex-1 data-[state='open']:border-b border-gray-200 dark:border-gray-700 items-center justify-between p-4 text-left font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 transition-colors w-full"
          :class="headerClass"
        >
          <div class="flex items-center space-x-3">
            <component 
              v-if="icon" 
              :is="resolvedIcon" 
              class="h-5 w-5 text-indigo-600 dark:text-indigo-400" 
              :class="iconClass"
              aria-hidden="true"
            />
            <span class="text-base font-semibold text-gray-900 dark:text-gray-100">{{ title }}</span>
          </div>
          <ChevronDownIcon 
            class="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] indicator-icon"
            :class="{ 'rotate-180': isOpen }"
            aria-hidden="true"
          />
        </CollapsibleTrigger>
      
      <CollapsibleContent 
        class="overflow-hidden text-sm radix-collapsible-content"
      >
        <div class="p-4 pt-2 text-gray-700 dark:text-gray-300" :class="contentClass">
          <slot></slot>
        </div>
      </CollapsibleContent>
    </CollapsibleRoot>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { 
    CollapsibleRoot, 
    CollapsibleTrigger, 
    CollapsibleContent 
  } from 'radix-vue';
  import { ChevronDownIcon } from 'lucide-vue-next';
  import * as LucideIcons from 'lucide-vue-next';
  
  const props = defineProps({
    id: { // Still useful for keys or other identification
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: ''
    },
    defaultOpen: {
      type: Boolean,
      default: true // Let's default to open for settings sections
    },
    customClass: String,
    headerClass: String,
    contentClass: String,
    iconClass: String,
  });
  
  const isOpen = ref(props.defaultOpen);

  const resolvedIcon = computed(() => {
    if (!props.icon) return null;
    return LucideIcons[props.icon] || LucideIcons.SettingsIcon; // Fallback icon
  });

  </script>
  
  <style>

  .radix-collapsible-content[data-state='open'] {
    animation: slideDownCollapsible 300ms cubic-bezier(0.87, 0, 0.13, 1);
  }
  
  .radix-collapsible-content[data-state='closed'] {
    animation: slideUpCollapsible 300ms cubic-bezier(0.87, 0, 0.13, 1);
  }
  
  @keyframes slideDownCollapsible {
    from { 
      height: 0; 
      opacity: 0;
    }
    to { 
      height: var(--radix-collapsible-content-height); 
      opacity: 1;
    }
  }
  
  @keyframes slideUpCollapsible {
    from { 
      height: var(--radix-collapsible-content-height); 
      opacity: 1;
    }
    to { 
      height: 0; 
      opacity: 0;
    }
  }
  </style>
  