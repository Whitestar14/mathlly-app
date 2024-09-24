<template>
  <Transition name="slide">
    <div v-show="isOpen" class="sidebar-container" :class="sidebarClasses">
      <div class="flex flex-col h-full">
        <div
          class="flex items-center justify-between p-4 pb-5 border-b border-gray-200 dark:border-gray-700 h-[64.75px]"
        >
          <div class="w-full h-full relative">
            <img
              src="@/assets/m-logo.svg"
              alt="Mathlly Logo"
              class="max-h-8 aspect-[20/7] absolute left-3 top-0.5"
            />
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

        <NavigationMenuRoot
          orientation="vertical"
          class="flex-grow p-4 relative"
        >
          <div
            v-if="showIndicator"
            class="absolute z-50 left-4 w-1 rounded-lg bg-indigo-500 dark:bg-indigo-700 transition-all duration-300 ease-in-out"
            :style="{ top: `${indicatorPosition}px`, height: '20px' }"
          ></div>
          <NavigationMenuList class="space-y-1">
            <NavigationMenuItem
              v-for="(item, index) in menuItems"
              :key="item.path"
            >
              <NavigationMenuLink
                :active="currentRoute === item.path"
                as-child
              >
                <button
                  @click="navigateTo(item.path, index)"
                  :class="[
                    'w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-all duration-300',
                    currentRoute === item.path
                      ? 'bg-gray-200 dark:bg-gray-800 font-semibold'
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

        <div
          class="mt-auto p-4 pb-0.5 border-t border-gray-200 dark:border-gray-700"
        >
          <NavigationMenuRoot orientation="vertical">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  :active="currentRoute === '/settings'"
                  as-child
                >
                  <button
                    @click="navigateTo('/settings', menuItems.length)"
                    :class="[
                      'w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-all duration-300 mb-4',
                      currentRoute === '/settings'
                        ? 'bg-gray-200 dark:bg-gray-800 font-semibold'
                        : 'font-normal',
                    ]"
                  >
                    <SettingsIcon class="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenuRoot>
          <h4 class="text-sm m-0 p-0 text-gray-500 dark:text-gray-400">
            Mathlly - The Mathlly Team
          </h4>
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
} from "lucide-vue-next";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
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
  { name: "Calculator", path: "/", icon: CalculatorIcon, indicatorOffset: 28 },
  { name: "About", path: "/about", icon: InfoIcon, indicatorOffset: 76 },
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
  "fixed inset-y-0 left-0 z-5 bg-gray-100 border-r border-gray-200 dark:border-gray-700 dark:bg-gray-900 transition-all",
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
  z-index: 5;
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