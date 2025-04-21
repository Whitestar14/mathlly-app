<template>
  <BasePanel
    :is-open="isOpen"
    :is-mobile="isMobile"
    position="side"
    position-side="left"
    :show-toggle="false"
    :show-header="true"
    :show-footer="true"
    :draggable="false"
    storage-key="sidebar"
    @update:isOpen="closeSidebar"
  >
    <!-- Custom header -->
    <template #header-actions>
      <div class="flex justify-between items-center">
        <TextLogo class="absolute left-2" />
      </div>
    </template>

    <!-- Main content -->

    <!-- Navigation content -->
    <div class="flex-1 overflow-y-auto">
      <NavigationMenuRoot>
        <NavigationMenuList class="px-3 py-2 space-y-6">
          <Indicator :position="indicatorStyle" />
          <div
            v-for="category in categories"
            :key="category.title"
            class="space-y-2"
          >
            <h2 class="px-3 text-xs font-medium text-gray-500/90 dark:text-gray-400/90 uppercase tracking-wider">
              {{ category.title }}
            </h2>
            <div class="space-y-0.5">
              <NavigationMenuItem
                v-for="item in category.items"
                ref="sidebarElements"
                :key="item.path"
                class="space-y-0.5"
              >
                <NavigationMenuLink
                  :active="currentPill === item.path"
                  as-child
                >
                  <button
                    :data-path="item.path"
                    :class="[
                      menuItemClasses,
                      currentPill === item.path
                        ? 'bg-gray-100/80 dark:bg-gray-800/80 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'text-gray-700/90 dark:text-gray-400/90 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-gray-300',
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
    </div>

    <!-- Footer -->
    <template #footer>
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
                  <span class="block md:hidden capitalize">{{
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
    </template>
  </BasePanel>
</template>

<script setup>
import {
  HomeIcon,
  Code2Icon,
  InfoIcon,
  MessageSquareIcon,
  Settings2Icon,
  SparklesIcon,
  FunctionSquareIcon,
  RegexIcon,
  LineChartIcon,
  ArrowRightLeftIcon,
  Binary,
} from "lucide-vue-next"
import {
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
} from "radix-vue"
import { ref } from "vue"
import { usePills } from "@/composables/usePills"
import Badge from "@/components/base/BaseBadge.vue"
import TextLogo from '@/components/base/TextLogo.vue'
import BasePanel from "@/components/base/BasePanel.vue"
import Indicator from "@/components/ui/PillIndicator.vue"
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

const sidebarElements = ref([]);

const categories = ref([
  {
    title: "Navigation",
    items: [
      { name: "Home", path: "/", icon: HomeIcon, isNew: false },
    ]
  },
  {
    title: "Calculators",
    items: [
      { name: "Calculator", path: "/calculator", icon: Code2Icon, isNew: false },
      {
        name: "Functions",
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
      { name: "Updates", path: "/info/update", icon: SparklesIcon },
      { name: "About", path: "/info/about", icon: InfoIcon },
    ],
  },
])

const {
  currentPill,
  indicatorStyle,
  handleNavigation,
} = usePills({
  position: "left",
  updateRoute: true,
  containerRef: sidebarElements,
  hideIndicatorPaths: ["/settings", "/feedback", "/error", "/:pathMatch(.*)*"],
  onNavigate: () => {
    if (props.isMobile) {
      closeSidebar()
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

const menuItemClasses = [
  "w-full flex items-center gap-2.5",
  "px-3 py-1.5",
  "text-sm rounded-md",
  "transition-colors duration-200",
].join(" ")
</script>