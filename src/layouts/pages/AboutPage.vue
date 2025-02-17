<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <header class="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto flex items-center h-16 px-4">
        <button
          class="mr-4 h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          @click="goBack"
        >
          <ArrowLeftIcon class="h-6 w-6" />
        </button>
        <h1 class="text-xl font-semibold">
          About Mathlly
        </h1>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <div class="inline-flex items-center rounded-full border border-indigo-200 dark:border-gray-800 bg-indigo-50 dark:bg-gray-800/50 px-3 py-1 text-sm font-medium mb-8">
        <span class="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-2" />
        <span
          class="text-indigo-600 dark:text-indigo-400"
          style="font-family: 'Geist mono'"
        >
          v{{ version.versionInfo.full }}
        </span>
      </div>

      <section
        class="mb-24"
        style="font-family: 'Geist mono'"
      >
        <h2 class="text-4xl sm:text-6xl lg:text-8xl font-semibold tracking-tight mb-4">
          The toolset by developers,
          <span class="block mb-4 text-gray-600 dark:text-gray-400">
            for developers
          </span>
        </h2>

        <p
          class="text-base sm:text-lg md:text-xl max-w-2xl text-gray-600 dark:text-gray-400"
          style="font-family: 'Inter'"
        >
          Mathlly is more than just a calculator. It's a comprehensive suite of mathematical tools crafted to streamline your workflow and boost your productivity.
        </p>
      </section>

      <section class="space-y-8">
        <h3 class="text-2xl font-semibold tracking-tight">
          Key Features
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            v-for="feature in features"
            :key="feature.title"
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
          />
        </div>
      </section>

      <section class="mt-16 space-y-6">
        <h3 class="text-2xl font-semibold tracking-tight">
          Why Choose Mathlly?
        </h3>
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <ul class="space-y-4">
            <li
              v-for="(reason, index) in reasons"
              :key="index"
              class="flex items-start group"
            >
              <CheckCircleIcon class="h-4 w-4 text-green-500 dark:text-green-400 mt-1 mr-3 shrink-0 opacity-75 group-hover:opacity-100 transition-opacity" />
              <span class="text-sm text-gray-600 dark:text-gray-300">{{ reason }}</span>
            </li>
          </ul>
        </div>
      </section>

      <section class="mt-16 space-y-6">
        <h3 class="text-2xl font-semibold tracking-tight">
          Our Mission
        </h3>
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            At Mathlly, we're committed to empowering developers with powerful, intuitive, and efficient mathematical tools. Our goal is to streamline complex calculations, making your coding journey smoother and more productive.
          </p>
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
import { ArrowLeftIcon, CheckCircleIcon } from "lucide-vue-next";
import { useRouter } from "vue-router";
import FeatureCard from "@/components/FeatureCard.vue";
import { useVersionStore } from '@/stores/version'

const version = useVersionStore()

import { useTitle } from '@vueuse/core';
const router = useRouter();
useTitle(`${router.currentRoute.value.name} | Mathlly`);

const goBack = () => {
  router.go(-1);
};

const features = [
  {
    icon: "CalculatorIcon",
    title: "Advanced Modes",
    description:
      "From basic arithmetic to complex programming calculations, we've got you covered.",
  },
  {
    icon: "EyeIcon",
    title: "Real-time Preview",
    description:
      "See your results instantly as you type, enhancing your productivity.",
  },
  {
    icon: "HistoryIcon",
    title: "Calculation History",
    description:
      "Never lose track of your work with our comprehensive history feature.",
  },
  {
    icon: "PaletteIcon",
    title: "Customizable UI",
    description:
      "Tailor the interface to your preferences for a personalized experience.",
  },
  {
    icon: "CodeIcon",
    title: "Developer-Focused",
    description:
      "Built with the needs of developers in mind, including programmer-specific functions.",
  },
  {
    icon: "CloudIcon",
    title: "Cloud Sync",
    description:
      "Access your calculations and settings across all your devices.",
  },
];

const reasons = [
  "Designed specifically for developers and programmers",
  "Constantly updated with new features based on user feedback",
  "Open-source and community-driven development",
  "Seamless integration with popular IDEs and text editors",
  "Extensive documentation and support resources",
];
</script>
