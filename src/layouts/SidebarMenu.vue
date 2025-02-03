<template>
  <Transition name="slide">
    <div v-show="isOpen" class="sidebar-container" :class="sidebarClasses">
      <div class="flex flex-col h-full">
        <div
          class="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between p-4 pb-5 border-b border-gray-200 dark:border-gray-700 h-[64.75px]">
          <div class="w-full h-full relative">
            <div class="flex items-center max-h-8 space-x-2 justify-between">
              <kbd aria-label="logo"
                class="text-gray-600 font-medium px-2.5 monospace py-1.5 pointer-events-none text-2xl dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">{math<span
                  class="text-indigo-400 font-black dark:text-indigo-600 inline-block mx-0.5">//</span>y}</kbd>
              <button v-tippy="{ content: 'Close Sidebar', placement: 'bottom' }"
                class="mr-4 h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 duration-300"
                :class="{ 'opacity-0': !isOpen }" @click="closeSidebar">
                <PanelLeftIcon class="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation Menu with refined styling -->
        <NavigationMenuRoot>
          <NavigationMenuList class="flex-grow px-3 py-4 space-y-1">
            <!-- Refined indicator -->
            <div
              class="absolute z-50 left-3 w-[2px] rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-300 ease-in-out"
              :class="showIndicator ? '' : 'opacity-0'" :style="{ top: `${indicatorPosition}em`, height: '15px' }" />
            <NavigationMenuItem v-for="(item, index) in menuItems" :key="item.path">
              <NavigationMenuLink :active="currentRoute === item.path" as-child>
                <button :class="[
                  'w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors duration-200',
                  currentRoute === item.path
                    ? 'bg-gray-100/80 dark:bg-gray-800/80 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300',
                  item.comingSoon ? 'opacity-60 cursor-not-allowed' : '',
                ]" @click="!item.comingSoon && navigateTo(item.path, index)">
                  <component :is="item.icon" class="h-4 w-4 shrink-0" />
                  <span>{{ item.name }}</span>
                  <Badge v-if="item.comingSoon" type="soon" />
                  <Badge v-if="item.isNew" type="new" />
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
                  <NavigationMenuLink :active="currentRoute === `/${item}`" as-child>
                    <button v-tippy="{
                      content:
                        item === 'settings' ? 'Settings' : 'Send Feedback',
                      placement: 'top',
                      delay: [200, 0],
                    }" :class="[
                        'flex w-full items-center justify-center gap-2 rounded-md p-2 text-sm transition-colors',
                        currentRoute === `/${item}`
                          ? 'bg-gray-100 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                      ]" @click="navigateTo(`/${item}`, menuItems.length)">
                      <component :is="item === 'settings'
                          ? Settings2Icon
                          : MessageSquareIcon
                        " class="h-5 w-5" />
                      <span class="block md:sr-only capitalize">{{
                        item
                      }}</span>
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
  Code2Icon,
  InfoIcon,
  MessageSquareIcon,
  Settings2Icon,
  SparklesIcon,
  FunctionSquareIcon,
  RegexIcon,
  LineChartIcon,
  ArrowRightLeftIcon,
  PanelLeftIcon
} from "lucide-vue-next";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
} from "radix-vue";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Badge from '@/components/BaseBadge.vue'
import { usePills } from '@/composables/usePills'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  isMobile: {
    type: Boolean,
    default: false, 
  },
});

const emit = defineEmits(["update:isOpen"]);

defineOptions({
  name: "SidebarMenu"
})

const router = useRouter();
const route = useRoute();
const currentRoute = ref(route.path);
const menuItems = [
  { name: "Calculator", path: "/", icon: Code2Icon, indicatorOffset: 2.05 },
  { name: "Functions", path: "/functions", icon: FunctionSquareIcon, indicatorOffset: 4.80, comingSoon: true },
  { name: "Regex", path: "/regex", icon: RegexIcon, indicatorOffset: 7.55, comingSoon: true },
  { name: "Graphing", path: "/graphing", icon: LineChartIcon, indicatorOffset: 10.30, comingSoon: true },
  { name: "Converter", path: "/converter", icon: ArrowRightLeftIcon, indicatorOffset: 13.05, comingSoon: true },
  { name: "What's New", path: "/whats-new", icon: SparklesIcon, indicatorOffset: 15.80, },
  { name: "About", path: "/about", icon: InfoIcon, indicatorOffset: 18.55 },
];
const { currentPill, indicatorPosition, showIndicator, selectPill, updatePillIndicator } = usePills(menuItems)

// The indicator only positions correctly when the absolute value (2.7em) and a common difference of (0.05em)
//  is added to get the required value.

const closeSidebar = () => emit("update:isOpen", false);

const navigateTo = (path, index) => {
  router.push(path)
  selectPill(path, index)
  if (props.isMobile) {
    closeSidebar()
  }
}

const sidebarClasses = computed(() => [
  "overflow-y-auto fixed inset-y-0 left-0 z-50 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-all",
  props.isMobile ? "w-full" : "w-64 border-r",
]);

watch(
  () => route.path,
  (newPath) => {
    currentPill.value = newPath
    const index = menuItems.findIndex((item) => item.path === newPath)
    updatePillIndicator(index !== -1 ? index : menuItems.length)
  },
  { immediate: true }
)
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
