<template>
  <header
    class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4"
  >
    <div class="container mx-auto flex justify-between items-center">
      <!-- Logo Section -->
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8">
          <img
            src="@/assets/mathlly-logo.svg"
            alt="Mathlly Logo"
            class="w-full h-full"
          />
        </div>
      </div>
      <!-- Mode Toggle and Theme Switch -->
      <div class="flex-grow flex justify-center sm:justify-end items-center">
        <div
          class="w-full sm:w-auto flex justify-between sm:justify-end items-center space-x-4"
        >
          <!-- Spacer for left alignment on mobile -->
          <div class="w-8 sm:hidden"></div>

          <!-- Mode Toggler -->
          <div class="relative w-[70%] sm:w-32">
            <button
              @click="toggleModeDropdown"
              ref="modeToggleButton"
              class="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md transition-all hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {{ mode }}
              <ChevronDown class="inline-block w-4 h-4 ml-1" />
            </button>
            <transition name="fade-slide">
              <div
                v-if="showModeDropdown"
                class="absolute mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 overflow-hidden"
                :style="dropdownStyle"
              >
                <div
                  v-for="option in ['Basic', 'Standard', 'Programmer']"
                  :key="option"
                  @click="selectMode(option)"
                  class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-default transition-colors w-full"
                >
                  {{ option }}
                </div>
              </div>
            </transition>
          </div>

          <!-- Theme Toggle Button -->
          <button
            @click="toggleTheme"
            class="p-2 text-gray-500 rounded-full hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Sun v-if="isDark" class="h-5 w-5" />
            <Moon v-else class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { Sun, Moon, ChevronDown } from "lucide-vue-next";

const props = defineProps(["mode"]);
const emit = defineEmits(["update:mode"]);

const isDark = useDark();
const toggleDark = useToggle(isDark);
const showModeDropdown = ref(false);
const modeToggleButton = ref(null);

// Inject closeDropdown
const closeDropdown = inject("closeDropdown");

const toggleModeDropdown = () => {
  showModeDropdown.value = !showModeDropdown.value;
  if (!showModeDropdown.value) {
    closeDropdown();
  }
};

const selectMode = (newMode) => {
  emit("update:mode", newMode);
  showModeDropdown.value = false;
};

const toggleTheme = () => {
  toggleDark();
};

const dropdownStyle = computed(() => {
  if (!modeToggleButton.value) return {};

  const buttonRect = modeToggleButton.value.getBoundingClientRect();
  const isSmallScreen = window.innerWidth < 640; // sm breakpoint

  return {
    width: isSmallScreen ? `${buttonRect.width}px` : "136px", // 32 * 4 = 128px
    transform: isSmallScreen ? "translateX(0)" : "translateX(-5%)",
  };
});

// Click outside event handler
const handleClickOutside = (event) => {
  if (
    modeToggleButton.value &&
    !modeToggleButton.value.contains(event.target)
  ) {
    showModeDropdown.value = false;
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", closeDropdown);
});
</script>

<style scoped>
/* Transition for Dropdown */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease, filter 0.5s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.95);
  filter: blur(2px);
}
</style>
