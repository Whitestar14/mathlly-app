<template>
  <div
    :class="[
      'fixed inset-y-0 left-0 z-10 bg-white border-r border-gray-200 dark:border-gray-700 dark:bg-gray-900 transition-transform duration-300 ease-in-out',
      isMobile ? 'w-full' : 'w-64',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between p-4 pb-5 border-b border-gray-200 dark:border-gray-700">
        <div class="w-8 h-8">
          <img src="@/assets/mathlly-logo.svg" alt="Mathlly Logo" class="w-full h-full" />
        </div>
        <button
          @click="closeSidebar"
          class="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 custom-transition"
          :class="[isSidebarOpen ? 'opacity-0 pointer-none' : '']"
        >
          <PanelLeftIcon class="h-6 w-6" />
        </button>
      </div>
      
      <nav class="flex-grow p-4">
        <ul class="space-y-2">
          <li>
            <button
              @click="openAbout"
              class="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <InfoIcon class="h-5 w-5" />
              <span>About</span>
            </button>
          </li>
          <li>
            <button
              @click="openSettings"
              class="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <SettingsIcon class="h-5 w-5" />
              <span>Settings</span>
            </button>
          </li>
        </ul>
      </nav>
      
      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Mathlly v1.0.0
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { PanelLeftIcon, InfoIcon, SettingsIcon } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  isMobile: Boolean,
  isSidebarOpen: Boolean,
});

const emit = defineEmits(['update:isOpen', 'openAbout', 'openSettings']);

const closeSidebar = () => {
  emit('update:isOpen', false);
};

const openAbout = () => {
  emit('openAbout');
  if (props.isMobile) {
    closeSidebar();
  }
};

const openSettings = () => {
  emit('openSettings');
  if (props.isMobile) {
    closeSidebar();
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.custom-transition {
  transition: opacity 0.3s ease;
}
</style>