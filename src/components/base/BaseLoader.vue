<template>
  <Transition
    enter-active-class="duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="isActive" :class="containerClasses" class="relative h-full">
      <!-- Macro Loader -->
      <template v-if="variant === 'macro'">
        <div class="relative flex flex-col items-center justify-center gap-8">
          <div class="relative z-10 flex items-center justify-center">
            <div class="relative text-5xl font-mono">
              <span ref="bracketLeft" class="text-indigo-500 dark:text-indigo-400 font-medium opacity-0">{</span>
              <span class="inline-flex">
                <span ref="letterM" class="text-gray-800 dark:text-gray-100 opacity-0">m</span>
                <span ref="letterA" class="text-gray-800 dark:text-gray-100 opacity-0">a</span>
                <span ref="letterT" class="text-gray-800 dark:text-gray-100 opacity-0">t</span>
                <span ref="letterH" class="text-gray-800 dark:text-gray-100 opacity-0">h</span>
              </span>
              <span class="relative inline-flex items-center justify-center w-[1.2em]">
                <span ref="slashTop" class="top-0 left-1/2 -translate-x-1/2 text-indigo-500 dark:text-indigo-400 font-black opacity-0 origin-bottom">/</span>
                <span ref="slashBottom" class="bottom-0 left-1/2 -translate-x-1/2 text-indigo-500 dark:text-indigo-400 font-black opacity-0 origin-top">/</span>
              </span>
              <span ref="textY" class="text-gray-800 dark:text-gray-100 opacity-0">y</span>
              <span ref="bracketRight" class="text-indigo-500 dark:text-indigo-400 font-medium opacity-0">}</span>
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
        <div class="relative flex items-center justify-center">
          <div
            :class="[
              'font-mono font-medium animate-spin-mini',
              variant === 'micro' ? 'text-sm' : 'text-base'
            ]"
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
const bracketLeft = ref(null);
const bracketRight = ref(null);
const letterM = ref(null);
const letterA = ref(null);
const letterT = ref(null);
const letterH = ref(null);

// Animation timeline
let timeline;

function initializeAnimation() {
  if (!slashTop.value || !slashBottom.value) return;
  
  timeline = anime.timeline({
    easing: 'easeOutExpo',
  });

  // Slashes animation with better timing
  timeline.add({
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
    targets: [letterM.value, letterA.value, letterT.value, letterH.value],
    opacity: [0, 1],
    translateY: [10, 0],
    delay: anime.stagger(100),
    duration: 300,
  }, '-=200')
  
  // Y text fade in
  .add({
    targets: textY.value,
    opacity: [0, 1],
    translateY: [10, 0],
    duration: 300,
  }, '-=100')

  // Brackets animation
  .add({
    targets: [bracketLeft.value, bracketRight.value],
    opacity: [0, 1],
    translateX: (el, i) => [(i === 0 ? -20 : 20), 0],
    duration: 400,
  }, '-=200')

  // Continuous animations
  .add({
    targets: [bracketLeft.value, bracketRight.value],
    opacity: [0.4, 1],
    duration: 1000,
    loop: true,
    direction: 'alternate',
    easing: 'easeInOutSine',
  });
}

onMounted(() => {
  if (props.variant === 'macro') {
    initializeAnimation();
  }
});
</script>

<style scoped>
/* Only keeping necessary custom animations */
@keyframes spin-mini {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin-mini {
  animation: spin-mini 1.5s linear infinite;
}

.loader-macro {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md;
}

.loader-mini {
  @apply flex justify-center items-center min-w-10 min-h-10;
}

.loader-micro {
  @apply flex justify-center items-center min-w-6 min-h-6;
}
</style>