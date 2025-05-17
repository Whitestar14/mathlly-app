<template>
  <BasePanel
    id="menu"
    type="side"
    title="Menu"
    position="right"
    :draggable="true"
    :max-height-ratio="0.85"
    :show-toggle="false"
  >
    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <ScrollAreaRoot class="h-full w-full">
        <ScrollAreaViewport class="h-full w-full">
          <div class="p-3 space-y-1">
            <!-- Links -->
            <a
              v-for="link in externalLinks"
              :key="link.url"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex w-full items-center px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-gray-300 text-gray-700/90 dark:text-gray-400/90"
            >
              <component :is="link.icon" class="h-4 w-4 mr-2 text-gray-500/80 dark:text-gray-500/80" />
              <span>{{ link.text }}</span>
            </a>
          </div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation="vertical" />
      </ScrollAreaRoot>
    </div>

    <template #footer>
      <div class="space-y-1.5">
        <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 px-3">Appearance</h3>
        <ToggleGroupRoot
          v-model="selectedTheme"
          type="single"
          class="inline-flex *:items-center gap-1 p-1 mx-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <ToggleGroupItem
            v-for="item of themeItems"
            :key="item.id"
            :value="item.id"
            class="text-gray-700 dark:text-gray-300 flex justify-center w-8 h-8 rounded-md transition-colors duration-150 outline-none ring-offset-2 ring-offset-white dark:ring-offset-gray-900 focus-visible:ring-2 ring-indigo-500 data-[state=on]:bg-gray-100/80 dark:data-[state=on]:bg-gray-800/80 data-[state=on]:shadow-sm data-[state=on]:text-indigo-600 data-[state=on]:dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
          >
            <component
              :is="item.icon"
              class="h-4 w-4"
            />
            <span class="sr-only">{{ item.title }}</span>
          </ToggleGroupItem>
        </ToggleGroupRoot>
      </div>
    </template>
  </BasePanel>
</template>

<script setup>
import {
  Sun,
  Moon,
  AppWindowMac,
  ArrowUpRight,
  GithubIcon,
} from "lucide-vue-next";
import { useTheme } from "@/composables/useTheme";
import BasePanel from "@/components/base/BasePanel.vue";
import {
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaViewport,
  ToggleGroupRoot,
  ToggleGroupItem
} from "radix-vue";
import { onMounted } from 'vue';

const { selectedTheme, isDark } = useTheme();

const themeItems = [
  { id: "light", title: "Light", icon: Sun },
  { id: "dark", title: "Dark", icon: Moon },
  { id: "system", title: "System", icon: AppWindowMac }
];

const externalLinks = [
  {
    url: "https://github.com/Whitestar14/mathlly-app",
    text: "Star on GitHub",
    icon: GithubIcon
  },
  {
    url: "https://x.com/@SOlusunmbola",
    text: "Follow my Twitter",
    icon: ArrowUpRight
  }
];

onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e) => {
    if (selectedTheme.value === 'system') {
      isDark.value = e.matches;
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
});
</script>
