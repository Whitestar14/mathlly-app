<template>
  <div class="container mx-auto p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 relative">
          <Indicator :position="indicatorStyle" />                   
          <div
            v-for="tab in tabs"
            :key="tab.value"
            ref="tabElements"
            :data-path="tab.value"
            class="px-4 py-3 text-sm font-medium transition-colors relative cursor-pointer"
            :class="[
              currentTab === tab.value
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300',
            ]"
            @click="handleTabChange(tab.value, $event.target)"
          >
            {{ tab.label }}
          </div>
        </div>

        <div class="p-6 bg-white dark:bg-gray-800">
          <div class="grid gap-6 lg:grid-cols-2">
            <div class="space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Input</label>
                  <BaseButton
                    variant="outline"
                    size="sm"
                    @click="handleProcess"
                  >
                    {{ currentTab === "encode" ? "Encode" : "Decode" }}
                  </BaseButton>
                </div>
                <div class="relative">
                  <textarea 
                    ref="inputArea" 
                    v-model="input" 
                    rows="6"
                    class="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm resize-none placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50"
                    :placeholder="currentTab === 'encode'
                      ? 'Enter text to encode...'
                      : 'Enter Base64 to decode...'
                    "
                    @input="e => input = e.target.value"
                  />
                  <div class="absolute bottom-4 right-2">
                    <BaseButton
                      v-tippy="{ content: 'Paste' }"
                      variant="ghost"
                      size="icon"
                      @click="pasteFromClipboard"
                    >
                      <ClipboardPaste class="h-4 w-4" />
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Output</label>
                  <div class="flex items-center gap-2">
                    <BaseButton
                      v-tippy="{ content: 'Swap' }"
                      variant="ghost"
                      size="icon"
                      @click="handleSwap"
                    >
                      <ArrowDownUp class="h-4 w-4" />
                    </BaseButton>
                    <BaseButton
                      v-tippy="{ content: 'Copy to clipboard' }"
                      variant="ghost"
                      size="icon"
                      @click="handleCopy"
                    >
                      <Copy class="h-4 w-4" />
                    </BaseButton>
                  </div>
                </div>
                <textarea
                  v-model="output"
                  rows="6"
                  readonly
                  class="w-full rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm resize-none dark:border-gray-700 dark:bg-gray-800/50"
                  placeholder="Result will appear here..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useClipboard } from "@vueuse/core";
import { ArrowDownUp, Copy, ClipboardPaste } from "lucide-vue-next";
import { useToast } from "@/composables/useToast";
import { usePills } from "@/composables/usePills";
import { useKeyboard } from "@/composables/useKeyboard";
import BaseButton from "@/components/base/BaseButton.vue";
import Indicator from "@/components/ui/PillIndicator.vue"

defineOptions({ name: "Base64Tool" });

const tabs = ref([
  { label: "Encode", value: "encode" },
  { label: "Decode", value: "decode" },
]);
const tabElements = ref([]);
const input = ref("");
const output = ref("");
const inputArea = ref(null);
const { copy } = useClipboard();
const { toast } = useToast();

const {
  currentPill,
  indicatorStyle,
  handleNavigation
} = usePills({ 
  position: "bottom", 
  updateRoute: false, 
  defaultPill: "encode",
  containerRef: tabElements
});

const currentTab = computed({
  get: () => {
    return currentPill.value;
  },
});

const handleTabChange = (value, tabElement) => {
  handleNavigation(value, tabElement);
};


watch(currentTab, () => {
  output.value = "";
  nextTick(() => {
    inputArea.value?.focus();
  });
});

const handleProcess = () => {
  try {
    if (!input.value.trim()) return;

    output.value =
      currentTab.value === "encode" ? btoa(input.value) : atob(input.value);
  } catch (error) {
    toast({
      type: "error",
      description: `Invalid ${currentTab.value === "encode" ? "text" : "Base64"
        } input`,
    });
  }
};

const handleCopy = async () => {
  if (!output.value) return;
  await copy(output.value);
  toast({
    title: "Copied!",
    description: "Output copied to clipboard",
  });
};

const handleSwap = () => {
  [input.value, output.value] = [output.value, input.value];
};

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText();
    input.value = text;
  } catch (err) {
    toast({
      type: "error",
      description: "Failed to paste from clipboard",
      variant: "destructive",
    });
  }
};

useKeyboard("tools", {
  process: handleProcess,
  swap: handleSwap,
  paste: pasteFromClipboard,
  copy: handleCopy,
});
</script>