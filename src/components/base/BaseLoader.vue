<template>
  <Transition
    enter-active-class="duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isActive"
      :class="containerClasses"
      class="loader"
    >
      <!-- Macro Loader -->
      <template v-if="variant === 'macro'">
        <div class="relative flex flex-col items-center justify-center gap-8">
          <div class="relative z-10 logo-container">
            <div class="logo text-5xl font-mono">
              <span class="text-gray-800 dark:text-gray-100">math</span>
              <div class="inline-block relative">
                <span ref="slashTop" class="absolute slash-top">/</span>
                <span ref="slashBottom" class="absolute slash-bottom">/</span>
              </div>
              <span ref="textY" class="text-gray-800 dark:text-gray-100 opacity-0">y</span>
            </div>
          </div>

          <div v-if="message" class="relative z-10 text-center">
            <div class="font-mono text-sm text-gray-600 dark:text-gray-300">
              {{ message }}
            </div>
          </div>
        </div>
      </template>

      <!-- Mini/Micro Loader -->
      <template v-else>
        <div class="mini-loader-container">
          <div
            class="mini-loader-symbol"
            :class="[variant === 'micro' ? 'text-sm' : 'text-base']"
          >
            {<span class="text-indigo-500 dark:text-indigo-400 font-bold">//</span>}
          </div>
        </div>
        <span
          v-if="message"
          class="ml-2 text-sm text-gray-600 dark:text-gray-300"
        >
          {{ message }}
        </span>
      </template>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import anime from 'animejs';

const props = defineProps({
  variant: {
    type: String,
    default: "mini",
    validator: (value) => ["macro", "mini", "micro"].includes(value),
  },
  message: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const containerClasses = computed(() => [
  `loader-${props.variant}`,
  {
    "flex items-center justify-center": props.message && props.variant !== "macro",
  },
]);

// Animation refs
const slashTop = ref(null);
const slashBottom = ref(null);
const textY = ref(null);

// Animation timeline
let timeline;

function initializeAnimation() {
  if (!slashTop.value || !slashBottom.value || !textY.value) return;
  
  timeline = anime.timeline({
    easing: 'easeOutExpo',
  });

  // Phase 1: Slashes coming together
  timeline.add({
    targets: slashTop.value,
    translateY: ['-100%', '0%'],
    opacity: [0, 1],
    duration: 800,
  })
  .add({
    targets: slashBottom.value,
    translateY: ['100%', '0%'],
    opacity: [0, 1],
    duration: 800,
  }, '-=800')

  // Phase 2: Pulsating and text reveal
  .add({
    targets: [slashTop.value, slashBottom.value],
    opacity: [0.4, 1],
    duration: 600,
    loop: true,
    direction: 'alternate',
    easing: 'easeInOutSine',
  })
  .add({
    targets: textY.value,
    opacity: [0, 1],
    duration: 400,
    easing: 'easeInOutQuad',
  }, '-=600');
}

onMounted(() => {
  if (props.variant === 'macro') {
    initializeAnimation();
  }
});
</script>

<style scoped>
.loader-mini {
  @apply flex justify-center items-center min-w-10 min-h-10;
}

.loader-micro {
  @apply flex justify-center items-center min-w-6 min-h-6;
}

.loader {
  @apply relative h-full;
}

.loader-macro {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  @apply bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md;
}

/* New Macro Loader Styles */
.logo-container {
  @apply flex items-center justify-center;
}

.logo {
  @apply relative;
}

.slash-top, .slash-bottom {
  @apply text-indigo-500 dark:text-indigo-400 font-black;
}

/* Remove previous animation styles that are no longer needed */
.math-symbols-orbit,
.symbol,
.formulas-background,
.logo-glow,
.typing-effect,
.progress-bar,
.progress-fill {
  display: none;
}

/* Mini loader */
.mini-loader-container {
  @apply relative flex items-center justify-center;
}

.mini-loader-symbol {
  @apply font-mono font-medium;
  animation: spin-mini 1.5s linear infinite;
}

/* Animations */
@keyframes spin-mini {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(90deg);
  }
  50% {
    transform: rotate(180deg);
  }
  75% {
    transform: rotate(270deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-pulse-fast {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>