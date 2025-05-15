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
              :is="getFeatureIcon(icon)" 
              class="h-5 w-5 text-indigo-600 dark:text-indigo-400" 
              :class="iconClass"
              aria-hidden="true"
            />
            <span class="text-base font-medium text-gray-900 dark:text-gray-100">{{ title }}</span>
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
  import { ref } from 'vue';
  import { 
    CollapsibleRoot, 
    CollapsibleTrigger, 
    CollapsibleContent 
  } from 'radix-vue';
  import { MonitorIcon, CalculatorIcon, PowerIcon, PaletteIcon, ChevronDownIcon } from 'lucide-vue-next';
  
  const props = defineProps({
    id: {
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
      default: true
    },
    customClass: String,
    headerClass: String,
    contentClass: String,
    iconClass: String,
  });
  
  const isOpen = ref(props.defaultOpen);

  const getFeatureIcon = (iconName) => {
  const iconMap = {
    'Calculator': CalculatorIcon,
    'Palette': PaletteIcon,
    'Monitor': MonitorIcon,
    'Power': PowerIcon
  };
  
  return iconMap[iconName] || CalculatorIcon;
};

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
  