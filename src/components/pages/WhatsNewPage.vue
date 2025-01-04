<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div class="container mx-auto flex items-center">
        <button
            class="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            @click="goBack"
        >
            <ArrowLeftIcon class="h-6 w-6" />
        </button>
        <h1 class="text-2xl font-bold">What's New</h1>
        </div>
    </header>

    <main class="container mx-auto px-4 py-8 md:py-12">
        <div class="-mt-4 mb-4 flex flex-row justify-center items-center ml-2 p-1 rounded-2xl w-32 align-middle text-gray-100 bg-indigo-500 dark:bg-gray-600 tracking-wider gap-1 pointer-events-none">
        <span class="h-2 w-2 bg-gray-100 rounded-full" />
        <span class="text-sm font-bold vertical-middle" style="font-family: 'Geist mono'">v{{version.versionInfo.full}}</span>
        </div>

        <section class="mb-12">
        <h2 class="text-3xl font-semibold mb-6">Latest Updates</h2>
        <div class="space-y-8">
            <UpdateCard
            v-for="update in updates"
            :key="update.version"
            :version="update.version"
            :date="update.date"
            :features="update.features"
            />
        </div>
        </section>

        <section class="mb-12">
        <h3 class="text-2xl font-semibold mb-4 border-t border-gray-200 dark:border-gray-700 py-4">Coming Soon</h3>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <ul class="space-y-2">
            <li v-for="(feature, index) in upcomingFeatures" :key="index" class="flex items-start">
                <ClockIcon class="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                <span>{{ feature }}</span>
            </li>
            </ul>
        </div>
        </section>
    </main>

    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
        <div class="container mx-auto px-4 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
            &copy; {{ new Date().getFullYear() }} Mathlly. All rights reserved.
        </p>
        </div>
    </footer>
    </div>
</template>
  
  <script setup>
  import { ArrowLeftIcon, ClockIcon } from 'lucide-vue-next';
  import { useRouter } from 'vue-router';
  import UpdateCard from './components/UpdateCard.vue';
  import { updates, upcomingFeatures } from '../../data/changelog';
  import {useVersionStore} from '../../stores/version.js'
  
  const router = useRouter();
  const version = useVersionStore();
  
  const goBack = () => {
    router.push('/');
  };
  </script>
  
  