<template>
  <div v-if="isActive" :class="containerClasses" class="relative h-full font-mono">
    <!-- Expanded Loader (formerly macro) -->
    <template v-if="variant === 'expanded'">
      <div class="relative flex flex-col items-center justify-center gap-8">
        <div class="relative z-10 flex items-center justify-center">
          <div class="relative text-6xl inline-flex">
            <span ref="bracketLeft" class="text-indigo-500 dark:text-indigo-400 font-medium opacity-0">{</span>

            <span class="inline-flex *:text-gray-800 *:dark:text-gray-100 *:opacity-0">
              <span ref="letterM">m</span>
              <span ref="letterA">a</span>
              <span ref="letterT">t</span>
              <span ref="letterH">h</span>
            </span>
            <span class="relative inline-flex items-center justify-center w-[1.2em] *:left-1/2 *:-translate-x-1/2 *:text-indigo-500 *:dark:text-indigo-400 *:font-black *:opacity-0">
              <span ref="slashTop" class="top-0 origin-bottom">/</span>
              <span ref="slashBottom" class="bottom-0 origin-top">/</span>
            </span>
            <span ref="letterY" class="text-gray-800 dark:text-gray-100 opacity-0">y</span>

            <span ref="bracketRight" class="text-indigo-500 dark:text-indigo-400 font-medium opacity-0">}</span>
          </div>
        </div>

        <div v-if="message" class="relative z-10 text-center">
          <div class="text-sm text-gray-600 dark:text-gray-300">
            {{ message }}
          </div>
        </div>
      </div>
    </template>

    <!-- Regular and Compact Loaders with simplified structure -->
    <template v-else>
      <div class="flex items-center justify-center">
        <div 
          class="css-loader" 
          :style="{ 
            '--loader-size': variant === 'compact' ? '1.5rem' : '2rem' 
          }"
          aria-label="Loading"
        ></div>
        <span
          v-if="message"
          class="ml-3 text-sm text-gray-600 dark:text-gray-300"
          :class="{ 'ml-2': variant === 'compact' }"
        >
          {{ message }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useElementVisibility } from '@vueuse/core';

const props = defineProps({
  variant: {
    type: String,
    default: "regular",
    validator: (value) => ["compact", "regular", "expanded"].includes(value),
  },
  message: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
});

const containerClasses = computed(() => [
  `loader-${props.variant}`,
  {
    "flex items-center justify-center h-full": props.message && props.variant !== "expanded",
  },
]);

// Animation refs
const slashTop = ref(null);
const slashBottom = ref(null);
const bracketLeft = ref(null);
const bracketRight = ref(null);
const letterM = ref(null);
const letterA = ref(null);
const letterT = ref(null);
const letterH = ref(null);
const letterY = ref(null);

// Container ref for visibility detection
const containerRef = ref(null);
const isVisible = useElementVisibility(containerRef);

// Dynamically import anime.js only when needed
const anime = ref(null);

// Animation timeline
let firstTimeline;
let secondTimeline;

// Check for reduced motion preference
const prefersReducedMotion = ref(
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false
);

// Watch for changes in reduced motion preference
if (window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', (e) => {
    prefersReducedMotion.value = e.matches;
  });
}

function initializeAnimation() {
  if (!anime.value || !slashTop.value || !slashBottom.value) return;
  
  // Use simplified animations if reduced motion is preferred
  if (prefersReducedMotion.value) {
    // Simple fade-in for reduced motion
    anime.value({
      targets: [
        slashTop.value, slashBottom.value, 
        letterM.value, letterA.value, letterT.value, letterH.value, letterY.value,
        bracketLeft.value, bracketRight.value
      ],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutQuad'
    });
    return;
  }

  // Continuous animations
  secondTimeline = anime.value({
    targets: [bracketLeft.value, bracketRight.value],
    opacity: [0.5, 1],
    duration: 1000,
    loop: true,
    direction: 'alternate',
    easing: 'easeInOutSine',
    autoplay: false
  });
  
  firstTimeline = anime.value.timeline({
    easing: 'easeOutExpo',
    autoplay: false
  });

  // Slashes animation with better timing
  firstTimeline.add({
    targets: slashTop.value,
    translateY: ['-100%', '0%'],
    opacity: [0, 1],
    duration: 600,
  })
  .add({
    targets: slashBottom.value,
    translateY: ['100%', '0%'],
    opacity: [0, 1],
    duration: 600,
  }, '-=400')

  // Individual letters stagger animation
  .add({
    targets: [letterM.value, letterA.value, letterT.value, letterH.value, letterY.value],
    opacity: [0, 1],
    translateY: [10, 0],
    delay: anime.value.stagger(100),
    duration: 400,
  }, '-=200')

  // Brackets animation
  .add({
    targets: [bracketLeft.value, bracketRight.value],
    opacity: [0, 0.5],
    translateX: (el, i) => [(i === 0 ? -20 : 20), 0],
    duration: 400,
    complete: () => secondTimeline.play()
  }, '-=200');

  // Play the animation
  firstTimeline.play();
}

// Watch for visibility changes to optimize animation initialization
watch(isVisible, (visible) => {
  if (visible && props.variant === 'expanded' && anime.value) {
    initializeAnimation();
  }
});

onMounted(async () => {
  if (props.variant === 'expanded') {
    // Dynamically import anime.js only when expanded variant is used
    anime.value = (await import('animejs')).default;
    
    // Use requestAnimationFrame to ensure DOM is fully rendered
    if (isVisible.value) {
      requestAnimationFrame(() => {
        initializeAnimation();
      });
    }
  }
});

onBeforeUnmount(() => {
  // Clean up animations to prevent memory leaks
  if (firstTimeline) {
    firstTimeline.pause();
    firstTimeline = null;
  }
  if (secondTimeline) {
    secondTimeline.pause();
    secondTimeline = null;
  }
});
</script>

<style scoped>
.css-loader {
  /* Use CSS variables for dynamic sizing */
  width: var(--loader-size, 2rem);
  height: var(--loader-size, 2rem);
  border-radius: 50%;
  display: inline-block;
  position: relative;
  border: 2px solid;
  border-color: #9ca3af #9ca3af transparent transparent;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
  /* Hardware acceleration */
  will-change: transform;
  transform: translateZ(0);
}

.css-loader::after,
.css-loader::before {
  content: '';
  box-sizing: border-box;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  border: 2px solid;
  border-color: transparent transparent #6366f1 #6366f1;
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  border-radius: 50%;
  animation: rotationBack 0.5s linear infinite;
  transform-origin: center center;
  /* Hardware acceleration */
  will-change: transform;
  transform: translateZ(0);
}

.css-loader::before {
  width: calc(100% - 12px);
  height: calc(100% - 12px);
  border-color: #9ca3af #9ca3af transparent transparent;
  animation: rotation 1.5s linear infinite;
}

.dark .css-loader {
  border-color: #4b5563 #4b5563 transparent transparent;
}

.dark .css-loader::after {
  border-color: transparent transparent #818cf8 #818cf8;
}

.dark .css-loader::before {
  border-color: #4b5563 #4b5563 transparent transparent;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes rotationBack {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}
</style>
