<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
  >
    <header
      class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4"
    >
      <div class="container mx-auto flex items-center">
        <button
          @click="goBack"
          class="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeftIcon class="h-6 w-6" />
        </button>
        <h1 class="text-2xl font-bold">About Mathlly</h1>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8 md:py-12">
     <div class="-mt-4 mb-4 flex flex-row justify-center items-center ml-2 p-1 rounded-2xl w-32 align-middle  
     text-gray-100 bg-indigo-500 dark:bg-gray-600 tracking-wider gap-1 pointer-events-none"><span class="h-2 w-2 bg-gray-100 rounded-full"></span><span class="text-sm font-bold vertical-middle" style="font-family: 'Geist mono'">v0.2.0-beta</span></div>
      <section
        class="mb-16 sm:mb-32 text-left"
        style="font-family: 'Geist mono'"
      >
        <h2 class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold mb-4">
          The toolset by developers,
          <span
            class="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-4 opacity-70"
            >for developers</span
          >
        </h2>

        <p
          class="text-base sm:text-lg md:text-xl max-w-2xl opacity-50 text-left"
          style="font-family: 'Geist'"
        >
          Mathlly is more than just a calculator. It's a comprehensive suite of
          mathematical tools designed to streamline your workflow and boost your
          productivity.
        </p>
      </section>

      <section class="mb-12">
        <h3
          class="text-2xl font-semibold mb-2 border-t border-gray-200 dark:border-gray-700 py-2 mt-12"
        >
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

      <section class="mb-12">
        <h3
          class="text-2xl font-semibold mb-2 border-t border-gray-200 dark:border-gray-700 py-2 mt-12"
        >
          Why Choose Mathlly?
        </h3>
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <ul class="space-y-4">
            <li
              v-for="(reason, index) in reasons"
              :key="index"
              class="flex items-start"
            >
              <CheckCircleIcon
                class="h-4 w-4 text-green-500 mr-2 flex-shrink-0"
              />
              <span class="text-sm">{{ reason }}</span>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h3
          class="text-2xl font-semibold mb-2 border-t border-gray-200 dark:border-gray-700 py-2 mt-12"
        >
          Our Mission
        </h3>
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <p class="text-sm leading-relaxed">
            At Mathlly, we're committed to empowering developers with powerful,
            intuitive, and efficient mathematical tools. Our goal is to
            streamline complex calculations, making your coding journey smoother
            and more productive.
          </p>
        </div>
      </section>
    </main>

    <footer
      class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-12"
    >
      <div class="container mx-auto px-4 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          &copy; {{ new Date().getFullYear() }} Mathlly. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ArrowLeftIcon, CheckCircleIcon } from "lucide-vue-next";
import { useRouter } from "vue-router";
import FeatureCard from "./FeatureCard.vue";

const router = useRouter();

const goBack = () => {
  router.push("/");
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
