<template>
  <BasePage title="Not Found" :showHeader="false" :showFooter="false" mainClass="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-white dark:bg-gray-800">
    <div class="space-y-6 max-w-lg">
      <!-- Error Code -->
      <div class="relative">
        <h1 class="text-9xl font-bold text-gray-200 dark:text-gray-700">
          404
        </h1>
        <div class="absolute inset-0 flex items-center justify-center">
          <kbd class="text-gray-600 font-medium px-3 py-2 text-xl dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
            {not<span class="text-indigo-400 font-black dark:text-indigo-600 mx-0.5">//</span>found}
          </kbd>
        </div>
      </div>

      <!-- Message -->
      <div class="space-y-2">
        <h2 class="text-xl font-medium text-gray-900 dark:text-gray-100">
          Page not found
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 *:min-w-[120px]">
        <Button
          variant="ghost"
          @click="router.back()"
        >
          <ArrowLeft class="h-4 w-4" />
          Go Back
        </Button>
        <Button
          variant="primary"
          @click="router.push('/')"
        >
          <Home class="h-4 w-4" />
          Home
        </Button>
      </div>
    </div>
</BasePage>
</template>

<script setup>
import { usePageTitle } from '@/composables/usePageTitle';
import { useRouter } from 'vue-router';
import { ArrowLeft, Home } from 'lucide-vue-next';
import Button from "@/components/base/BaseButton.vue";
import BasePage from '@/components/base/BasePage.vue';
defineOptions({
  name: 'NotFound'
});

usePageTitle("404 - Not Found")

const router = useRouter();
</script>
