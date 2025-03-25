<template>
  <div class="flex-grow h-full relative overflow-hidden !font-mono">
    <div class="absolute w-full h-full">
      <!-- Result container -->
      <div
        ref="resultContainer"
        class="absolute w-full transform-gpu"
        :class="{
          'opacity-100': isAnimating,
          'opacity-0': !isAnimating,
        }"
      >
        <div class="text-right text-3xl font-bold text-gray-900 dark:text-white mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {{ animatedResult }}
        </div>
      </div>

      <!-- Input container -->
      <div
        ref="inputContainer"
        class="absolute w-full transform-gpu"
        :class="{
          'opacity-0': isAnimating,
          'opacity-100': !isAnimating,
        }"
      >
        <div
          ref="displayContainer" 
          :class="displayClasses"
          aria-live="polite"
          aria-atomic="true"
        >
          <span
            v-for="(part, index) in formattedParts"
            :key="index"
          >
            <span
              v-if="part.type === 'text'"
              v-text="DisplayFormatter.formatDisplayContent(part.content)"
            />
            <span
              v-else-if="part.type === 'open'"
              class="paren-open"
            >{{ part.content }}</span>
            <span
              v-else-if="part.type === 'close'"
              class="paren-close"
            >{{ part.content }}</span>
            <span
              v-else-if="part.type === 'ghost'"
              class="paren-ghost text-gray-400"
            >{{ part.content }}</span>
          </span>
        </div>
        <div
          v-if="preview && !error"
          ref="previewContainer"
          class="text-right text-xl text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ formattedPreview }}
        </div>
        <div
          v-if="error"
          class="text-right text-xl text-red-500 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="assertive"
          aria-atomic="true"
        >
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

  
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { DisplayFormatter } from '@/services/display/DisplayFormatter';
import { useElementSize, useScroll, useThrottleFn } from '@vueuse/core';
import { ParenthesesHighlighter } from '@/utils/display/ParenthesesHighlighter';
import { useParenthesesTracking } from '@/composables/useParenthesesTracking';
import anime from 'animejs/lib/anime.es.js';

const props = defineProps({
  input: { type: String, default: "" },
  preview: { type: String, default: "" },
  error: { type: String, default: "" },
  isAnimating: { type: Boolean, default: false },
  animatedResult: { type: String, default: "" },
  activeBase: { type: String, default: "DEC" },
  mode: { type: String, default: "Standard" }
});

const emit = defineEmits(['scroll-update']);

const { parenthesesTracker } = useParenthesesTracking();

const displayContainer = ref(null);
const { width: containerWidth } = useElementSize(displayContainer);
const { x: scrollLeft, arrivedState } = useScroll(displayContainer, {
  throttle: 16, 
  onScroll: useThrottleFn(updateScrollState, 100)
});

const formattedPreview = computed(() => {
  if (!props.preview) return "";
  return DisplayFormatter.format(props.preview, {
    base: props.activeBase,
    mode: props.mode
  });
});

const displayClasses = computed(() => [
  'main-display text-right font-bold mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide transition-all font-size-transition',
  getFontSizeClass(props.input),
  props.error ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-200 transition-colors'
])

const getFontSizeClass = (value) => {
  if (!value) return 'text-size-large'; // Replace 'text-3xl'
  
  const length = value.toString().length;
  const mode = props.mode;

  if (mode === 'Standard') {
    if (length > 70) return 'text-size-small'; // Replace 'text-xl'
    if (length > 50) return 'text-size-medium'; // Replace 'text-2xl'
    return 'text-size-large'; // Replace 'text-3xl'
  }
  return props.activeBase === 'BIN' ? 'text-size-medium' : 'text-size-large';
};

const formattedParts = computed(() => {
  const formatted = DisplayFormatter.format(props.input, {
    base: props.activeBase,
    mode: props.mode
  });
  
  return ParenthesesHighlighter.formatWithParentheses(
    formatted, 
    parenthesesTracker.value 
  );
});

function updateScrollState() {
  if (!displayContainer.value) return;

  const canScrollLeft = scrollLeft.value > 0;
  const canScrollRight = !arrivedState.right && 
    (displayContainer.value.scrollWidth - displayContainer.value.clientWidth - scrollLeft.value) > 2;

  emit('scroll-update', { canScrollLeft, canScrollRight });
}

