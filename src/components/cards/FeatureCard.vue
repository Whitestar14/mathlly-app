<template>
  <div class="relative bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-colors duration-300">
    <div class="flex items-center gap-2 mb-4">
      <div class="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
        <component
          :is="getFeatureIcon(icon)"
          class="h-6 w-6 text-indigo-600 dark:text-indigo-400"
        />
      </div>
      <h4
        class="font-medium text-lg"
      >
        {{ title }}
      </h4>
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
  CloudIcon,
  HeartIcon,
  ShieldCheckIcon,
  SparklesIcon
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
    'FunctionSquare': FunctionSquareIcon,
    'Heart': HeartIcon,
    'ShieldCheck': ShieldCheckIcon,
    'Sparkles': SparklesIcon
  };
  
  return iconMap[iconName] || CalculatorIcon;
};
</script>

