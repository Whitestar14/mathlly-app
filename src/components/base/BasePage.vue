<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <header v-if="showHeader" class="sticky -top-px z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto flex items-center gap-2 h-14 px-4">
        <Button v-if="showBackButton" variant="ghost" size="icon" @click="goBack">
          <ArrowLeftIcon class="h-5 w-5" />
        </Button>
        <h1 class="text-xl font-medium">
          {{ title }}
        </h1>
      </div>
    </header>

    <main :class="mainClass">
      <slot></slot>
    </main>

    <footer v-if="showFooter" class="mt-auto py-8 pt-10 border-t border-gray-200 dark:border-gray-800">
      <div class="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {{ new Date().getFullYear() }} Mathlly. All rights reserved.
      </div>
    </footer>

    <div v-if="showVersion" class="fixed bottom-4 right-4">
      <div class="inline-flex items-center rounded-full border border-indigo-200 dark:border-gray-800 bg-indigo-50 dark:bg-gray-800/50 px-3 py-1 text-sm font-medium">
        <span class="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-2" />
        <span class="text-indigo-600 dark:text-indigo-400 font-['Geist_Mono']">
          v{{ version.versionInfo.full }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useTitle } from '@vueuse/core';
import { useVersionStore } from '@/stores/version';
import { ArrowLeftIcon } from 'lucide-vue-next';
import Button from '@/components/base/BaseButton.vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: false
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  showVersion: {
    type: Boolean,
    default: false
  },
  mainClass: {
    type: String,
    default: 'container mx-auto px-4 py-8 md:py-12'
  }
});

const router = useRouter();
const version = useVersionStore();

useTitle(`${ props.title } - Mathlly`)
const goBack = () => {
  router.go(-1);
};
</script>
