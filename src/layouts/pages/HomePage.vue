<template>
  <BasePage 
    :showHeader="false" 
    :showVersion="true"
  >
    <div ref="particlesContainer" class="fixed inset-0 pointer-events-none opacity-20"></div>

    <main class="container mx-auto px-4 py-6 relative">
      <!-- Hero Section -->
      <section class="max-w-4xl mx-auto text-center mb-16 md:mb-24 space-y-6">
        <div class="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-4 font-mono">
          Mathematical precision
          <span class="block text-gray-600 dark:text-gray-400">for modern development</span>
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          A comprehensive suite of mathematical tools designed to streamline your development workflow
        </p>
      </section>

      <!-- Statistics Section -->
      <section class="max-w-6xl mx-auto mb-24">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            v-for="stat in statistics" 
            :key="stat.label"
            class="stat-card"
            ref="statElements"
          >
            <h3 class="text-4xl font-mono font-bold text-indigo-500 dark:text-indigo-400">
              <span ref="countElements">0</span>{{ stat.suffix }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">{{ stat.label }}</p>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="max-w-6xl mx-auto mb-24 space-y-8">
        <h2 class="text-2xl font-medium tracking-tight">Key Features</h2>
        <div 
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, stagger: 0.1 }"
        >
          <FeatureCard
            v-for="feature in features"
            :key="feature.title"
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
          />
        </div>
      </section>

      <!-- Tools Grid -->
      <div class="max-w-6xl mx-auto">
        <div 
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          :class="{'opacity-0': !mounted}"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, stagger: 0.1 }"
        >
          <RouterLink
            v-for="tool in quickTools"
            :key="tool.path"
            :to="tool.path"
            class="group relative overflow-hidden"
          >
            <div 
              class="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 
                     transition-all duration-300 ease-out
                     hover:border-indigo-500 dark:hover:border-indigo-400
                     hover:shadow-lg hover:shadow-indigo-500/5
                     dark:hover:shadow-indigo-400/5"
            >
              <div class="flex items-center gap-4 mb-4">
                <div 
                  class="p-2 rounded-md bg-indigo-50 dark:bg-indigo-500/10 
                         text-indigo-500 dark:text-indigo-400
                         group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20
                         transition-colors duration-300"
                >
                  <component :is="tool.icon" class="h-5 w-5" />
                </div>
                <h2 class="text-xl font-semibold">{{ tool.name }}</h2>
              </div>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">{{ tool.description }}</p>
              <div 
                class="mt-4 flex items-center text-sm text-indigo-500 dark:text-indigo-400
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <span>Get started</span>
                <ArrowRightIcon class="h-4 w-4 ml-1" />
              </div>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Why Choose Us Section -->
      <section class="max-w-6xl mx-auto mt-24 space-y-6">
        <h2 class="text-2xl font-medium tracking-tight">Why Choose Mathlly?</h2>
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
             v-motion
             :initial="{ opacity: 0, y: 20 }"
             :enter="{ opacity: 1, y: 0 }">
          <ul class="space-y-4">
            <li v-for="(reason, index) in reasons" :key="index" class="flex items-start group">
              <CheckCircleIcon class="h-4 w-4 text-green-500 dark:text-green-400 mt-1 mr-3 shrink-0 opacity-75 group-hover:opacity-100 transition-opacity" />
              <span class="text-sm text-gray-600 dark:text-gray-300">{{ reason }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Mission Section -->
      <section class="max-w-6xl mx-auto mt-24 mb-16 space-y-6">
        <h2 class="text-2xl font-medium tracking-tight">Our Mission</h2>
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
             v-motion
             :initial="{ opacity: 0, y: 20 }"
             :enter="{ opacity: 1, y: 0 }">
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            At Mathlly, we're committed to empowering developers with powerful, intuitive, and efficient mathematical tools. 
            Our goal is to streamline complex calculations, making your coding journey smoother and more productive.
          </p>
        </div>
      </section>
    </main>
  </BasePage>
</template>

<script setup>
import BasePage from "@/components/base/BasePage.vue";
import { ref, onMounted } from 'vue';
import { Code2Icon, Binary, FunctionSquareIcon, ArrowRightIcon, CheckCircleIcon } from 'lucide-vue-next';
import { useTitle } from '@vueuse/core';
import Logo from '@/components/base/BaseLogo.vue';
import FeatureCard from "@/components/cards/FeatureCard.vue";
import anime from 'animejs';

const mounted = ref(false);
onMounted(() => mounted.value = true);

useTitle('Home - Mathlly');

const quickTools = [
  {
    name: 'Calculator',
    path: '/calculator',
    icon: Code2Icon,
    description: 'Advanced calculator with programming-specific features and real-time evaluation.'
  },
  {
    name: 'Base64',
    path: '/tools/base64',
    icon: Binary,
    description: 'Efficiently encode and decode Base64 strings with instant preview and validation.'
  },
  {
    name: 'Functions',
    path: '/functions',
    icon: FunctionSquareIcon,
    description: 'Comprehensive mathematical functions with visualization capabilities. (Coming Soon)'
  }
];

const particlesContainer = ref(null);
const statElements = ref([]);

const statistics = [
  { label: 'Calculations Performed', value: 1000000, suffix: '+' },
  { label: 'Active Users', value: 50000, suffix: '+' },
  { label: 'Tools Available', value: 15, suffix: '' }
];

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

// Particles Animation
const initParticles = () => {
  const particles = Array.from({ length: 50 }, () => {
    const particle = document.createElement('div');
    particle.className = 'particle';
    return particle;
  });
  
  particles.forEach(p => particlesContainer.value?.appendChild(p));
  
  anime({
    targets: '.particle',
    translateX: () => anime.random(-500, 500),
    translateY: () => anime.random(-500, 500),
    scale: () => anime.random(1, 3),
    easing: 'linear',
    duration: () => anime.random(1000, 3000),
    delay: () => anime.random(0, 1000),
    loop: true,
    direction: 'alternate'
  });
};

// Statistics Animation
const animateStatistics = () => {
  statistics.forEach((stat, index) => {
    anime({
      targets: statElements.value[index].querySelector('span'),
      innerHTML: [0, stat.value],
      round: 1,
      easing: 'easeInOutExpo',
      duration: 2000,
      delay: index * 200
    });
  });
};

onMounted(() => {
  initParticles();
  animateStatistics();
});
</script>

<style scoped>
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.3;
}

.stat-card {
  @apply p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center transition-all duration-300 hover:border-indigo-500 dark:hover:border-indigo-400;
}

.quick-action-btn {
  @apply flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
         hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300
         text-sm text-gray-600 dark:text-gray-400;
}

.step-card {
  @apply relative pl-12 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
         hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300;
}

.step-number {
  @apply absolute left-4 top-4 w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10
         text-indigo-500 dark:text-indigo-400 flex items-center justify-center text-sm font-medium;
}
</style>
