<template>
  <div class="flex-grow h-full relative overflow-hidden">
    <div class="text-right text-xl font-bold font-mono text-gray-700 dark:text-gray-200">
      <!-- Result container -->
      <div
        ref="resultContainer"
        class="absolute w-full transform-gpu"
        :class="{ 'opacity-100': isAnimating, 'opacity-0': !isAnimating }"
      >
        <div :class="displayClass">
          {{ animatedResult }}
        </div>
      </div>

      <!-- Input container -->
      <div
        ref="inputContainer"
        class="absolute grid grid-rows-[1.5fr_1fr] w-full h-full transform-gpu"
        :class="{ 'opacity-0': isAnimating, 'opacity-100': !isAnimating }"
      >
        <!-- Display container -->
        <div
          ref="displayContainer"
          :class="displayClass"
          aria-live="polite"
          aria-atomic="true"
        >
          <span
            v-for="(part, index) in formattedParts"
            :key="index"
          >
            <template v-if="part.type === 'text'">
              <template v-if="settingsStore.display.syntaxHighlighting">
                <span
                  v-for="(token, tokenIndex) in highlightedTokens[index] || []"
                  :key="`${index}-${tokenIndex}`"
                  :class="`syntax-${token.type}`"
                >{{ token.content }}</span>
              </template>
              <template v-else>
                {{ part.content }}
              </template>
            </template>
            <span
              v-else-if="part.type === 'open'"
              class="paren-open syntax-parenthesis"
            >{{ part.content }}</span>
            <span
              v-else-if="part.type === 'close'"
              class="paren-close syntax-parenthesis"
            >{{ part.content }}</span>
            <span
              v-else-if="part.type === 'ghost'"
              class="paren-ghost syntax-ghost"
            >{{ part.content }}</span>
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
          {{ preview }}
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
import { ref, inject, computed, onMounted, watch } from "vue"
import { useElementSize, useScroll, useThrottleFn } from '@vueuse/core'
import { DisplayService } from '@/services/display/DisplayService'
import { useSettingsStore } from '@/stores/settings';

const props = defineProps({
  input: { type: String, default: "" },
  preview: { type: String, default: "" },
  error: { type: String, default: "" },
  isAnimating: { type: Boolean, default: false },
  animatedResult: { type: String, default: "" },
  activeBase: { type: String, default: "DEC" },
  mode: { type: String, default: "Standard" }
});

const settingsStore = useSettingsStore();
const emit = defineEmits(['scroll-update']);

const displayContainer = ref(null);
const resultContainer = ref(null);
const inputContainer = ref(null);
const previewContainer = ref(null);

const calculator = inject('calculator');
const parenthesesTracker = computed(() => calculator.value.operations.parenthesesTracker);

const { width } = useElementSize(displayContainer);
const { x: scrollLeft, arrivedState } = useScroll(displayContainer, {
  throttle: 16,
  onScroll: useThrottleFn(updateScrollState, 100)
});

const formattedParts = computed(() => 
  DisplayService.formatParts(props.input, props.activeBase, props.mode, parenthesesTracker.value)
);

const highlightedTokens = computed(() => {
  if (!settingsStore.display.syntaxHighlighting) return {};
  
  return formattedParts.value.reduce((acc, part, index) => {
    if (part.type === 'text') {
      acc[index] = DisplayService.highlightSyntax(part.content);
    }
    return acc;
  }, {});
});

const displayClass = computed(() => [
  'mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide',
  DisplayService.getFontSizeClass(props.input, props.mode, props.activeBase),
  props.error ? 'text-red-500 dark:text-red-400' : 'transition-colors'
]);

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
    const newScrollLeft = Math.max(0, scrollLeft.value - width.value / 2);
    displayContainer.value.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  }
}

function scrollToNext() {
  if (displayContainer.value) {
    const newScrollLeft = Math.min(
      displayContainer.value.scrollWidth - width.value,
      scrollLeft.value + width.value / 2
    );
    displayContainer.value.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  }
}

watch(() => props.isAnimating, (newValue) => {
  newValue 
    ? DisplayService.animateSlide(resultContainer.value, inputContainer.value)
    : DisplayService.resetPositions(resultContainer.value, inputContainer.value);
}, { flush: 'post' });

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

.paren-open,
.paren-close {
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

[data-nest-level="1"] {
  padding-left: 0.25rem;
}

[data-nest-level="2"] {
  padding-left: 0.5rem;
}

[data-nest-level="3"] {
  padding-left: 0.75rem;
}
</style>
