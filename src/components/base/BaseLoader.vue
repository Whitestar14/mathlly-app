<template>
    <div v-if="isActive" :class="containerClasses" class="relative h-full font-mono">
      <!-- Macro Loader -->
      <template v-if="variant === 'macro'">
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
            <div class=" text-sm text-gray-600 dark:text-gray-300">
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
              'font-medium animate-spin-mini',
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
const bracketLeft = ref(null);
const bracketRight = ref(null);
const letterM = ref(null);
const letterA = ref(null);
const letterT = ref(null);
const letterH = ref(null);
const letterY = ref(null);


// Animation timeline
let timeline;

function initializeAnimation() {
  if (!slashTop.value || !slashBottom.value) return;

  // Continuous animations
  const secondPhase = anime({
      targets: [bracketLeft.value, bracketRight.value],
      opacity: [0.5, 1],
      duration: 1000,
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutSine',
    });
  
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
    targets: [letterM.value, letterA.value, letterT.value, letterH.value, letterY.value],
    opacity: [0, 1],
    translateY: [10, 0],
    delay: anime.stagger(100),
    duration: 400,
  }, '-=200')

  // Brackets animation
  .add({
    targets: [bracketLeft.value, bracketRight.value],
    opacity: [0, 1],
    translateX: (el, i) => [(i === 0 ? -20 : 20), 0],
    duration: 400,
    complete: secondPhase.play()
  }, '-=200')
}

onMounted(() => {
  if (props.variant === 'macro') {
    initializeAnimation();
  }
});
</script>

<style scoped>
/* Only keeping necessary custom animations */
.animate-spin-mini {
  @apply animate-spin-2000;
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