<template>
  <BasePage :showHeader="true" :showFooter="true" :showVersion="true" title="Home" mainClass="w-full mx-auto text-sm">
    <!-- Hero Section with Animated Background -->
    <section class="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div ref="particlesContainer" class="absolute inset-0 pointer-events-none opacity-20"></div>
      <div class="container mx-auto px-4 py-16 md:py-24">
        <div class="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div class="w-full md:w-2/3 flex justify-center flex-col text-center md:text-left space-y-6">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-mono font-bold tracking-tight">
              Mathematical precision
              <span class="block text-indigo-600 dark:text-indigo-400 mt-2">for modern development</span>
            </h1>
            <p class="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-lg self-center md:self-start">
              A comprehensive suite of mathematical tools designed to streamline your development workflow
            </p>
            <div class="flex justify-center md:justify-start flex-wrap gap-4 mt-8">
              <Button variant="primary" size="lg" class="w-full sm:w-auto">Get Started</Button>
              <Button variant="outline" size="lg" class="w-full sm:w-auto">View Demo</Button>
            </div>
          </div>
          <div class="w-full md:w-1/3 flex justify-center mt-8 md:mt-0">
            <Logo size="lg" class="transform scale-125 transition-all duration-500 hover:scale-150" />
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="py-16 bg-white dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div 
            v-for="stat in statistics" 
            :key="stat.label"
            class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300"
            ref="statElements"
          >
            <h3 class="text-3xl md:text-4xl font-mono font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              <span ref="countElements">0</span>{{ stat.suffix }}
            </h3>
            <p class="text-gray-600 dark:text-gray-300">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Essential Tools Section -->
    <section class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-10">
          <h2 class="text-2xl md:text-3xl font-medium">Essential Tools</h2>
          <Button variant="link" class="group"> 
            View all tools
            <ArrowRightIcon class="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
        <div 
          class="grid grid-cols-1 md:grid-cols-3 gap-6"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, stagger: 0.1 }"
        >
          <RouterLink
            v-for="tool in quickTools"
            :key="tool.path"
            :to="tool.path"
            class="block h-full transition-transform duration-300 hover:-translate-y-1"
          >
            <FeatureCard
              :icon="tool.icon.name"
              :title="tool.name"
              :description="tool.description"
              class="h-full"
            />
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="py-16 bg-white dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl md:text-3xl font-medium mb-10 text-center">Key Features</h2>
        <div 
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
            class="h-full transition-all duration-300 hover:shadow-md"
          />
        </div>
      </div>
    </section>

    <!-- Why Choose Us & Mission Section -->
    <section class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Why Choose Us Section -->
          <div class="space-y-6">
            <h2 class="text-2xl md:text-3xl font-medium">Why Choose Mathlly?</h2>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm h-full">
              <ul class="space-y-4">
                <li v-for="(reason, index) in reasons" :key="index" class="flex items-center group">
                  <div class="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full mr-4 shrink-0">
                    <CheckCircleIcon class="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span class="text-gray-700 dark:text-gray-300">{{ reason }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Mission Section -->
          <div class="space-y-6">
            <h2 class="text-2xl md:text-3xl font-medium">Our Mission</h2>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm h-full">
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                At Mathlly, we're committed to empowering developers with powerful, intuitive, and efficient mathematical tools. 
                Our goal is to streamline complex calculations, making your coding journey smoother and more productive.
              </p>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                We believe that mathematical precision should be accessible to all developers, regardless of their background or experience level.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-white dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <div class="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-700 dark:to-blue-700 rounded-lg p-8 md:p-12 text-center shadow-lg">
          <h2 class="font-mono text-2xl md:text-3xl font-medium mb-4 text-white">Ready to get started?</h2>
          <p class="text-indigo-100 max-w-2xl mx-auto mb-8 text-lg">
            Join hundreds of developers who are already using Mathlly to streamline their mathematical workflows.
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            class="bg-white text-indigo-600 hover:bg-indigo-40 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Try Mathlly Now
          </Button>
        </div>
      </div>
    </section>
  </BasePage>
</template>

