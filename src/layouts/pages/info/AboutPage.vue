<template>
  <BasePage title="About" :showFooter="true" :showVersion="true">
    <section class="mb-24 font-mono">
      <h2 class="text-4xl sm:text-6xl lg:text-8xl font-medium tracking-tight mb-4">
        The toolset by developers,
        <span class="block mb-4 text-gray-600 dark:text-gray-400">
          for developers
        </span>
      </h2>

      <p class="text-base sm:text-lg md:text-xl max-w-2xl text-gray-600 dark:text-gray-400 font-sans">
        Mathlly is more than just a calculator. It's a comprehensive suite of
        mathematical tools crafted to streamline your workflow and boost your
        productivity.
      </p>
    </section>

    <section class="space-y-8">
      <h3 class="text-2xl font-medium tracking-tight">
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
      <h3 class="text-2xl font-medium tracking-tight">
        Why Choose Mathlly?
      </h3>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <ul class="space-y-4">
          <li
            v-for="(reason, index) in reasons"
            :key="index"
            class="flex items-start group"
          >
            <CheckCircleIcon
              class="h-4 w-4 text-green-500 dark:text-green-400 mt-1 mr-3 shrink-0 opacity-75 group-hover:opacity-100 transition-opacity"
            />
            <span class="text-sm text-gray-600 dark:text-gray-300">{{
              reason
            }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="mt-16 space-y-6">
      <h3 class="text-2xl font-medium tracking-tight">
        Our Mission
      </h3>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          At Mathlly, we're committed to empowering developers with powerful,
          intuitive, and efficient mathematical tools. Our goal is to
          streamline complex calculations, making your coding journey smoother
          and more productive.
        </p>
      </div>
    </section>
  </BasePage>
</template>

<script setup>
import { CheckCircleIcon } from "lucide-vue-next";
import FeatureCard from "@/components/cards/FeatureCard.vue";
import BasePage from "@/components/base/BasePage.vue";

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
