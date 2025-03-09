<template>
  <Transition name="slide">
    <div
      v-show="isOpen"
      class="sidebar-container"
      :class="sidebarClasses"
    >
      <div class="flex flex-col h-full">
        <div
          class="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between p-4 pb-5 border-b border-gray-200 dark:border-gray-700 h-[64.75px]"
        >
          <div class="w-full h-full relative">
            <div class="flex items-center max-h-8 space-x-2 justify-between">
              <Logo />
              <Button
                v-tippy="{ content: 'Close Sidebar', placement: 'bottom' }"
                class="mr-4"
                variant="ghost"
                size="icon"
                :class="{ 'hidden': !isOpen }"
                @click="closeSidebar"
              >
                <PanelLeftIcon class="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <NavigationMenuRoot>
          <NavigationMenuList class="flex-grow px-3 py-2 space-y-6 z-0">
            <div
              v-show="showIndicator"
              class="absolute will-change-auto z-50 left-3 rounded-full bg-indigo-500/80 dark:bg-indigo-400/80 transition-all duration-300 ease-in-out"
              :style="indicatorStyle"
            />
            <div
              v-for="category in categories"
              :key="category.title"
              class="space-y-2"
            >
              <h2 class="px-3 text-[11px] font-medium text-gray-500/90 dark:text-gray-400/90 uppercase tracking-wider">
                {{ category.title }}
              </h2>
              <div class="space-y-0.5">
                <NavigationMenuItem
                  v-for="item in category.items"
                  :key="item.path"
                  class="space-y-0.5 z-0"
                >
                  <NavigationMenuLink
                    :active="currentPill === item.path"
                    as-child
                  >
                    <button
                      :data-path="item.path"
                      :class="[
                        menuItemBaseClasses,
                        currentPill === item.path
                          ? 'bg-gray-100/80 dark:bg-gray-800/80 text-indigo-600 dark:text-indigo-400 font-medium'
                          : 'text-gray-700/90 dark:text-gray-400/90 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-300',
                        item.comingSoon ? 'opacity-50 cursor-not-allowed' : '',
                      ]"
                      @click="handleItemClick($event, item)"
                    >
                      <component
                        :is="item.icon"
                        class="h-4 w-4 shrink-0 transition-colors"
                        :class="currentPill === item.path
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-500/80 dark:text-gray-500/80'
                        "
                      />
                      <span>{{ item.name }}</span>
                      <Badge
                        v-if="item.comingSoon"
                        type="soon"
                        class="opacity-75"
                      />
                      <Badge
                        v-if="item.isNew"
                        type="new"
                        class="opacity-75"
                      />
                    </button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </div>
            </div>
          </NavigationMenuList>
        </NavigationMenuRoot>

        <div class="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-2 gap-2 mb-2">
            <NavigationMenuRoot
              v-for="item in ['settings', 'feedback']"
              :key="item"
            >
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    :active="currentPill === `/${item}`"
                    as-child
                  >
                    <button
                      v-tippy="{
                        content:
                          item === 'settings' ? 'Settings' : 'Send Feedback',
                      }"
                      :data-path="`/${item}`"
                      :class="[
                        'flex w-full items-center justify-center gap-2 rounded-md p-2 text-sm transition-colors',
                        currentPill === `/${item}`
                          ? 'bg-gray-100 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                      ]"
                      @click="handleFooterItemClick($event, `/${item}`)"
                    >
                      <component
                        :is="item === 'settings'
                          ? Settings2Icon
                          : MessageSquareIcon
                        "
                        class="h-5 w-5"
                      />
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
            Mathlly - Stud.io
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
  PanelLeftIcon,
  Binary,
} from "lucide-vue-next";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
} from "radix-vue";
import { watch, computed, ref, nextTick } from "vue"
import { usePills } from "@/composables/usePills";
import Badge from "@/components/base/BaseBadge.vue";
import Logo from '@/components/base/BaseLogo.vue';
import Button from "@/components/base/BaseButton.vue";
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["update:isOpen"])

defineOptions({
  name: "SidebarMenu",
})

const categories = ref([
  {
    title: "Calculators",
    items: [
      { name: "Calculator", path: "/", icon: Code2Icon, isNew: false },
      { name: "Functions",
        path: "/functions",
        icon: FunctionSquareIcon,
        comingSoon: true,
      },
      { name: "Regex", path: "/regex", icon: RegexIcon, comingSoon: true },
      {
        name: "Graphing",
        path: "/graphing",
        icon: LineChartIcon,
        comingSoon: true,
      },
      {
        name: "Converter",
        path: "/converter",
        icon: ArrowRightLeftIcon,
        comingSoon: true,
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        name: "Base64",
        path: "/tools/base64",
        icon: Binary,
        isNew: true,
        description: "Encode and decode Base64 strings",
      },
    ],
  },
  {
    title: "Information",
    items: [
      { name: "What's New", path: "/info/whats-new", icon: SparklesIcon },
      { name: "About", path: "/info/about", icon: InfoIcon },
    ],
  },
])

const {
  currentPill,
  showIndicator,
  updatePillIndicator,
  indicatorStyle,
  handleNavigation,
} = usePills({
  position: "left",
  updateRoute: true,
  defaultPill: "/",
  hideIndicatorPaths: ["/settings", "/feedback", "/:pathMatch(.*)*"],
  onNavigate: () => {
    if (props.isMobile) {
      closeSidebar();
    }
  },
})

const handleItemClick = (event, item) => {
  if (item.comingSoon) return
  handleNavigation(item.path, event.currentTarget)
}

const handleFooterItemClick = (event, path) => {
  handleNavigation(path, null)
}

const closeSidebar = () => emit("update:isOpen", false)

const sidebarClasses = computed(() => [
  "overflow-y-auto inset-y-0 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-all",
  props.isMobile ? "w-full" : "w-64 border-r",
]);

const menuItemBaseClasses = [
  "w-full flex items-center gap-2.5",
  "px-3 py-1.5",
  "text-sm rounded-md",
  "transition-colors duration-200",
].join(" ")

watch(
  () => props.isOpen,
  (newIsOpen) => {
    if (newIsOpen) {
      nextTick(() => {
        const initialPillElement = document.querySelector(
          `[data-path="${currentPill.value}"]`
        )
        updatePillIndicator(initialPillElement, true)
      })
    } else {
      showIndicator.value = false
    }
  },
  { immediate: false }
)
</script>

<style scoped>
.sidebar-container {
  position: fixed;
  will-change: transform;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
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

/* Smooth category transitions */
.space-y-6>*+* {
  margin-top: 1.5rem;
  position: relative;
}
</style>
