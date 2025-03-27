<template>
  <BasePage title="What's New" :showFooter="true" :showVersion="true">

    <section class="space-y-8">
      <h2 class="text-2xl font-medium tracking-tight">
        Latest Updates
      </h2>
      <div class="grid gap-6">
        <UpdateCard
          v-for="update in visibleUpdates"
          :key="update.version"
          :version="update.version"
          :date="update.date"
          :features="update.features"
        />
      </div>
      
      <div v-if="hasMoreUpdates" class="flex justify-center mt-8">
        <Button
        variant="primary" 
          @click="showMoreUpdates">
          See More
        </Button>
      </div>
    </section>

    <section class="mt-16">
      <h3 class="text-xl font-medium tracking-tight mb-6">
        Coming Soon
      </h3>
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <ul class="space-y-4">
          <li
            v-for="(feature, index) in upcomingFeatures"
            :key="index"
            class="flex items-start"
          >
            <ClockIcon class="h-4 w-4 text-indigo-500 dark:text-indigo-400 mt-1 mr-3 shrink-0" />
            <span class="text-sm">{{ feature }}</span>
          </li>
        </ul>
      </div>
    </section>
  </BasePage>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ClockIcon } from 'lucide-vue-next';
import { updates, upcomingFeatures } from '@/data/changelog';
import UpdateCard from '@/components/cards/UpdateCard.vue';
import BasePage from '@/components/base/BasePage.vue';
import Button from '@/components/base/BaseButton.vue';

const UPDATES_PER_PAGE = 10;
const visibleCount = ref(UPDATES_PER_PAGE);
const visibleUpdates = computed(() => {
  return updates.slice(0, visibleCount.value);
});
const hasMoreUpdates = computed(() => {
  return visibleCount.value < updates.length;
});

function showMoreUpdates() {
  visibleCount.value += UPDATES_PER_PAGE;
}
</script>