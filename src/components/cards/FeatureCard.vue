<template>
  <div class="group relative bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6 shadow-sm hover:shadow-md transition-all">
    <div class="flex items-center gap-2 mb-4">
    <div class="p-2 rounded-lg bg-gray-100 dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 opacity-75 group-hover:opacity-100 transition-opacity">
     <component
       :is="getFeatureIcon(icon)"
       class="h-5 w-5"
     />
   </div>
    <h3
      class="text-lg font-mono font-medium tracking-tight"
    >
      {{ title }}
    </h3>
  </div>
    <p class="text-gray-600 dark:text-gray-300">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
import {  
  BinaryIcon, 
  FunctionSquareIcon, 
  CalculatorIcon,
  EyeIcon,
  HistoryIcon,
  PaletteIcon,
  CodeIcon,
  CloudIcon
} from "lucide-vue-next";

defineProps({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

// Map feature icon names to actual components
const getFeatureIcon = (iconName) => {
  const iconMap = {
    'Calculator': CalculatorIcon,
    'Eye': EyeIcon,
    'History': HistoryIcon,
    'Palette': PaletteIcon,
    'Code': CodeIcon,
    'Cloud': CloudIcon,
    'Binary': BinaryIcon,
    'FunctionSquare': FunctionSquareIcon
  };
  
  return iconMap[iconName] || CalculatorIcon;
};
</script>

