<template>
  <div
    class="flex items-center left-0 top-0 absolute z-10 opacity-30 transition-opacity hover:opacity-100 group"
  >
    <div
      class="flex items-center m-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
    >
      <Button
        variant="ghost"
        size="icon"
        class="rounded-none hover:bg-gray-50 group-hover:bg-opacity-100 md:hidden"
        @click="toggleHistory"
      >
        <HistoryIcon size="20" />
      </Button>
      <div
        class="h-6 bg-gray-300 dark:bg-gray-600 w-px md:hidden group-has-[.rounded-none:hover]:h-8 transition-[height]"
      />
      <Button
        variant="ghost"
        size="icon"
        v-tippy="copyOptions"
        class="rounded-none hover:bg-gray-50 group-hover:bg-opacity-100"
        @click="copyToClipboard"
      >
        <Copy size="20" />
      </Button>
    </div>
  </div>
</template>

<script setup>
import { Copy, HistoryIcon } from "lucide-vue-next";
import Button from "@/components/base/BaseButton.vue";
defineProps({
  copyOptions: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["toggle-history", "copy-to-clipboard"]);

const toggleHistory = () => emit("toggle-history");
const copyToClipboard = () => emit("copy-to-clipboard");
</script>
