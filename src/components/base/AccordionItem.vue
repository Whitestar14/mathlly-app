<template>
  <RadixAccordionItem
    :value="id"
    :disabled="disabled"
    class="overflow-hidden"
    :class="[customClass]"
  >
    <RadixAccordionHeader class="flex w-full">
      <RadixAccordionTrigger
        class="group flex flex-1 items-center justify-between p-4 text-left font-medium text-gray-700/30 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 transition-colors w-full"
        :class="headerClass"
      >
        <div class="flex items-center space-x-3">
          <component 
            :is="resolvedIcon" 
            v-if="icon" 
            class="h-5 w-5 text-indigo-600 dark:text-indigo-400" 
            :class="iconClass"
            aria-hidden="true"
          />
          <slot name="header">
            <span class="text-base font-medium text-gray-900 dark:text-gray-100">{{ title }}</span>
          </slot>
        </div>
        <slot name="indicator">
          <ChevronDownIcon 
            class="h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] indicator-icon"
            aria-hidden="true"
          />
        </slot>
      </RadixAccordionTrigger>
    </RadixAccordionHeader>
      
    <RadixAccordionContent 
      class="overflow-hidden border-t border-gray-200 dark:border-gray-700 text-sm radix-accordion-content" 
    >
      <div
        class="p-4 pt-2 text-gray-700 dark:text-gray-300"
        :class="contentClass"
      >
        <slot />
      </div>
    </RadixAccordionContent>
  </RadixAccordionItem>
</template>
  
  <script setup>
  import { computed } from 'vue'
  import { 
    AccordionItem as RadixAccordionItem, // Renamed for clarity
    AccordionHeader as RadixAccordionHeader, 
    AccordionTrigger as RadixAccordionTrigger, 
    AccordionContent as RadixAccordionContent 
  } from 'radix-vue';
  import { ChevronDownIcon } from 'lucide-vue-next';
  import * as LucideIcons from 'lucide-vue-next'; // For dynamic icon loading
  
  const props = defineProps({
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    icon: { // Name of the Lucide icon (e.g., "SettingsIcon")
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    customClass: { // For the root AccordionItem element
      type: String,
      default: ''
    },
    headerClass: { // For the AccordionTrigger element
      type: String,
      default: ''
    },
    contentClass: { // For the div inside AccordionContent
      type: String,
      default: ''
    },
    iconClass: { // For the icon component
      type: String,
      default: ''
    }
  })
  
  const resolvedIcon = computed(() => {
    if (!props.icon) return null;
    // Ensure the icon name matches a valid export from lucide-vue-next
    return LucideIcons[props.icon] || LucideIcons.SettingsIcon; // Fallback icon
  })
  </script>
  
  <style scoped>
  /* Chevron rotation */
  [data-state='open'] .indicator-icon {
    transform: rotate(180deg);
  }
  
  /* Accordion open/close animations */
  [data-state='open'] {
    animation: slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1);
  }
  
  [data-state='closed'] {
    animation: slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1);
  }
  
  @keyframes slideDown {
    from { 
      height: 0; 
    }
    to { 
      height: var(--radix-collapsible-content-height); 
    }
  }
  
  @keyframes slideUp {
    from { 
      height: var(--radix-collapsible-content-height); 
    }
    to { 
      height: 0; 
    }
  }
  </style>
  