<template>
  <div :class="containerClasses">
    <!-- Inline SVG when svgContent is provided -->
    <div 
      v-if="svgContent" 
      class="inline-block"
      v-html="svgContent"
    ></div>
    
    <!-- Image/SVG from src when provided -->
    <img 
      v-else-if="src" 
      :src="src" 
      :alt="alt" 
      :class="imageClasses"
    />
    
    <!-- Default text-based logo -->
    <kbd
      v-else
      :class="[
        'font-medium monospace pointer-events-none',
        'bg-gray-100 dark:bg-gray-800',
        'text-gray-800 dark:text-gray-200',
        'border border-gray-200 dark:border-gray-700 rounded-md shadow-sm',
        sizeClasses[size],
      ]"
    >
      {math<span
        class="text-indigo-400 font-black dark:text-indigo-600 inline-block mx-0.5"
        >//</span
      >y}
    </kbd>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
  src: {
    type: String,
    default: "",
  },
  svgPath: {
    type: String,
    default: "",
  },
  alt: {
    type: String,
    default: "Mathlly Logo",
  },
  themeSensitive: {
    type: Boolean,
    default: false
  }
});

const svgContent = ref('');

// Size classes for the text logo
const sizeClasses = {
  sm: "text-xl px-2 py-1",
  md: "text-2xl px-2.5 py-1.5",
  lg: "text-4xl px-5 py-3",
};

// Container classes
const containerClasses = computed(() => [
  'inline-flex items-center justify-center'
]);

// Image classes
const imageClasses = computed(() => [
  'max-w-full max-h-full object-contain',
  {
    'h-6': props.size === 'sm',
    'h-8': props.size === 'md',
    'h-14': props.size === 'lg'
  }
]);

// Load SVG content if svgPath is provided
const loadSvgContent = async () => {
  if (!props.svgPath) return;
  
  try {
    const response = await fetch(props.svgPath);
    if (!response.ok) throw new Error('Failed to load SVG');
    
    let svg = await response.text();
    
    // Add theme-sensitive classes if needed
    if (props.themeSensitive) {
      // Add dark mode classes to SVG paths and elements
      svg = svg.replace(/<path/g, '<path class="dark:stroke-gray-200 dark:fill-gray-200"');
      svg = svg.replace(/<circle/g, '<circle class="dark:stroke-gray-200 dark:fill-gray-200"');
      svg = svg.replace(/<rect/g, '<rect class="dark:stroke-gray-200 dark:fill-gray-200"');
      
      // Add class to the SVG element itself
      svg = svg.replace(/<svg/, '<svg class="text-gray-800 dark:text-gray-200"');
    }
    
    // Add size classes to SVG
    svg = svg.replace(/<svg/, `<svg class="${getSvgSizeClass()}"`);
    
    svgContent.value = svg;
  } catch (error) {
    console.error('Error loading SVG:', error);
  }
};

// Get appropriate size class for SVG
const getSvgSizeClass = () => {
  switch (props.size) {
    case 'sm': return 'h-6 w-auto';
    case 'lg': return 'h-14 w-auto';
    default: return 'h-8 w-auto';
  }
};

// Watch for changes in svgPath or themeSensitive
watch([() => props.svgPath, () => props.themeSensitive], loadSvgContent);

// Load SVG on mount
onMounted(loadSvgContent);
</script>

<style scoped>
/* Add any additional styling here */
:deep(svg) {
  display: inline-block;
}

:deep(svg path),
:deep(svg rect),
:deep(svg circle) {
  transition: fill 0.2s, stroke 0.2s;
}
</style>
