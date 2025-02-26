<template>
  <div class="container mx-auto p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Increased max width -->
      <!-- Header -->
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Base64 Encoder/Decoder
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Convert text to Base64 and vice versa
        </p>
      </div>

      <!-- Main Content -->
      <div class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Tabs Navigation -->
        <div class="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="px-4 py-3 text-sm font-medium transition-colors relative"
            :class="[
              activeTab === tab.value 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            ]"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
            <div
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-transform"
              :class="activeTab === tab.value ? 'scale-x-100' : 'scale-x-0'"
            />
          </button>
        </div>

        <!-- Content Area -->
        <div class="p-6 bg-white dark:bg-gray-800">
          <!-- Increased padding -->
          <div class="grid gap-6 lg:grid-cols-2">
            <!-- Desktop two-column layout -->
            <!-- Input Section -->
            <div class="space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Input</label>
                  <BaseButton
                    variant="outline"
                    size="sm"
                    @click="handleProcess"
                  >
                    {{ activeTab === 'encode' ? 'Encode' : 'Decode' }}
                  </BaseButton>
                </div>
                <div class="relative">
                  <textarea
                    ref="inputArea"
                    v-model="input"
                    rows="6"
                    class="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm resize-none placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50"
                    :placeholder="activeTab === 'encode' 
                      ? 'Enter text to encode...' 
                      : 'Enter Base64 to decode...'"
                    @keydown.ctrl.enter="handleProcess"
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

            <!-- Output Section -->
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
import { ref, onMounted, watch, nextTick } from 'vue';
import { ArrowDownUp, Copy, ClipboardPaste } from 'lucide-vue-next';
import { useToast } from '@/composables/useToast';
import { useClipboard } from "@vueuse/core"
import BaseButton from '@/components/base/BaseButton.vue';

defineOptions({ name: 'Base64Tool' });

const tabs = [
  { label: 'Encode', value: 'encode' },
  { label: 'Decode', value: 'decode' }
];

const input = ref('');
const output = ref('');
const activeTab = ref('encode');
const { copy } = useClipboard();
const { toast } = useToast();
const inputArea = ref(null);

// Add watch to handle tab changes
watch(activeTab, () => {
  // Clear outputs when switching modes
  output.value = '';
  // Focus input area
  nextTick(() => {
    inputArea.value?.focus();
  });
});

const handleProcess = () => {
  try {
    if (!input.value.trim()) return;
    
    output.value = activeTab.value === 'encode' 
      ? btoa(input.value)
      : atob(input.value);
  } catch (error) {
    toast({
      title: 'Error',
      description: `Invalid ${activeTab.value === 'encode' ? 'text' : 'Base64'} input`,
      variant: 'destructive'
    });
  }
};

const handleCopy = async () => {
  if (!output.value) return;
  await copy(output.value);
  toast({
    title: 'Copied!',
    description: 'Output copied to clipboard'
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
      title: 'Error',
      description: 'Failed to paste from clipboard',
      variant: 'destructive'
    });
  }
};


onMounted(() => {
  const handleKeyboard = (e) => {
    if (e.ctrlKey) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          handleProcess();
          break;
        case 's':
          e.preventDefault();
          handleSwap();
          break;
      }
    }
  };

  window.addEventListener('keydown', handleKeyboard);
  return () => window.removeEventListener('keydown', handleKeyboard);
});
</script>

<style scoped>
/* Smooth transitions */
.scale-x-100 {
  transform: scaleX(1);
  transition: transform 0.2s ease;
}

.scale-x-0 {
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

/* Better textarea appearance */
textarea {
  @apply outline-none text-gray-800 dark:text-gray-100 transition-[border-color] duration-200 ease-linear;
}

/* Add transition for content switching */
.grid {
  transition: opacity 0.15s ease;
}

textarea:focus {
  @apply ring-1 ring-indigo-500/20 border-indigo-500/50;
}
</style>
