<template>
  <header
    class="flex justify-center items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 min-h-14"
  >
    <div class="container mx-auto flex justify-between items-center gap-2">
      <!-- Sidebar Toggle -->
      <div class="flex items-center justify-between">
        <Button
          v-tippy="{ content: isSidebarOpen ? 'Close Sidebar': 'Open Sidebar', placement: 'right' }"
          variant="ghost"
          size="icon"
          @click="$emit('toggle-sidebar')"
        >
          <PanelLeftIcon
            v-if="!isSidebarOpen"
            class="h-5 w-5"
          />
          <PanelLeftCloseIcon
            v-else
            class="h-5 w-5"
          />
        </Button>
      </div>

      <!-- Mode Toggle and Theme Switch -->
      <div class="flex-grow flex justify-center sm:justify-end items-center">
        <div class="w-full sm:w-auto flex justify-end items-center space-x-4">
          <!-- Mode Toggler using SelectBar -->
          <div
            v-if="currentRoute === '/calculator'"
            class="relative w-full min-w-36"
          >
            <Select
              v-model="selectedMode"
              :options="modes.map((mode) => ({ value: mode, label: mode }))"
              label=""
              position="popper"
              placeholder="Select mode"
            />
          </div>

          <div class="flex items-center justify-between gap-2">
            <!-- Keyboard Shortcuts -->
            <Button
              v-if="!isMobile"
              v-tippy="{content: 'Keyboard Shortcuts'}"
              variant="ghost"
              size="icon"
              @click="openShortcutModal"
            >
              <Command class="h-5 w-5" />
              <span class="sr-only">Keyboard Shortcuts</span>
            </Button>

            <Button
              v-tippy="{ content: isMenubarOpen ? 'Close Menu': 'Open Menu', placement: 'left' }"
              variant="ghost"
              size="icon"
              @click="$emit('toggle-menubar')"
            >
              <div
                v-if="!isMobile"
                class="rotate-180"
              >
                <PanelLeftIcon
                  v-if="!isMenubarOpen"
                  class="h-5 w-5"
                />
                <PanelLeftCloseIcon
                  v-else
                  class="h-5 w-5"
                />
              </div>
              <MoreVerticalIcon
                v-else
                class="h-5 w-5"
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
    <ShortcutGuide
      :open="isShortcutModalOpen"
      @update:open="isShortcutModalOpen = $event"
    />
  </header>
</template>

<script setup>
import { computed, watch, ref } from "vue"
import {
  Command,
  PanelLeftIcon,
  PanelLeftCloseIcon,
  MoreVerticalIcon
} from "lucide-vue-next"
import { useRoute } from "vue-router"
import { useSettingsStore } from "@/stores/settings"
import { useKeyboard } from "@/composables/useKeyboard"
import { useTheme } from "@/composables/useTheme"
import ShortcutGuide from "@/components/ui/ShortcutGuide.vue"
import Select from "@/components/ui/SelectBar.vue"
import Button from "@/components/base/BaseButton.vue"

defineProps({
  isMobile: {
    type: Boolean,
    required: true,
  },
  isSidebarOpen: {
    type: Boolean,
    default: false,
  },
  isMenubarOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["update:mode", "toggle-sidebar", "toggle-menubar"])

const settings = useSettingsStore()
const route = useRoute()
const currentRoute = ref(route.path)
const modes = ['Standard', 'Scientific', 'Programmer']
const isShortcutModalOpen = ref(false)

const { toggleTheme } = useTheme()

const selectedMode = computed({
  get: () => settings.activeMode,
  set: (newMode) => {
    // Only update current mode, not default mode
    settings.setCurrentMode(newMode)
    emit("update:mode", newMode)
  },
})

watch(
  () => route.path,
  (newPath) => {
    currentRoute.value = newPath
  },
  { immediate: true }
)

const openShortcutModal = () => {
  isShortcutModalOpen.value = true
}

useKeyboard("global", {
  openShortcutModal: () => openShortcutModal(),
  toggleTheme: () => toggleTheme(),
})
</script>