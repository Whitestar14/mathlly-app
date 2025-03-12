<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <header class="sticky -top-px z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto flex items-center gap-2 h-14 px-4">
        <Button
          variant="ghost"
          size="icon"
          @click="goBack"
        >
          <ArrowLeftIcon class="h-5 w-5" />
        </Button>
        <h1 class="text-xl font-medium">
          What's New
        </h1>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <div class="inline-flex items-center rounded-full border border-indigo-200 dark:border-gray-800 bg-indigo-50 dark:bg-gray-800/50 px-3 py-1 text-sm font-medium mb-8">
        <span class="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-2" />
        <span
          class="text-indigo-600 dark:text-indigo-400"
          style="font-family: 'Geist mono'"
        >
          v{{ version.versionInfo.full }}
        </span>
      </div>

      <section class="space-y-8">
        <h2 class="text-2xl font-medium tracking-tight">
          Latest Updates
        </h2>
        <div class="grid gap-6">
          <UpdateCard
            v-for="update in updates"
            :key="update.version"
            :version="update.version"
            :date="update.date"
            :features="update.features"
          />
        </div>
      </section>

      <section class="mt-16">
        <h3 class="text-xl font-medium tracking-tight mb-6">
          Coming Soon
        </h3>
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <ul class="space-y-4">
            <li
              v-for="(feature, index) in upcomingFeatures"
              :key="index"
              class="flex items-start"
            >
              <ClockIcon class="h-4 w-4 text-indigo-500 dark:text-indigo-400 mt-1 mr-3 shrink-0" />
              <span class="text-sm">{{ feature }}</span>
            </li>
          </ul>
        </div>
      </section>
    </main>

    <footer class="mt-auto py-8 pt-10 border-t border-gray-200 dark:border-gray-800">
      <div class="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {{ new Date().getFullYear() }} Mathlly. All rights reserved.
      </div>
    </footer>
  </div>
</template>

  
  <script setup>
  import { useRouter } from 'vue-router';
  import { useVersionStore } from '@/stores/version'
  import { ArrowLeftIcon, ClockIcon } from 'lucide-vue-next';
  import { updates, upcomingFeatures } from '@/data/changelog';
  import UpdateCard from '@/components/cards/UpdateCard.vue';
  import Button from "@/components/base/BaseButton.vue";

  import { useTitle } from '@vueuse/core';
  const router = useRouter();
  useTitle("What's New - Mathlly");
  const version = useVersionStore();

  const goBack = () => {
    router.go(-1);
  };
  </script>
  
  