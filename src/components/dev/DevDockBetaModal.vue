<template>
  <BaseModal
    :open="isOpen"
    size="lg"
    title="Developer Tools Beta"
    :close-on-click-outside="false"
    :close-on-escape="false"
    @update:open="handleModalClose"
  >
    <template #title>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <CodeIcon class="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Developer Tools Beta
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Experimental development features
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Beta Warning -->
      <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <AlertTriangleIcon class="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 class="text-sm font-medium text-amber-800 dark:text-amber-200">
              Beta Feature Warning
            </h4>
            <p class="text-sm text-amber-700 dark:text-amber-300 mt-1">
              This is an experimental feature that may be unstable, contain bugs, or change significantly in future updates.
            </p>
          </div>
        </div>
      </div>

      <!-- What is DevDock -->
      <div>
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          What is DevDock?
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
          DevDock is a comprehensive developer toolkit that provides real-time debugging, performance monitoring, 
          and development utilities directly within your application. It's designed to help developers and testers 
          identify issues and optimize performance.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <ActivityIcon class="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span class="text-sm font-medium text-gray-900 dark:text-white">Performance Monitor</span>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              Real-time performance metrics and memory usage tracking
            </p>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <TerminalIcon class="h-4 w-4 text-green-600 dark:text-green-400" />
              <span class="text-sm font-medium text-gray-900 dark:text-white">Console Logger</span>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              Capture and view console logs, errors, and debug messages
            </p>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <DatabaseIcon class="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span class="text-sm font-medium text-gray-900 dark:text-white">State Inspector</span>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              Inspect application state, localStorage, and session data
            </p>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <RefreshCwIcon class="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span class="text-sm font-medium text-gray-900 dark:text-white">PWA Testing</span>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              Test PWA features, service workers, and offline functionality
            </p>
          </div>
        </div>
      </div>

      <!-- How it works -->
      <div>
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-3">
          How it works
        </h4>
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-xs font-medium text-indigo-600 dark:text-indigo-400">1</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              <strong>Floating Dock:</strong> A small dock appears at the bottom of your screen with developer tools
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-xs font-medium text-indigo-600 dark:text-indigo-400">2</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              <strong>Draggable Panels:</strong> Open tools appear as draggable panels that you can position anywhere
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-xs font-medium text-indigo-600 dark:text-indigo-400">3</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              <strong>Keyboard Shortcuts:</strong> Use Ctrl+Shift+[Key] for quick access to tools
            </p>
          </div>
        </div>
      </div>

      <!-- Feedback Section -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <MessageSquareIcon class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200">
              Your Feedback Matters
            </h4>
            <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
              As a beta feature, your feedback is crucial for improving DevDock. Please report any bugs, 
              performance issues, or suggestions for new features.
            </p>
          </div>
        </div>
      </div>

      <!-- Opt-in Checkbox -->
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            v-model="hasReadAndUnderstood"
            type="checkbox"
            class="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
          >
          <div class="text-sm">
            <span class="font-medium text-gray-900 dark:text-white">
              I understand this is a beta feature
            </span>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              I acknowledge that this feature is experimental and may be unstable. I agree to provide 
              feedback if I encounter any issues.
            </p>
          </div>
        </label>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center gap-1 justify-between">
        <BaseButton
          variant="ghost"
          class="text-xs"
          @click="handleDecline"
        >
          Maybe Later
        </BaseButton>
        <div class="flex items-center gap-3">
          <BaseButton
            variant="outline"
            class="text-xs"
            @click="handleDecline"
          >
            No Thanks
          </BaseButton>
          <BaseButton
            :disabled="!hasReadAndUnderstood"
            variant="primary"
            class="text-xs"
            @click="handleOptIn"
          >
            Enable DevDock
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import { 
  CodeIcon, 
  AlertTriangleIcon, 
  ActivityIcon, 
  TerminalIcon, 
  DatabaseIcon, 
  RefreshCwIcon,
  MessageSquareIcon
} from 'lucide-vue-next';

interface Props {
  open: boolean;
}

interface Emits {
  (e: 'update:open', value: boolean): void;
  (e: 'opt-in'): void;
  (e: 'decline'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const hasReadAndUnderstood = ref(false);

const isOpen = computed(() => props.open);

const handleModalClose = (value: boolean) => {
  if (!value) {
    handleDecline();
  }
};

const handleOptIn = () => {
  if (hasReadAndUnderstood.value) {
    emit('opt-in');
    emit('update:open', false);
  }
};

const handleDecline = () => {
  emit('decline');
  emit('update:open', false);
  hasReadAndUnderstood.value = false;
};
</script>
