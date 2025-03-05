<template>
  <div class="flex-grow h-full relative overflow-hidden">
    <div
      class="absolute w-full transition-all duration-500 ease-custom transform-gpu"
      :class="{
        '-translate-y-full opacity-0': isAnimating,
        'translate-y-0 opacity-100': !isAnimating,
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
            v-html="part.content"
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
      <div
        class="text-right text-3xl font-bold text-gray-900 dark:text-white mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ animatedResult }}
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from "vue";
import { DisplayFormatter } from '@/services/display/DisplayFormatter';
import { useElementSize, useScroll, useThrottleFn } from '@vueuse/core';
import { ParenthesesHighlighter } from '@/utils/display/ParenthesesHighlighter';
import { useParenthesesTracking } from '@/composables/useParenthesesTracking';

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
  'main-display text-right font-bold mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide transition-all',
  getFontSizeClass(props.input),
  props.error ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-200 transition-colors'
]);

const getFontSizeClass = (value) => {
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
.ease-custom {
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

</style>