<template>
  <Transition name="slide">
    <div v-show="isOpen" class="sidebar-container" :class="sidebarClasses">
      <div class="flex flex-col h-full">
        <div class="flex items-center justify-between p-4 pb-5 border-b border-gray-200 dark:border-gray-700 h-[64.75px]">
          <div class="w-full h-full relative">
            <div class="absolute max-h-8 flex items-center">
              <kbd aria-label="logo" class="text-gray-600 font-semibold px-2 py-1 my-0 text-2xl dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg pointer-events-none" style="font-family: 'Reddit mono'">{math<span class="text-indigo-400 italic font-black dark:text-indigo-600 inline-block mx-0.5">//</span>y}<span class="ml-2 text-xs font-bold text-gray-100 dark:text-indigo-200 px-1.5 py-0.5 bg-indigo-500 dark:bg-gray-600 rounded-md align-middle tracking-wider" style="font-family: 'Reddit mono'">BETA</span></kbd>
              
            </div>
          </div>
          <button
            @click="closeSidebar"
            v-tippy="{content:'Close Sidebar', placement:'bottom'}"
            class="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-opacity duration-300"
            :class="{ 'opacity-0': !isOpen }"
          >
            <PanelLeftIcon class="h-6 w-6" />
          </button>
        </div>

        <NavigationMenuRoot>
          <NavigationMenuList class="flex-grow p-4 relative space-y-1">
            <div
              v-if="showIndicator"
              class="absolute z-50 left-4 w-1 rounded-lg bg-indigo-500 dark:bg-gray-400 transition-all duration-300 ease-in-out"
              :style="{ top: `${indicatorPosition}em`, height: '20px' }"
            ></div>
            <NavigationMenuItem v-for="(item, index) in menuItems" :key="item.path">
              <NavigationMenuLink :active="currentRoute === item.path" asChild>
                <button
                  @click="navigateTo(item.path, index)"
                  :class="[
                    'w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-300',
                    currentRoute === item.path
                      ? 'bg-gray-100 dark:bg-gray-800 font-medium text-indigo-600 dark:text-gray-400'
                      : 'font-normal',
                  ]"
                >
                  <component :is="item.icon" class="h-5 w-5" />
                  <span>{{ item.name }}</span>
                </button>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenuRoot>

        <div class="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-2 gap-2 mb-2">
            <NavigationMenuRoot v-for="item in ['settings', 'feedback']" :key="item">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink :active="currentRoute === `/${item}`" asChild>
                    <button
                      @click="navigateTo(`/${item}`, menuItems.length)"
                      :class="[
                        'flex w-full items-center justify-center gap-2 rounded-md p-2 text-sm transition-colors',
                        currentRoute === `/${item}`
                          ? 'bg-gray-100 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                      ]"
                    >
                      <component :is="item === 'settings' ? SettingsIcon : MessageSquareIcon" class="h-5 w-5" />
                      <span class="block md:sr-only capitalize">{{ item }}</span>
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenuRoot>
          </div>
          <p class="text-xs text-center text-gray-500 dark:text-gray-400">
            Mathlly - The Mathlly Team
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import {
  CalculatorIcon,
  InfoIcon,
  PanelLeftIcon,
  SettingsIcon,
  MessageSquareIcon,
} from "lucide-vue-next";
import {
  NavigationMenuRoot,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "radix-vue";
import { defineEmits, defineProps, computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:isOpen"]);

const router = useRouter();
const route = useRoute();
const currentRoute = ref(route.path);
const indicatorPosition = ref(0);
const showIndicator = ref(true);

const menuItems = [
  { name: "Calculator", path: "/", icon: CalculatorIcon, indicatorOffset: 2 },
  { name: "About", path: "/about", icon: InfoIcon, indicatorOffset: 5.25 },
];

const closeSidebar = () => emit("update:isOpen", false);

const navigateTo = (path, index) => {
  router.push(path);
  updateIndicatorPos(index);
  if (props.isMobile) {
    closeSidebar();
  }
};

const updateIndicatorPos = (index) => {
  if (index < menuItems.length) {
    indicatorPosition.value = menuItems[index].indicatorOffset;
    showIndicator.value = true;
  } else {
    showIndicator.value = false;
  }
};

const sidebarClasses = computed(() => [
  "fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all",
  props.isMobile ? "w-full" : "w-64",
]);

watch(
  () => route.path,
  (newPath) => {
    currentRoute.value = newPath;
    const index = menuItems.findIndex((item) => item.path === newPath);
    updateIndicatorPos(index !== -1 ? index : menuItems.length);
  },
  { immediate: true }
);
</script>

<style scoped>
.sidebar-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0%);
}
</style>