<script setup>
import BasePage from "@/components/base/BasePage.vue";
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { 
  Code2Icon, 
  Binary, 
  FunctionSquareIcon, 
  ArrowRightIcon, 
  CheckCircleIcon,
} from 'lucide-vue-next';
import { useTitle } from '@vueuse/core';
import Logo from '@/components/base/BaseLogo.vue';
import Button from '@/components/base/BaseButton.vue';
import anime from 'animejs';
import FeatureCard from "@/components/cards/FeatureCard.vue";

const mounted = ref(false);
const windowWidth = ref(window.innerWidth);
const particlesContainer = ref(null);
const statElements = ref([]);
const animeInstances = ref([]);

// Update window width on resize
const handleResize = () => {
  windowWidth.value = window.innerWidth;
  adjustParticlesForScreenSize();
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  mounted.value = true;
  
  // Initialize animations
  initParticles();
  setTimeout(() => {
    animateStatistics();
  }, 500);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  // Clean up anime.js instances
  animeInstances.value.forEach(instance => {
    if (instance && typeof instance.pause === 'function') {
      instance.pause();
    }
  });
});

useTitle('Mathlly - Mathematical Precision for Modern Development');

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
    description: 'Comprehensive mathematical functions with visualization capabilities.'
  }
];

const statistics = [
  { label: 'Calculations Performed', value: 50000, suffix: '+' },
  { label: 'Active Users', value: 300, suffix: '+' },
  { label: 'Tools Available', value: 5, suffix: '+' }
];

const features = [
  {
    icon: "Calculator",
    title: "Advanced Modes",
    description:
      "From basic arithmetic to complex programming calculations, we've got you covered.",
  },
  {
    icon: "Eye",
    title: "Real-time Preview",
    description:
      "See your results instantly as you type, enhancing your productivity.",
  },
  {
    icon: "History",
    title: "Calculation History",
    description:
      "Never lose track of your work with our comprehensive history feature.",
  },
  {
    icon: "Palette",
    title: "Customizable UI",
    description:
      "Tailor the interface to your preferences for a personalized experience.",
  },
  {
    icon: "Code",
    title: "Developer-Focused",
    description:
      "Built with the needs of developers in mind, including programmer-specific functions.",
  },
  {
    icon: "Cloud",
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

// Determine number of particles based on screen size
const getParticleCount = () => {
  if (windowWidth.value < 640) return 20; // Mobile
  if (windowWidth.value < 1024) return 40; // Tablet
  return 60; // Desktop
};

// Adjust particles for screen size
const adjustParticlesForScreenSize = () => {
  if (!particlesContainer.value) return;
  
  // Clear existing particles
  particlesContainer.value.innerHTML = '';
  
  // Create new particles based on screen size
  initParticles();
};

// Particles Animation
const initParticles = () => {
  if (!particlesContainer.value) return;
  
  const particleCount = getParticleCount();
  const particles = Array.from({ length: particleCount }, () => {
    const particle = document.createElement('div');
    particle.className = 'particle';
    return particle;
  });
  
  particles.forEach(p => particlesContainer.value.appendChild(p));
  
  const instance = anime({
    targets: '.particle',
    translateX: () => anime.random(-windowWidth.value/2, windowWidth.value/2),
    translateY: () => anime.random(-400, 500),
    scale: () => anime.random(1, windowWidth.value < 640 ? 2 : 3),
    opacity: () => anime.random(0.1, 0.5),
    easing: 'linear',
    duration: () => anime.random(2000, 5000),
    delay: () => anime.random(0, 1000),
    loop: true,
    direction: 'alternate'
  });
  
  animeInstances.value.push(instance);
};

// Statistics Animation with IntersectionObserver for better performance
const animateStatistics = () => {
  if (!statElements.value.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statistics.forEach((stat, index) => {
          if (!statElements.value[index]) return;
          
          const instance = anime({
            targets: statElements.value[index].querySelector('span'),
            innerHTML: [0, stat.value],
            round: 1,
            easing: 'easeInOutExpo',
            duration: 2000,
            delay: index * 200
          });
          
          animeInstances.value.push(instance);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.1 });
  
  observer.observe(statElements.value[0]);
};
</script>

<style scoped>
.particle {
  position: absolute;
  width: 5px;
  height: 5px;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.3;
}

@media (max-width: 640px) {
  .particle {
    width: 3px;
    height: 3px;
  }
}

/* Add subtle hover effects */
.feature-card {
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Ensure smooth animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>