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
        ref="currentInput" 
        :class="[
          'main-display text-right font-bold mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide transition-all',
          getFontSizeClass(input),
          error ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-white transition-colors'
        ]"
        aria-live="polite"
        aria-atomic="true"
        @scroll="handleScroll"
        v-html="formattedInput"
      />
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
  import { DisplayFormatter } from '@/services/calculator/DisplayFormatter';
  import { useElementSize, useScroll } from '@vueuse/core';
  
  const props = defineProps({
    input: { type: String, default: "" },
    preview: { type: String, default: "" },
    error: { type: String, default: "" },
    isAnimating: { type: Boolean, default: false },
    animatedResult: { type: String, default: "" },
    activeBase: { type: String, default: "DEC" },
    mode: { type: String, default: "Standard" },
    settings: { type: Object, required: true }, // Add settings as a prop
  });
  
  const emit = defineEmits(['scroll-update']);
  const currentInput = ref(null);
  const { width: containerWidth } = useElementSize(currentInput);
  const { x: scrollLeft, arrivedState } = useScroll(currentInput, {
    throttle: 0,
    onScroll: checkScroll
  });

  const formattedInput = computed(() => {
    if (!props.input) return "0";
    return DisplayFormatter.format(props.input, {
      base: props.activeBase,
      useThousandsSeparator: props.settings.useThousandsSeparator,
      mode: props.mode
    });
  });
  
  const formattedPreview = computed(() => {
    if (!props.preview) return "";
    return DisplayFormatter.format(props.preview, {
      base: props.activeBase,
      useThousandsSeparator: props.settings.useThousandsSeparator,
      mode: props.mode
    });
  });
  
  const getFontSizeClass = (value) => {
    if (!value) return 'text-3xl';
    
    const length = value.toString().length;
    const mode = props.mode;
  
    if (mode === 'Standard' || mode === 'Basic') {
      if (length > 70) return 'text-xl';
      if (length > 50) return 'text-2xl';
      return 'text-3xl';
    }
    return props.activeBase === 'BIN' ? 'text-2xl' : 'text-3xl';
  };

  function checkScroll() {
    const el = currentInput.value;
    if (!el) return;
  
    const canScrollLeft = scrollLeft.value > 0;
    const canScrollRight = !arrivedState.right && 
      (el.scrollWidth - el.clientWidth - scrollLeft.value) > 2; // 2px margin to prevent false positives
  
    emit('scroll-update', { canScrollLeft, canScrollRight });
  }
  
  function scrollToEnd() {
    if (currentInput.value) {
      currentInput.value.scrollLeft = currentInput.value.scrollWidth;
    }
  }
  
  function scrollToPrevious() {
    if (currentInput.value) {
      const newScrollLeft = Math.max(0, scrollLeft.value - containerWidth.value / 2);
      currentInput.value.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  }
  
  function scrollToNext() {
    if (currentInput.value) {
      const newScrollLeft = Math.min(
        currentInput.value.scrollWidth - containerWidth.value,
        scrollLeft.value + containerWidth.value / 2
      );
      currentInput.value.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  }
  
  onMounted(() => {
    checkScroll();
  });
  
  defineExpose({
    scrollToEnd,
    scrollToPrevious,
    scrollToNext
  });
  </script>