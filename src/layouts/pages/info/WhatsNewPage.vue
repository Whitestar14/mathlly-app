<template>
  <BasePage title="What's New" :showFooter="true">
    <div class="inline-flex items-center rounded-full border border-indigo-200 dark:border-gray-800 bg-indigo-50 dark:bg-gray-800/50 px-3 py-1 text-sm font-medium mb-8">
      <span class="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-2" />
      <span class="text-indigo-600 dark:text-indigo-400 font-['Geist_Mono']">v{{ version.versionInfo.full }}</span>
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
  </BasePage>
</template>

<script setup>
import { useTitle } from '@vueuse/core';
import { useVersionStore } from '@/stores/version'
import { ClockIcon } from 'lucide-vue-next';
import { updates, upcomingFeatures } from '@/data/changelog';
import UpdateCard from '@/components/cards/UpdateCard.vue';
import BasePage from '@/components/base/BasePage.vue';

useTitle("What's New - Mathlly");
const version = useVersionStore();
</script>

