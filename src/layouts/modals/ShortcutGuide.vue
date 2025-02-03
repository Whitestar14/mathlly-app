<template>
  <BaseModal
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <template #title>
      <div class="flex items-center">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Keyboard Shortcuts
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quick access to available shortcuts
          </p>
        </div>
      </div>
    </template>

    <TabsRoot
      :default-value="Object.keys(shortcutGroups)[0]"
      class="mt-4"
    >
      <TabsList
        class="inline-flex h-9 bg-gray-100 space-x-2 items-center justify-center rounded dark:bg-gray-800 p-1 text-muted-foreground"
      >
        <TabsTrigger
          v-for="category in Object.keys(shortcutGroups)"
          :key="category"
          :value="category"
          class="inline-flex font-medium text-sm px-3 py-1 items-center justify-center whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary dark:data-[state=active]:text-primary-light rounded data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700 data-[state=active]:shadow-sm"
        >
          {{ category }}
        </TabsTrigger>
      </TabsList>

      <div class="relative overflow-hidden">
        <TabsContent
          v-for="(group, category) in shortcutGroups"
          :key="category"
          :value="category"
          class="mt-4 focus:outline-none tabs-content overflow-y-auto max-h-64"
        >
          <div
            v-for="(shortcut, key) in group"
            :key="key"
            class="flex items-center justify-between p-3 last:border-0 border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900/50"
          >
            <span class="text-sm text-gray-700 dark:text-muted-foreground">
              {{ shortcut.description }}
            </span>

            <div class="flex items-center gap-1.5">
              <template v-if="key.includes('+')">
                <div
                  v-for="(part, index) in key.split('+')"
                  :key="index"
                >
                  <kbd
                    class="px-2 py-1 text-xs font-semibold bg-white dark:bg-gray-800 text-primary dark:text-primary-light rounded border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    {{ part }}
                  </kbd>
                  <span
                    v-if="index < key.split('+').length - 1"
                    class="text-gray-400 dark:text-gray-500"
                  >+</span>
                </div>
              </template>
              <kbd
                v-else
                class="px-2 py-1 text-xs font-semibold bg-white dark:bg-gray-800 text-primary dark:text-primary-light rounded border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                {{ key }}
              </kbd>
            </div>
          </div>
        </TabsContent>
      </div>
    </TabsRoot>
  </BaseModal>
</template>

<script setup>
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "radix-vue";
import BaseModal from "@/components/BaseModal.vue";

defineProps({
  open: Boolean,
});

defineEmits(["update:open"]);

const shortcutGroups = {
  Global: {
    "ctrl+shift+f": { description: "Toggle Fullscreen" },
    "ctrl+l": { description: "Toggle Sidebar" },
    "ctrl+h": { description: "Toggle History" },
    "ctrl+s": { description: "Open Settings" },
  },
  Calculator: {
    escape: { description: "Clear Input" },
    enter: { description: "Calculate Result" },
    backspace: { description: "Delete Last Character" },
  },
  Programmer: {
    "ctrl+1": { description: "Switch to Decimal" },
    "ctrl+2": { description: "Switch to Hexadecimal" },
    "ctrl+3": { description: "Switch to Octal" },
    "ctrl+4": { description: "Switch to Binary" },
  },
};
</script>

<style scoped>
.shortcut-key {
  @apply px-2 py-1 min-w-[1.8rem] text-center rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-mono shadow-sm;
}
</style>
