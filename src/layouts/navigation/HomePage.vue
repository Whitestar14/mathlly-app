<template>
  <BasePage
    :show-footer="true"
    title="Home"
    main-class="transition-colors duration-300 mx-auto text-sm"
  >
    <!-- Hero Section with Gradient Background -->
    <section
      class="pattern-grid overflow-hidden bg-gradient-to-b from-indigo-50/20 to-white dark:from-gray-900 dark:to-gray-800/80"
    >
      <!-- Grid Pattern Background -->
      <div class="container mx-auto px-4 pt-20 pb-16 md:py-24 relative">
        <div class="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div class="w-full md:w-2/3 flex justify-center flex-col text-center md:text-left space-y-6">
            <div
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.2 } }"
              class="self-center md:self-start mb-2"
            >
              <Badge
                type="custom"
                :text="`v${version.versionInfo.full}`"
                :show-notch="true"
              />
            </div>

            <h1
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
              class="text-5xl md:text-6xl lg:text-7xl font-mono font-bold tracking-tight"
            >
              Mathematical precision
              <span class="block text-indigo-600 dark:text-indigo-400 mt-2">for modern development</span>
            </h1>

            <p
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.4 } }"
              class="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-lg self-center md:self-start"
            >
              A comprehensive suite of mathematical tools designed to streamline your development workflow
            </p>

            <div
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.5 } }"
              class="flex justify-center md:justify-start flex-wrap gap-4 mt-8"
            >
              <RouterLink to="/calculator">
                <Button
                  variant="primary"
                  class="w-full sm:w-auto"
                >
                  <Sparkles class="h-4 w-4" />
                  Get Started
                </Button>
              </RouterLink>
              <a
                href="https://github.com/Whitestar14/mathlly-app"
                target="_blank"
              >
                <Button
                  variant="outline"
                  class="w-full sm:w-auto"
                >
                  <GithubIcon class="h-4 w-4" />
                  View GitHub
                </Button>
              </a>
            </div>
          </div>

          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :enter="{ opacity: 1, scale: 1, transition: { delay: 0.6, duration: 0.5 } }"
            class="w-full md:w-1/3 flex justify-center mt-8 md:mt-0"
          >
            <BaseMedia
              type="svg"
              :svg-path="'/icons/mathlly.svg'"
              size="lg"
              class="relative hidden md:block scale-150 md:scale-[2.5] lg:scale-[3.5]"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="py-16 bg-white dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, stagger: 0.1 }"
          class="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <div
            v-for="stat in statistics"
            :key="stat.label"
            class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700/50"
          >
            <h3 class="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              <CountUp
                :end-val="stat.value"
                :duration="2.5"
                :suffix="stat.suffix"
              />
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Essential Tools Section -->
    <section class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-10">
          <h2 class="text-2xl md:text-3xl font-medium">
            Essential Tools
          </h2>
          <RouterLink to="/calculator">
            <Button
              variant="link"
              class="group"
            >
              View all tools
              <ArrowRightIcon class="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </RouterLink>
        </div>

        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, stagger: 0.1 }"
          class="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <RouterLink
            v-for="tool in quickTools"
            :key="tool.path"
            :to="tool.path"
            class="relative block h-full transition-transform duration-300 hover:-translate-y-1"
          >
            <FeatureCard
              :key="tool.name"
              :title="tool.name"
              :icon="tool.icon"
              :description="tool.description"
            />
            <Badge
              v-if="tool.isNew"
              type="new"
              class="absolute right-5 top-5"
            />
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="py-16 bg-white dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl md:text-3xl font-medium mb-10 text-center">
          Key Features
        </h2>
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, stagger: 0.1 }"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <FeatureCard
            v-for="feature in features"
            :key="feature.title"
            class="dark:!bg-gray-900/50 dark:!border-gray-700/50"
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
          />
        </div>
      </div>
    </section>

    <!-- Redesigned Why Choose Us & Mission Section -->
    <section class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <div class="flex flex-col gap-12">
          <!-- Why Choose Us Section - Redesigned -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0 }"
            class="w-full"
          >
            <h2 class="text-2xl md:text-3xl font-medium mb-6">
              Why Choose Mathlly?
            </h2>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  v-for="(reason, index) in reasons"
                  :key="index"
                  class="flex items-start"
                >
                  <div class="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full mr-4 shrink-0 mt-0.5">
                    <CheckCircleIcon class="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span class="text-gray-700 dark:text-gray-300">{{ reason }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Mission Section - Redesigned -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0 }"
            class="w-full"
          >
            <h2 class="text-2xl md:text-3xl font-medium mb-6">
              Our Mission
            </h2>
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div class="flex flex-col md:flex-row">
                <div class="md:w-2/3 p-6">
                  <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    At Mathlly, we're committed to empowering developers with powerful, intuitive, and efficient
                    mathematical tools.
                    Our goal is to streamline complex calculations, making your coding journey smoother and more
                    productive.
                  </p>
                  <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                    We believe that mathematical precision should be accessible to all developers, regardless of their
                    background or experience level.
                  </p>
                </div>
                <div class="md:w-1/3 bg-indigo-50 dark:bg-gray-700 p-6 flex items-center justify-center">
                  <div class="text-center">
                    <AsteriskIcon class="h-16 w-16 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
                    <p class="text-indigo-700 dark:text-indigo-300 font-medium">
                      Precision & Simplicity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section - Redesigned with improved dark mode support -->
    <section class="py-16 bg-white dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0 }"
          class="relative overflow-hidden rounded-lg shadow-lg"
        >
          <!-- Content -->
          <div class="relative z-5 p-8 md:p-12 text-center">
            <!-- Logo accent -->
            <div class="flex justify-center mb-6">
              <TextLogo size="sm" />
            </div>

            <!-- Title with monospace accent - improved for dark mode -->
            <h2 class="text-2xl md:text-3xl font-mono font-medium mb-4 text-white">
              Ready to experience <kbd
                class="inline-block bg-white/10 dark:bg-white/30 px-2 py-1 rounded text-white dark:text-white border border-white/20"
              >
                {math<span class="text-indigo-200 dark:text-indigo-300 font-black inline-block mx-0.5">//</span>y}
              </kbd>?
            </h2>

            <p class="text-indigo-100 dark:text-indigo-50 max-w-2xl mx-auto mb-8 text-lg">
              Join hundreds of developers who are already using Mathlly to streamline their mathematical workflows.
            </p>

            <!-- Action buttons with badge - improved for dark mode -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <RouterLink to="/calculator">
                <Button
                  variant="secondary"
                  class="bg-white dark:bg-gray-100 text-indigo-600 dark:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-gray-200 shadow-md hover:shadow-lg transition-colors duration-300 w-full sm:w-auto"
                >
                  <CalculatorIcon class="h-4 w-4" />
                  Try Mathlly Now
                </Button>
              </RouterLink>

              <a
                href="https://github.com/Whitestar14/mathlly-app"
                target="_blank"
              >
                <Button
                  variant="outline"
                  class="border-white/30 dark:border-white/40 !text-white hover:bg-white/10 dark:hover:bg-white/15 w-full sm:w-auto"
                >
                  <GithubIcon class="h-4 w-4" />
                  Star on GitHub
                </Button>
              </a>
            </div>

            <!-- Version badge -->
            <div class="mt-8 flex justify-center">
              <Badge
                type="custom"
                :text="`v${version.versionInfo.full}`"
                :show-notch="false"
              />
            </div>
          </div>

          <!-- Gradient overlay - adjusted for better dark mode appearance -->
          <div
            class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-800 dark:to-blue-900"
          />

          <!-- Background with grid pattern -->
          <div class="absolute inset-0 pattern-grid opacity-10 dark:opacity-50" />

          <!-- Decorative elements with dark mode adjustments -->
          <div class="absolute top-0 right-0 w-64 h-64 -mt-12 -mr-12 opacity-20 dark:opacity-10">
            <div class="w-full h-full rounded-full bg-white dark:bg-indigo-400 blur-3xl" />
          </div>
          <div class="absolute bottom-0 left-0 w-48 h-48 -mb-8 -ml-8 opacity-20 dark:opacity-10">
            <div class="w-full h-full rounded-full bg-white dark:bg-indigo-400 blur-3xl" />
          </div>
        </div>
      </div>
    </section>

    <!-- Welcome Modal -->
    <welcome-modal v-model="showWelcomeModal" />
  </BasePage>
</template>

<script setup>
import { ref, defineComponent, h, onMounted } from 'vue';
import {
  Sparkles,
  ArrowRightIcon, 
  CheckCircleIcon,
  CalculatorIcon,
  GithubIcon,
  AsteriskIcon
} from 'lucide-vue-next';
import { useTimeoutFn } from '@vueuse/core';
import { useVersionStore } from '@/stores/version';
import { RouterLink } from 'vue-router';
import TextLogo from '@/components/base/TextLogo.vue';
import BaseMedia from '@/components/base/BaseMedia.vue';
import Button from '@/components/base/BaseButton.vue';
import Badge from '@/components/base/BaseBadge.vue';
import BasePage from "@/components/base/BasePage.vue";
import FeatureCard from "@/components/cards/FeatureCard.vue";
import WelcomeModal from "@/components/ui/WelcomeModal.vue";

// Simple CountUp component
const CountUp = defineComponent({
  name: 'CountUp',
  props: {
    endVal: { type: Number, required: true },
    duration: { type: Number, default: 2 },
    suffix: { type: String, default: '' }
  },
  setup(props) {
    const currentValue = ref(0);
    
    onMounted(() => {
      const startTime = Date.now();
      const endTime = startTime + props.duration * 1000;
      
      const updateValue = () => {
        const now = Date.now();
        if (now >= endTime) {
          currentValue.value = props.endVal;
          return;
        }
        
        const elapsed = now - startTime;
        const progress = elapsed / (props.duration * 1000);
        currentValue.value = Math.floor(progress * props.endVal);
        requestAnimationFrame(updateValue);
      };
      
      updateValue();
    });
    
    return () => h('span', {}, `${currentValue.value}${props.suffix}`);
  }
});

const version = useVersionStore();

const quickTools = [
  {
    name: 'Calculator',
    path: '/calculator',
    icon: 'Calculator',
    description: 'Advanced calculator with programming-specific features and real-time evaluation.',
    isNew: false
  },
  {
    name: 'Base64',
    path: '/tools/base64',
    icon: 'Binary',
    description: 'Efficiently encode and decode Base64 strings with instant preview and validation.',
    isNew: true
  },
  {
    name: 'Functions',
    path: '/functions',
    icon: 'FunctionSquare',
    description: 'Comprehensive mathematical functions with visualization capabilities.',
    isNew: false
  }
];

const statistics = [
  { label: 'Calculations Performed', value: 50000, suffix: '+' },
  { label: 'Active Users', value: 300, suffix: '+' },
  { label: 'Tools Available', value: 15, suffix: '+' }
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

const showWelcomeModal = ref(false);

onMounted(() => {
  // Check if the welcome modal has been shown before
  const hasShownWelcome = localStorage.getItem("mathlly-welcome-shown") === "true";
  
  if (!hasShownWelcome) {
    // Add a delay before showing the modal
    useTimeoutFn(() => {
      showWelcomeModal.value = true;
    }, 1000);
  }
});
</script>
