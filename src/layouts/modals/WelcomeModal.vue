<template>
  <BaseModal 
    :open="isOpen"
    @update:open="$emit('update:isOpen', $event)"
  >
    <template #title>
      Welcome to Mathlly Beta
    </template>

    <div class="space-y-6">
      <p class="text-sm text-gray-600 dark:text-gray-300">
        You're among the first to try out Mathlly, our experimental calculator
        app designed for modern computing needs.
      </p>

      <div class="space-y-3">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white">
          What you should know:
        </h4>
        <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <li
            v-for="(feature, index) in features"
            :key="index"
            class="flex items-start"
          >
            <span class="text-indigo-500 mr-2">•</span>
            {{ feature }}
          </li>
        </ul>
      </div>

      <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          Found a bug or have a suggestion?
          <a
            href="https://github.com/Whitestar14/mathlly-app/issues"
            target="_blank"
            class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
          >
            Open an issue on GitHub
          </a>
        </p>
      </div>

      <div class="flex justify-between items-center pt-2">
        <label class="flex items-center space-x-2">
          <input
            v-model="dontShowAgain"
            type="checkbox"
            class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700"
          >
          <span class="text-sm text-gray-600 dark:text-gray-300">Don't show again</span>
        </label>

        <button
          type="button"
          class="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors duration-200"
          @click="handleClose"
        >
          Get Started
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from "vue";
import BaseModal from "@/components/base/BaseModal.vue";

defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:isOpen", "close"]);

const features = [
  "This is a beta version and some features might be experimental",
  "Calculations are processed locally for your security",
  "Your feedback is invaluable in shaping Mathlly's future",
];

const dontShowAgain = ref(false);

const handleClose = () => {
  if (dontShowAgain.value) {
    localStorage.setItem("mathlly-welcome-shown", "true");
  }
  emit("close");
};
</script>
