<template>
  <BasePage
    title="Updates"
    :show-footer="true"
  >
    <!-- Hero Section -->
    <section class="mb-12 pattern-grid overflow-hidden bg-gradient-to-b from-indigo-50/20 to-white dark:from-gray-900 dark:to-gray-800/80">
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
                type="version"
                :text="`v${version.versionInfo.full}`"
                :show-notch="true"
              />
            </div>

            <h1
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.3 } }"
              class="text-4xl md:text-5xl lg:text-6xl font-mono font-bold tracking-tight"
            >
              What's New in Mathlly
              <span class="block text-indigo-600 dark:text-indigo-400 mt-2">Continuous improvements</span>
            </h1>

            <p
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 0.4 } }"
              class="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-lg self-center md:self-start"
            >
              We're constantly working to make Mathlly better. Check out our latest updates and upcoming features.
            </p>
          </div>

          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :enter="{ opacity: 1, scale: 1, transition: { delay: 0.6, duration: 0.5 } }"
            class="w-full md:w-1/3 flex justify-center mt-8 md:mt-0"
          >
            <div class="relative hidden md:block">
              <SparklesIcon class="h-12 w-12 text-indigo-500/30 dark:text-indigo-400/30 absolute -top-6 -left-6 rotate-12" />
              <HistoryIcon class="h-32 w-32 text-indigo-500 dark:text-indigo-400" />
              <RocketIcon class="h-16 w-16 text-indigo-500/40 dark:text-indigo-400/40 absolute -bottom-4 -right-4 rotate-12" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest Updates Section -->
    <section class="space-y-6 mx-auto max-w-4xl mb-12">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center">
          <div class="relative flex items-center">
            <div class="h-10 w-10 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 rounded-full z-5">
              <HistoryIcon class="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <!-- This connects to the timeline line -->
            <div class="absolute left-5 top-10 bottom-0 w-px h-12 bg-indigo-200 dark:bg-indigo-800/50" />
          </div>
          <h3 class="text-xl font-medium tracking-tight ml-3">
            Release History
          </h3>
        </div>
        
        <!-- Version filter using SelectBar -->
        <div class="w-32">
          <SelectBar
            v-model="selectedFilter"
            :options="filters"
            placeholder="Filter versions"
            label=""
            position="popper"
          />
        </div>
      </div>
      
      <!-- Timeline Line -->
      <div class="relative">
        <div class="absolute left-0 top-0 bottom-0 w-px bg-indigo-200 dark:bg-indigo-800/50 ml-5" />
        
        <div class="grid gap-8 pl-10">
          <div
            v-for="update in filteredUpdates"
            :key="update.version"
            class="relative"
          >
            <!-- Timeline dot -->
            <div class="absolute -left-7 top-6 h-4 w-4 bg-indigo-400 dark:bg-indigo-500 rounded-full z-5 border-4 border-white dark:border-gray-900" />
            
            <UpdateCard
              :version="update.version"
              :date="update.date"
              :features="update.features"
            />
          </div>
        </div>
      </div>
      
      <div
        v-if="hasMoreUpdates"
        class="flex justify-center mt-8"
      >
        <Button
          variant="outline" 
          class="group"
          @click="showMoreUpdates"
        >
          <ChevronDownIcon class="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
          Load More Updates
        </Button>
      </div>
    </section>

    <!-- Coming Soon Section -->
    <section class="mt-16">
      <h3 class="text-xl font-medium tracking-tight mb-6 flex items-center">
        <RocketIcon class="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
        Coming Soon
      </h3>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <ul class="space-y-4">
          <li
            v-for="(feature, index) in upcomingFeatures"
            :key="index"
            class="flex items-start group"
          >
            <ClockIcon class="h-4 w-4 text-indigo-500 dark:text-indigo-400 mt-1 mr-3 shrink-0 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors" />
            <div>
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ feature }}</span>
              <div class="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                <div
                  class="h-full bg-indigo-500/30 dark:bg-indigo-500/50 rounded-full"
                  :style="`width: ${Math.floor(Math.random() * 90) + 10}%`"
                />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </BasePage>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ClockIcon, HistoryIcon, ChevronDownIcon, RocketIcon, SparklesIcon } from 'lucide-vue-next';
import { updates, upcomingFeatures } from '@/data/changelog';
import { useVersionStore } from '@/stores/version';
import UpdateCard from '@/components/cards/UpdateCard.vue';
import BasePage from '@/components/base/BasePage.vue';
import Button from '@/components/base/BaseButton.vue';
import SelectBar from '@/components/ui/SelectBar.vue';
import Badge from '@/components/base/BaseBadge.vue';

const UPDATES_PER_PAGE = 5;
const visibleCount = ref(UPDATES_PER_PAGE);
const selectedFilter = ref('all');
const version = useVersionStore();

// Filter options
const filters = [
  { label: 'All', value: 'all' },
  { label: 'Major', value: 'major' },
  { label: 'Recent', value: 'recent' }
];

watch(selectedFilter, () => {
  visibleCount.value = UPDATES_PER_PAGE;
});

// Filter updates based on selected filter
const filteredUpdates = computed(() => {
  let result = [...updates];
  
  if (selectedFilter.value === 'major') {
    // Filter to only show major version updates (x.0.0)
    result = result.filter(update => {
      const versionParts = update.version.split('.');
      return versionParts[1] === '0' && versionParts[2] === '0';
    });
  } else if (selectedFilter.value === 'recent') {
    // Show only the most recent 3 months of updates
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    result = result.filter(update => {
      const updateDate = new Date(update.date);
      return updateDate >= threeMonthsAgo;
    });
  }
  
  return result.slice(0, visibleCount.value);
});

const hasMoreUpdates = computed(() => {
  let totalFilteredUpdates = updates;
  
  if (selectedFilter.value === 'major') {
    totalFilteredUpdates = updates.filter(update => {
      const versionParts = update.version.split('.');
      return versionParts[1] === '0' && versionParts[2] === '0';
    });
  } else if (selectedFilter.value === 'recent') {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    totalFilteredUpdates = updates.filter(update => {
      const updateDate = new Date(update.date);
      return updateDate >= threeMonthsAgo;
    });
  }
  
  return visibleCount.value < totalFilteredUpdates.length;
});

function showMoreUpdates() {
  visibleCount.value += UPDATES_PER_PAGE;
}
</script>
