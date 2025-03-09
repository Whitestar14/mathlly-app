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
          <!-- Math Formula Background -->
          <div class="absolute inset-0 formulas-background" />
          
          <!-- Animated Math Symbols Circle -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="math-symbols-orbit">
              <span
                v-for="(symbol, index) in mathSymbols"
                :key="index" 
                class="symbol" 
                :style="{ transform: `rotate(${index * (360 / mathSymbols.length)}deg) translateX(140px)` }"
              >
                {{ symbol }}
              </span>
            </div>
          </div>

          <!-- Centered Logo with Pulse Effect -->
          <div class="relative z-10 logo-container">
            <div class="logo-glow absolute inset-0 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-xl filter blur-xl" />
            <kbd class="text-gray-800 font-medium px-6 py-4 pointer-events-none text-5xl dark:text-gray-100 bg-white/90 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl backdrop-blur-lg transform-gpu">
              {math<span class="text-indigo-500 font-black dark:text-indigo-400 inline-block mx-0.5 animate-pulse-fast">//</span>y}
            </kbd>
          </div>

          <!-- Loading Message with Typing Effect -->
          <div
            v-if="message"
            class="relative z-10 text-center space-y-3"
          >
            <div class="font-mono text-sm text-gray-600 dark:text-gray-300 typing-effect">
              {{ displayedMessage }}
            </div>
            <div class="progress-bar">
              <div class="progress-fill" />
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
import { computed, ref, watch, onMounted } from "vue";

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

// Math symbols that will rotate around the logo
const mathSymbols = ref(["∑", "∫", "π", "±", "√", "∞", "δ", "∇"]);

// For typing effect
const displayedMessage = ref("");
let typingInterval = null;

watch(() => props.message, (newMessage) => {
  if (newMessage && props.variant === "macro") {
    clearInterval(typingInterval);
    displayedMessage.value = "";
    startTypingEffect(newMessage);
  }
}, { immediate: true });

function startTypingEffect(message) {
  let i = 0;
  typingInterval = setInterval(() => {
    displayedMessage.value = message.substring(0, i) + (i < message.length ? "_" : "");
    i++;
    if (i > message.length) {
      clearInterval(typingInterval);
      displayedMessage.value = message;
    }
  }, 50);
}

onMounted(() => {
  if (props.message && props.variant === "macro") {
    startTypingEffect(props.message);
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

/* Math symbols orbit animation */
.math-symbols-orbit {
  @apply absolute text-3xl font-mono opacity-20 dark:opacity-30;
  animation: rotate-symbols 12s linear infinite;
}

.symbol {
  @apply absolute text-gray-500 dark:text-gray-400 text-2xl;
  transform-origin: center;
  animation: pulse-symbol 4s ease-in-out infinite;
}

/* Logo container with glow effect */
.logo-container {
  @apply relative flex items-center justify-center;
  animation: float 6s ease-in-out infinite;
}

/* Formula background */
.formulas-background {
  @apply absolute inset-0 opacity-5 dark:opacity-10 overflow-hidden;
  background-image: repeating-linear-gradient(
    transparent,
    transparent 30px,
    rgba(75, 85, 99, 0.1) 30px,
    rgba(75, 85, 99, 0.1) 31px
  );
  background-size: 100% 100%;
  mask-image: radial-gradient(circle at center, black 30%, transparent 70%);
}

/* Progress bar */
.progress-bar {
  @apply relative h-1 w-40 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden;
}

.progress-fill {
  @apply absolute h-full bg-indigo-500 dark:bg-indigo-400 rounded-full;
  width: 0%;
  animation: progress 2s ease-in-out infinite;
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
@keyframes rotate-symbols {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse-symbol {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.05);
  }
}

@keyframes progress {
  0% {
    width: 0%;
  }
  50% {
    width: 100%;
  }
  50.1% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
}

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