<template>
  <div :class="'inline-flex items-center justify-center'">
    <!-- Inline SVG when svgContent is provided -->
    <div 
      v-if="type === 'svg' && path?.light" 
      class="inline-block"
      v-html="svgContent"
    ></div>
    
    <!-- Image/SVG from src when provided -->
    <img 
      v-if="type === 'img' && (path?.light || path?.dark)" 
      :src="isDark ? path.light : path.dark" 
      :alt="alt" 
      :class="imageClasses"
    />
    
    <!-- Default text-based logo -->
    <kbd
      v-show="type === 'text'"
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
  type: {
    type: String,
    default: "text",
    validator: (value) => ["text", "img", "svg"].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
  path: {
    type: Object,
    default: () => ({})
  },
  alt: {
    type: String,
    default: "Mathlly Logo",
  },
});

const svgContent = ref('');
const svgCache = new Map();

const lightSvgContent = ref('');
const darkSvgContent = ref('');
// Size classes for the text logo
const sizeClasses = {
  sm: "text-xl px-2 py-1",
  md: "text-2xl px-2.5 py-1.5",
  lg: "text-4xl px-5 py-3",
};

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
const loadSvgContent = async (path) => {
  if (!path) return;
  
  if(svgCache.has(path)) return svgCache.get(path);

  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('Failed to load SVG');
    
    let svg = await response.text();
    
    // Add size classes to SVG
    svg = svg.replace(/<svg/, `<svg class="${getSvgSizeClass()}"`);
    
    svgCache.set(path, svg);
    return svg;
  } catch (error) {
    console.error('Error loading SVG:', error);
  }
};

const initSvgContent = async () => {
  const light = props.path.light;
  const dark = props.path.dark;

  if (light) lightSvgContent.value = await loadSvgContent(light);

  if (dark && dark !== light) darkSvgContent.value - await loadSvgContent(dark);

  else if (dark) darkSvgContent.value = lightSvgContent.value;
}

// Get appropriate size class for SVG
const getSvgSizeClass = () => {
  switch (props.size) {
    case 'sm': return 'h-6 w-auto';
    case 'lg': return 'h-14 w-auto';
    default: return 'h-8 w-auto';
  }
};

// Watch for changes in SVG paths
watch([() => props.path.light, () => props.path.dark], initSvgContent);

// Load SVG on mount
onMounted(() => {
  if(props.path.light || props.path.dark) {
  initSvgContent()
  }});
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
