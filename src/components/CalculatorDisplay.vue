<template>
  <div
    class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 transition-all duration-300 relative h-32"
  >
    <!-- Left Chevron indicator -->
    <div
      v-if="showLeftChevron"
      @click="scrollToPrevious"
      class="absolute left-2 top-8 transform -translate-x-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 cursor-pointer transition-opacity duration-300"
      :class="{ 'opacity-0': !showLeftChevron, 'opacity-100': showLeftChevron }"
    >
      <ChevronLeft size="24" class="animate-pulse" />
    </div>

    <!-- Right Chevron indicator -->
    <div
      v-if="showRightChevron"
      @click="scrollToNext"
      class="absolute right-2 top-8 transform translate-x-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 cursor-pointer transition-opacity duration-300"
      :class="{
        'opacity-0': !showRightChevron,
        'opacity-100': showRightChevron,
      }"
    >
      <ChevronRight size="24" class="animate-pulse" />
    </div>

    <!-- Copy button -->
    <div
      v-tippy="{ content: 'Copy to clipboard', placement: 'top' }"
      @click="copyToClipboard"
      class="absolute right-2 top-2 text-gray-500 dark:text-gray-300 cursor-pointer transition-opacity duration-300"
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
          ref="inputDisplay"
          class="text-right text-3xl font-bold text-gray-900 dark:text-white mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="polite"
          aria-atomic="true"
          @scroll="checkScroll"
        >
          {{ formattedInput }}
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

      <!-- Animated result section (becomes the main display when animating) -->
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

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="showToast" :class="['toast', toastType === 'success' ? 'bg-green-500' : 'bg-red-500']">
        <div class="flex items-center">
          <CheckCircle v-if="toastType === 'success'" class="mr-2" size="20" />
          <XCircle v-else class="mr-2" size="20" />
          <span>{{ toastMessage }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { defineProps, computed, nextTick, ref, watch } from "vue";
import { ChevronLeft, ChevronRight, Copy, CheckCircle, XCircle } from "lucide-vue-next";

// Define the props passed to this component
const props = defineProps({
  input: String,
  error: String,
  isAnimating: Boolean,
  animatedResult: String,
});

const inputDisplay = ref(null);
const showLeftChevron = ref(false);
const showRightChevron = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref('success');

const formattedInput = computed(() => {
  if (!props.input) return '';
  const parts = props.input.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join('.');
});

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
      if (inputDisplay.value) {
        scrollToEnd();
        checkScroll();
      }
    });
  }
);

function checkScroll() {
  if (inputDisplay.value) {
    const { scrollLeft, scrollWidth, clientWidth } = inputDisplay.value;
    showLeftChevron.value = scrollLeft > 0;
    showRightChevron.value = scrollLeft + clientWidth < scrollWidth;
  }
}

function scrollToEnd() {
  if (inputDisplay.value) {
    inputDisplay.value.scrollLeft = inputDisplay.value.scrollWidth;
  }
}

function scrollToPrevious() {
  if (inputDisplay.value) {
    const currentScrollLeft = inputDisplay.value.scrollLeft;
    const clientWidth = inputDisplay.value.clientWidth;
    let newScrollLeft = Math.max(0, currentScrollLeft - clientWidth);
    inputDisplay.value.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  }
}

function scrollToNext() {
  if (inputDisplay.value) {
    const currentScrollLeft = inputDisplay.value.scrollLeft;
    const clientWidth = inputDisplay.value.clientWidth;
    const scrollWidth = inputDisplay.value.scrollWidth;
    let newScrollLeft = Math.min(
      scrollWidth - clientWidth,
      currentScrollLeft + clientWidth
    );
    inputDisplay.value.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  }
}

function copyToClipboard() {
  navigator.clipboard
    .writeText(copyContent.value)
    .then(() => {
      showToastNotification('Saved to Clipboard!', 'success');
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      showToastNotification('Error Saving to Clipboard', 'error');
    });
}

function showToastNotification(message, type) {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
}
</script>

<style scoped>
/* Existing styles */
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
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* New styles for toast notification */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  z-index: 1000;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>