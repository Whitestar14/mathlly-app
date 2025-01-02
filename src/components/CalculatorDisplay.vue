<template>
  <div
    class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 transition-all duration-300 relative h-32"
  >
    <!-- Left Chevron indicator -->
    <div
      v-if="showLeftChevron"
      class="absolute left-2 top-8 transform -translate-x-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 cursor-pointer transition-opacity duration-300"
      :class="{
        'opacity-0': !showLeftChevron,
        'opacity-100': showLeftChevron,
      }"
      @click="scrollToPrevious"
    >
      <ChevronLeft
        size="24"
        class="animate-pulse w-full"
      />
    </div>

    <!-- Right Chevron indicator -->
    <div
      v-if="showRightChevron"
      class="absolute right-2 top-8 transform translate-x-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 cursor-pointer transition-opacity duration-300"
      :class="{
        'opacity-0': !showRightChevron,
        'opacity-100': showRightChevron,
      }"
      @click="scrollToNext"
    >
      <ChevronRight
        size="24"
        class="animate-pulse"
      />
    </div>

    <!-- Copy button with persistent tooltip -->
    <div
      ref="copyButton"
      v-tippy="{ 
        content: tooltipContent,
        placement: 'top',
        trigger: 'manual',
        duration: 300
      }"
      class="absolute right-2 top-2 text-gray-500 dark:text-gray-300 cursor-pointer transition-opacity duration-300"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltipDelayed"
      @click="copyToClipboard"
    >
      <Copy size="20" />
    </div>
    <div class="h-20 relative overflow-hidden">
      <!-- Main display -->
      <div
        class="absolute w-full transition-all duration-500 ease-custom transform-gpu"
        :class="{
          '-translate-y-full opacity-0': isAnimating,
          'translate-y-0 opacity-100': !isAnimating,
        }"
      >
        <!-- Display the current input value -->
        <div
          ref="currentInput"
          class="main-display text-right text-3xl font-bold text-gray-900 dark:text-white mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="polite"
          aria-atomic="true"
          @scroll="checkScroll"
        >
          {{ formattedInput }}
        </div>

        <!-- Display the preview for incomplete expressions -->
        <div
          v-if="preview && !error"
          class="text-right text-xl text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ preview }}
        </div>

        <!-- Display the error message if an error exists -->
        <div
          v-if="error"
          class="text-right text-xl text-red-500 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="assertive"
          aria-atomic="true"
        >
          {{ error }}
        </div>
      </div>

      <!-- Animated result section -->
      <div
        class="absolute w-full transition-all duration-500 ease-custom transform-gpu"
        :class="{
          'translate-y-0 opacity-100': isAnimating,
          'translate-y-full opacity-0': !isAnimating,
        }"
      >
        <div
          class="text-right text-3xl font-bold text-gray-900 dark:text-white mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ animatedResult }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ChevronLeft,
  ChevronRight,
  Copy,
} from "lucide-vue-next";
import { computed, defineProps, nextTick, ref, watch } from "vue";

const props = defineProps({
  input: String,
  preview: String,
  error: String,
  isAnimating: Boolean,
  animatedResult: String,
  activeBase: String, 
  settings: Object,
});

const currentInput = ref(0);
const copyButton = ref(null);
const showLeftChevron = ref(false);
const showRightChevron = ref(false);
const tooltipContent = ref('Copy to Clipboard');
let hideTooltipTimeout = null;

const formattedInput = computed(() => {
  if (!props.input) return "";
  
  if (props.activeBase === 'BIN') {
    // Split on operators, format each part, then rejoin with operators
    const parts = props.input.split(/([+\-×÷])/);
    return parts.map(part => {
      if (['+', '-', '×', '÷'].includes(part)) return part;
      return formatBinary(part);
    }).join('');
  }
  
  const parts = props.input.split(".");
  if (props.activeBase === 'HEX' || props.activeBase === 'OCT') {
    return parts.join(".");
  }

  if (props.settings.useThousandsSeparator) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return parts.join(".");
});


const formatBinary = (binString) => {
  binString = binString.replace(/[^01]/g, '').replace(/^0+/, '');
  if (binString === '') return '0';
  const padding = 4 - (binString.length % 4);
  if (padding < 4) {
    binString = '0'.repeat(padding) + binString;
  }
  return binString.match(/.{1,4}/g).join(' ');
};

const copyContent = computed(() => {
  if (props.animatedResult) {
    return `${props.input} = ${props.animatedResult}`;
  }
  return props.input;
});

watch(
  () => props.input,
  () => {
    nextTick(() => {
      if (currentInput.value) {
        scrollToEnd();
        checkScroll();
      }
    });
  }
);

function showTooltip() {
  if (hideTooltipTimeout) {
    clearTimeout(hideTooltipTimeout);
  }
  copyButton.value?._tippy?.show();
}

function hideTooltip() {
  copyButton.value?._tippy?.hide();
}

function hideTooltipDelayed() {
  hideTooltipTimeout = setTimeout(() => {
    hideTooltip();
  }, 3300);
}

function copyToClipboard() {
  navigator.clipboard
    .writeText(copyContent.value)
    .then(() => {
      tooltipContent.value = 'Saved!';
      showTooltip();
      if (hideTooltipTimeout) {
        clearTimeout(hideTooltipTimeout);
      }
      setTimeout(() => {
        hideTooltip();
        tooltipContent.value = 'Copy to Clipboard';
      }, 1500);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      tooltipContent.value = 'Failed to copy';
      showTooltip();
      if (hideTooltipTimeout) {
        clearTimeout(hideTooltipTimeout);
      }
      setTimeout(() => {
        hideTooltip();
        tooltipContent.value = 'Copy to Clipboard';
      }, 1500);
    });
}

function checkScroll() {
  if (currentInput.value) {
    const { scrollLeft, scrollWidth, clientWidth } = currentInput.value;
    showLeftChevron.value = scrollLeft > 0;
    showRightChevron.value = scrollLeft + clientWidth < scrollWidth;
  }
}

function scrollToEnd() {
  if (currentInput.value) {
    currentInput.value.scrollLeft = currentInput.value.scrollWidth;
  }
}

function scrollToPrevious() {
  if (currentInput.value) {
    const currentScrollLeft = currentInput.value.scrollLeft;
    const clientWidth = currentInput.value.clientWidth;
    let newScrollLeft = Math.max(0, currentScrollLeft - clientWidth);
    currentInput.value.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  }
}

function scrollToNext() {
  if (currentInput.value) {
    const currentScrollLeft = currentInput.value.scrollLeft;
    const clientWidth = currentInput.value.clientWidth;
    const scrollWidth = currentInput.value.scrollWidth;
    let newScrollLeft = Math.min(
      scrollWidth - clientWidth,
      currentScrollLeft + clientWidth
    );
    currentInput.value.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  }
}
</script>

<style scoped>
.translate-y-full {
  transform: translate3d(0, 100%, 0);
}

.-translate-y-full {
  transform: translate3d(0, -100%, 0);
}

.translate-y-0 {
  transform: translate3d(0, 0, 0);
}

.ease-custom {
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
}

.transform-gpu {
  will-change: transform, opacity;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>