function scrollToEnd() {
  if (displayContainer.value) {
    displayContainer.value.scrollLeft = displayContainer.value.scrollWidth;
  }
}

function scrollToPrevious() {
  if (displayContainer.value) {
    const newScrollLeft = Math.max(0, scrollLeft.value - containerWidth.value / 2);
    displayContainer.value.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  }
}

function scrollToNext() {
  if (displayContainer.value) {
    const newScrollLeft = Math.min(
      displayContainer.value.scrollWidth - containerWidth.value,
      scrollLeft.value + containerWidth.value / 2
    );
    displayContainer.value.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  }
}

const resultContainer = ref(null);
const inputContainer = ref(null);
const previewContainer = ref(null);

// Watch for animation state changes
watch(() => props.isAnimating, (newValue) => {
  if (newValue) {
    // Start animation when isAnimating becomes true
    animateCalculation();
  } else {
    // Reset positions when animation ends
    resetPositions();
  }
}, { immediate: true });

function animateCalculation() {
  if (!resultContainer.value || !inputContainer.value) return;
  
  // Hide preview immediately during animation
  if (previewContainer.value) {
    anime.set(previewContainer.value, {
      opacity: 0
    });
  }
  
  // Reset positions first
  anime.set(resultContainer.value, {
    translateY: '100%'
  });
  
  anime.set(inputContainer.value, {
    translateY: '0'
  });
  
  // Create animation timeline
  const timeline = anime.timeline({
    easing: 'cubicBezier(0.25, 0.1, 0.25, 1)',
    duration: 450
  });
  
  // Animate input sliding up and out
  timeline.add({
    targets: inputContainer.value,
    translateY: '-100%',
    opacity: [1, 0],
    easing: 'cubicBezier(0.4, 0.0, 0.2, 1)'
  });
  
  // Animate result sliding up and in
  timeline.add({
    targets: resultContainer.value,
    translateY: '0',
    opacity: [0, 1],
    easing: 'cubicBezier(0.4, 0.0, 0.2, 1)'
  }, '-=350'); // Start slightly before the first animation ends
}

function resetPositions() {
  if (!resultContainer.value || !inputContainer.value) return;
  
  anime.set(resultContainer.value, {
    translateY: '100%',
    opacity: 0
  });
  
  anime.set(inputContainer.value, {
    translateY: '0',
    opacity: 1
  });
  
  // Fade in the preview with a smooth animation
  if (previewContainer.value && props.preview && !props.error) {
    anime({
      targets: previewContainer.value,
      opacity: [0, 1],
      duration: 300,
      easing: 'cubicBezier(0.4, 0.0, 0.2, 1)',
      delay: 100 // Small delay to let the input container settle first
    });
  }
}

onMounted(() => {
  updateScrollState();
});

defineExpose({
  scrollToEnd,
  scrollToPrevious,
  scrollToNext
});
</script>

<style>
.paren-ghost {
  opacity: 0.4;
  color: var(--ghost-paren-color, #6b7280);
  margin-left: 0.125rem;
}

.paren-open, .paren-close {
  position: relative;
  margin: 0 0.125rem;
}

.paren-open {
  margin-right: 0.25rem;
}

[data-nest-level="1"] { padding-left: 0.25rem; }
[data-nest-level="2"] { padding-left: 0.5rem; }
[data-nest-level="3"] { padding-left: 0.75rem; }

.-translate-y-full {
  transform: translate3d(0, -100%, 0);
}

.translate-y-0 {
  transform: translate3d(0, 0, 0);
}

.translate-y-full {
  transform: translate3d(0, 100%, 0);
}

.font-size-transition {
  transition: font-size 0.3s ease;
}

.text-size-small {
  font-size: 1.25rem; /* Equivalent to text-xl */
}

.text-size-medium {
  font-size: 1.5rem; /* Equivalent to text-2xl */
}

.text-size-large {
  font-size: 1.875rem; /* Equivalent to text-3xl */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.translate-y-result {
  transform: translate3d(0, 100%, 0);
}

.translate-y-input {
  transform: translate3d(0, -50%, 0);
}
</style>