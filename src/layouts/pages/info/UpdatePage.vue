<template>
  <BasePage title="Updates" :showFooter="true">
    <!-- Hero Section -->
    <section class="mb-12 pattern-grid overflow-hidden py-8">
      <div class="bg-gradient-to-b from-indigo-50/20 to-transparent dark:from-transparent dark:to-gray-800/80 rounded-lg">
      <div class="container mx-auto px-4 py-6 relative">
        <h2 class="text-3xl md:text-4xl font-medium tracking-tight mb-4 font-mono">
          What's New in Mathlly
          <span class="block text-indigo-600 dark:text-indigo-400 text-xl md:text-2xl mt-2">
            Continuous improvements for developers
          </span>
        </h2>
        <p class="text-base max-w-2xl text-gray-600 dark:text-gray-400">
          We're constantly working to make Mathlly better. Check out our latest updates and upcoming features.
        </p>
      </div>
    </div>
    </section>

    <!-- Latest Updates Section -->
    <section class="space-y-6 mx-auto max-w-4xl mb-12">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center">
          <div class="relative flex items-center">
            <div class="p-2 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 rounded-full z-5">
              <HistoryIcon class="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <!-- This connects to the timeline line -->
            <div class="absolute left-5 top-5 bottom-0 w-px h-12 bg-indigo-200 dark:bg-indigo-800/50"></div>
          </div>
          <h3 class="text-xl font-medium tracking-tight ml-3">
            Release History
          </h3>
        </div>
        
        <!-- Version filter dropdown -->
        <div v-if="showFilters" class="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            class="text-xs flex items-center gap-1"
            @click="isFilterOpen = !isFilterOpen"
          >
            <FilterIcon class="h-3 w-3" />
            {{ selectedFilter === 'all' ? 'All Versions' : `${selectedFilter} Versions` }}
            <ChevronDownIcon class="h-3 w-3 ml-1" :class="{ 'rotate-180': isFilterOpen }" />
          </Button>
          
          <!-- Filter dropdown -->
          <div v-if="isFilterOpen" 
            class="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div class="py-1">
              <button 
                v-for="filter in filters" 
                :key="filter.value"
                @click="applyFilter(filter.value)"
                class="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                :class="selectedFilter === filter.value ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : ''"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Timeline Line -->
        <div class="grid gap-8">
          <div v-for="update in filteredUpdates" :key="update.version">
            <UpdateCard
              :version="update.version"
              :date="update.date"
              :features="update.features"
            />
          </div>
        </div>
      
      <div v-if="hasMoreUpdates" class="flex justify-center mt-8 pl-5">
        <Button
          variant="outline" 
          @click="showMoreUpdates"
          class="group"
        >
          <ChevronDownIcon class="h-4 w-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
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
                <div class="h-full bg-indigo-500/30 dark:bg-indigo-500/50 rounded-full" :style="`width: ${Math.floor(Math.random() * 90) + 10}%`"></div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </BasePage>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ClockIcon, HistoryIcon, ChevronDownIcon, FilterIcon, RocketIcon } from 'lucide-vue-next';
import { updates, upcomingFeatures } from '@/data/changelog';
import UpdateCard from '@/components/cards/UpdateCard.vue';
import BasePage from '@/components/base/BasePage.vue';
import Button from '@/components/base/BaseButton.vue';
import { useEventListener } from '@vueuse/core';

const UPDATES_PER_PAGE = 5;
const visibleCount = ref(UPDATES_PER_PAGE);
const showFilters = ref(true);
const isFilterOpen = ref(false);
const selectedFilter = ref('all');

// Filter options
const filters = [
  { label: 'All Versions', value: 'all' },
  { label: 'Major Versions', value: 'major' },
  { label: 'Recent Only', value: 'recent' }
];

// Close filter dropdown when clicking outside
const closeFilterDropdown = () => {
  if (isFilterOpen.value) {
    isFilterOpen.value = false;
  }
};

// Use vueuse's useEventListener for cleaner event handling
useEventListener(document, 'click', closeFilterDropdown);

// Apply selected filter
const applyFilter = (filterValue) => {
  selectedFilter.value = filterValue;
  isFilterOpen.value = false;
  // Reset visible count when filter changes
  visibleCount.value = UPDATES_PER_PAGE;
};

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
  if (selectedFilter.value === 'all') {
    return visibleCount.value < updates.length;
  } else if (selectedFilter.value === 'major') {
    const majorVersions = updates.filter(update => {
      const versionParts = update.version.split('.');
      return versionParts[1] === '0' && versionParts[2] === '0';
    });
    return visibleCount.value < majorVersions.length;
  } else if (selectedFilter.value === 'recent') {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentUpdates = updates.filter(update => {
      const updateDate = new Date(update.date);
      return updateDate >= threeMonthsAgo;
    });
    return visibleCount.value < recentUpdates.length;
  }
  
  return false;
});

function showMoreUpdates() {
  visibleCount.value += UPDATES_PER_PAGE;
}
</script>