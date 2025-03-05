<template>
  <div v-if="isMobile">
    <PopoverRoot>
      <PopoverTrigger>
        <Button
          variant="ghost"
          size="icon"
        >
          <MoreVertical class="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          class="p-1 z-50 min-w-[150px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
          :side-offset="4"
          align="end"
        >
          <button
            class="rounded-t-md flex w-full items-center px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
            @click="$emit('toggle-theme')"
          >
            <Sun
              v-if="isDark"
              class="h-4 w-4 mr-2 text-gray-500"
            />
            <Moon
              v-else
              class="h-4 w-4 mr-2 text-gray-500"
            />
            <span>{{ isDark ? "Light Mode" : "Dark Mode" }}</span>
          </button>

          <a
            href="https://github.com/Whitestar14/mathlly-app"
            target="_blank"
            class="rounded-b-md flex w-full items-center px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
          >
            <GithubIcon class="h-4 w-4 mr-2 text-gray-500" />
            <span>Star on GitHub</span>
          </a>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  </div>

  <div v-else>
    <div class="flex items-center space-x-2">
      <a
        href="https://github.com/Whitestar14/mathlly-app"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Github Page Link"
      >
        <Button
          v-tippy="{ content: 'Star on GitHub', placement: 'bottom' }"
          variant="ghost"
          size="icon"
        >
          <GithubIcon class="h-5 w-5" />
          <span class="sr-only">Star on GitHub</span>
        </Button>
      </a>

      <Button
        v-tippy="{ content: 'Keyboard Shortcuts (⌘K)', placement: 'bottom' }"
        variant="ghost"
        size="icon"
        @click="$emit('open-shortcut-modal')"
      >
        <Command class="h-5 w-5" />
        <span class="sr-only">Keyboard Shortcuts</span>
      </Button>

      <Separator
        orientation="vertical"
        class="h-6 w-px bg-gray-200 dark:bg-gray-700"
      />
      <DropdownMenuRoot>
        <DropdownMenuTrigger as-child>
          <Button
            v-tippy="{ content: 'Change Theme', placement: 'bottom' }"
            variant="ghost"
            size="icon"
          >
            <Sun
              class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            />
            <Moon
              class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
            <span class="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            :side-offset="4"
            class="p-1 z-50 min-w-[150px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg border border-gray-200/50 dark:border-gray-700/50 cursor-pointer shadow-lg"
            align="end"
          >
            <DropdownMenuItem
              class="rounded-t-md flex w-full items-center px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
              @click="setTheme('light')"
            >
              <Sun class="h-4 w-4 mr-2 text-gray-500" /><span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              class="flex w-full items-center px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
              @click="setTheme('dark')"
            >
              <Moon class="h-4 w-4 mr-2 text-gray-500" /><span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              class="rounded-b-md flex w-full items-center px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
              @click="setTheme('system')"
            >
              <AppWindowMac class="h-4 w-4 mr-2 text-gray-500" /><span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </div>
  </div>
</template>

<script setup>
import {
  Sun,
  Moon,
  MoreVertical,
  GithubIcon,
  Command,
  AppWindowMac,
} from "lucide-vue-next";
import {
  PopoverRoot,
  PopoverPortal,
  PopoverContent,
  PopoverTrigger,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuContent,
  Separator,
} from "radix-vue";
import { useTheme } from "@/composables/useTheme";
import Button from "@/components/base/BaseButton.vue";
defineProps({
  isDark: {
    type: Boolean,
  },
  isMobile: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["toggle-theme", "open-shortcut-modal"]);


const { setTheme } = useTheme();
</script>
