<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300"
  >
    <header
      class="bg-white dark:bg-gray-800 p-4 flex items-center border-b border-gray-200 dark:border-gray-700"
    >
      <button
        @click="goBack"
        class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4"
      >
        <ArrowLeftIcon class="h-6 w-6" />
      </button>
      <h1 class="text-2xl font-semibold">About Mathlly</h1>
    </header>

    <main class="flex-grow p-6">
      <div
        class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-min"
      >
        <section
          class="bg-white dark:bg-gray-800 p-6 col-span-1 md:col-span-2 flex flex-col border border-gray-200 dark:border-gray-700 rounded-md"
        >
          <h2 class="text-xl font-semibold mb-4">Why Choose Mathlly?</h2>
          <ul class="space-y-2 flex-grow">
            <li
              v-for="(feature, index) in features"
              :key="index"
              class="flex items-center"
            >
              <span
                :class="`border-${feature.color}-500 border rounded-full p-1 mr-2 `"
              >
                <component
                  :is="feature.icon"
                  :class="`text-${feature.color}-600 dark:text-${feature.color}-400`"
                  class="h-4 w-4"
                />
              </span>
              {{ feature.text }}
            </li>
          </ul>
        </section>

        <section
          class="bg-white dark:bg-gray-800 p-6 col-span-1 md:col-span-2 flex flex-col border border-gray-200 dark:border-gray-700 rounded-md"
        >
          <h2 class="text-xl font-semibold mb-4">Our Mission</h2>
          <p class="flex-grow">
            At Mathlly, we're committed to making complex calculations simple
            and accessible. Our goal is to provide a powerful, intuitive, and
            beautiful calculator that enhances your productivity and makes math
            enjoyable.
          </p>
        </section>

        <section
          class="bg-white dark:bg-gray-800 px-6 col-span-1 md:col-span-2 lg:col-span-4 flex flex-col border border-gray-200 dark:border-gray-700 py-8 rounded-md"
        >
          <h2 class="text-xl font-semibold mb-4">Features</h2>
          <div
            class="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow"
          >
            <div
              v-for="feature in features"
              :key="feature.text"
              class="flex flex-col items-center text-center"
            >
              <component
                :is="feature.icon"
                :class="`h-8 w-8 mb-2 text-${feature.color}-500 dark:text-${feature.color}-400`"
              />
              <h3 class="font-semibold">{{ feature.title }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </section>

        <section
          class="bg-white dark:bg-gray-800 p-6 col-span-1 md:col-span-2 lg:col-span-4 border border-gray-200 dark:border-gray-700 rounded-md"
        >
          <h2 class="text-xl font-semibold mb-4">What Our Users Say</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="testimonial in testimonials"
              :key="testimonial.author"
              class="bg-gray-100 dark:bg-gray-700 p-4 border border-gray-200 dark:border-gray-600"
            >
              <p class="mb-2">"{{ testimonial.text }}"</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                - {{ testimonial.author }}, {{ testimonial.role }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer
      class="bg-white dark:bg-gray-800 p-6 text-center border-t border-gray-200 dark:border-gray-700"
    >
      <p class="mb-4">Ready to elevate your calculations?</p>
      <button
        @click="goBack"
        class="text-md font-semibold px-4 py-3 text-gray-200 dark:text-gray-700 bg-gray-700 dark:bg-gray-200 rounded-md duration-300 hover:bg-gray-600 dark:hover:bg-gray-300"
      >
        Return To App
      </button>
    </footer>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon,
  CalculatorIcon,
  EyeIcon,
  HistoryIcon,
  PaletteIcon,
} from "lucide-vue-next";
import { useRouter } from "vue-router";
const router = useRouter();

const goBack = () => {
  router.push("/");
};

const features = [
  {
    icon: CalculatorIcon,
    color: "blue",
    text: "Advanced calculation modes",
    title: "Multiple Modes",
    description: "Basic, Standard, and Programmer",
  },
  {
    icon: EyeIcon,
    color: "green",
    text: "Real-time calculation preview",
    title: "Preview",
    description: "See results as you type",
  },
  {
    icon: HistoryIcon,
    color: "yellow",
    text: "Comprehensive history",
    title: "History",
    description: "Track your calculations",
  },
  {
    icon: PaletteIcon,
    color: "purple",
    text: "Customizable settings",
    title: "Customizable",
    description: "Tailor to your preferences",
  },
];

const testimonials = [
  {
    text: "Mathlly has revolutionized the way I do calculations. It's intuitive and powerful!",
    author: "Jane Doe",
    role: "Engineer",
  },
  {
    text: "The programmer mode is a game-changer for my work. I can't imagine using anything else now.",
    author: "John Smith",
    role: "Developer",
  },
];
</script>
