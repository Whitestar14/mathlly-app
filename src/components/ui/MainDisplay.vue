<template>
  <div class="flex-grow h-full max-h-32 relative overflow-hidden">
    <div class="text-right text-xl font-bold font-mono text-gray-700 dark:text-gray-200">
      <!-- Result container -->
      <div
        ref="resultContainer"
        class="absolute w-full transform-gpu"
        :class="{
          'opacity-100': isAnimating,
          'opacity-0': !isAnimating,
        }"
      >
        <div class="text-3xl mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {{ animatedResult }}
        </div>
      </div>

      <!-- Input container -->
      <div
        ref="inputContainer"
        class="absolute grid grid-rows-[1.5fr_1fr] w-full h-full transform-gpu"
        :class="{
          'opacity-0': isAnimating,
          'opacity-100': !isAnimating,
        }"
      >
      <!-- Display container -->
        <div
          ref="displayContainer" 
          :class="displayClass"
          aria-live="polite"
          aria-atomic="true"
        >
          <span v-for="(part, index) in formattedParts" :key="index">
            <span v-if="part.type === 'text'"
              v-text="DisplayFormatter.formatDisplayContent(part.content)" />
            <span v-else-if="part.type === 'open'" class="paren-open">{{ part.content }}</span>
            <span v-else-if="part.type === 'close'" class="paren-close">{{ part.content }}</span>
            <span v-else-if="part.type === 'ghost'" class="paren-ghost text-gray-400">{{ part.content }}</span>
          </span>
        </div>

        <!-- Preview/Error container -->
        <div
          v-if="preview && !error"
          ref="previewContainer"
          class="font-medium text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ formattedPreview }}
        </div>
        <div
          v-if="error"
          class="font-medium text-red-500 overflow-x-auto whitespace-nowrap scrollbar-hide"
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

const displayContainer = ref(null);
const resultContainer = ref(null);
const inputContainer = ref(null);
const previewContainer = ref(null);

const { parenthesesTracker } = useParenthesesTracking();
const { width: containerWidth } = useElementSize(displayContainer);
const { x: scrollLeft, arrivedState } = useScroll(displayContainer, {
  throttle: 16, 
  onScroll: useThrottleFn(updateScrollState, 100)
});

const formattedParts = computed(() => {
  const formatted = DisplayFormatter.format(props.input, { base: props.activeBase, mode: props.mode });
  
  return ParenthesesHighlighter.formatWithParentheses(formatted, parenthesesTracker.value);
});

const formattedPreview = computed(() => {
  if (!props.preview) return "";
  return DisplayFormatter.format(props.preview, {
    base: props.activeBase,
    mode: props.mode
  });
});

const displayClass = computed(() => [
  'mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide',
  fontSizeClass(props.input),
  props.error ? 'text-red-500 dark:text-red-400' : 'transition-colors'
])

const fontSizeClass = (value) => {
  if (!value) return 'text-3xl'; 
  
  const length = value.toString().length;
  const mode = props.mode;

  if (mode === 'Standard') {
    if (length > 70) return 'text-xl'; 
    if (length > 50) return 'text-2xl'; 
    return 'text-3xl'; 
  }
  return props.activeBase === 'BIN' ? 'text-2xl' : 'text-3xl';
};

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

watch(() => props.isAnimating, (newValue) => {
  newValue ? animateSlide() : resetPositions();
}, { immediate: true });

function animateSlide() {
  if (!resultContainer.value || !inputContainer.value) return;

  anime.set(resultContainer.value, {translateY: '100%'});

  anime.set(inputContainer.value, {translateY: '0'});

  const timeline = anime.timeline({
    easing: 'cubicBezier(0.25, 0.1, 0.25, 1)',
    duration: 300
  });

  timeline.add({
    targets: inputContainer.value,
    translateY: '-100%',
    opacity: [1, 0],
    easing: 'cubicBezier(0.4, 0.0, 0.2, 1)'
  });

  timeline.add({
    targets: resultContainer.value,
    translateY: '0',
    opacity: [0, 1],
    easing: 'cubicBezier(0.4, 0.0, 0.2, 1)'
  }, '-=250'); // Start slightly before the first animation ends
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

<style scoped>
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

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

[data-nest-level="1"] { padding-left: 0.25rem; }
[data-nest-level="2"] { padding-left: 0.5rem; }
[data-nest-level="3"] { padding-left: 0.75rem; }
</style>