<template>
  <BaseModal
    :open="show"
    @update:open="handleModalUpdate"
  >
    <template #title>
      Keyboard Shortcuts
    </template>

    <div class="space-y-6">
      <!-- Search -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search shortcuts..."
          class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <SearchIcon class="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      <!-- Shortcuts Grid -->
      <div class="grid gap-6 md:grid-cols-2">
        <div
          v-for="category in filteredCategories"
          :key="category.title"
          class="space-y-3"
        >
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <component
              :is="category.icon"
              class="h-4 w-4 mr-2 text-indigo-500 dark:text-indigo-400"
            />
            {{ category.title }}
          </h3>
          
          <div class="space-y-2">
            <div
              v-for="shortcut in category.shortcuts"
              :key="shortcut.description"
              class="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span class="text-sm text-gray-700 dark:text-gray-300">
                {{ shortcut.description }}
              </span>
              <div class="flex items-center space-x-1">
                <kbd
                  v-for="key in shortcut.keys"
                  :key="key"
                  class="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600"
                >
                  {{ formatKey(key) }}
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No results -->
      <div
        v-if="filteredCategories.length === 0"
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        <SearchIcon class="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No shortcuts found for "{{ searchQuery }}"</p>
      </div>

      <!-- Footer -->
      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
          Press <kbd class="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd> to close this dialog
        </p>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, type Ref, type ComputedRef } from 'vue';
import {
  SearchIcon,
  KeyboardIcon,
  CalculatorIcon,
  NavigationIcon,
  SettingsIcon,
  type LucideIcon
} from 'lucide-vue-next';
import BaseModal from '@/components/base/BaseModal.vue';

/**
 * Keyboard shortcut interface
 */
interface KeyboardShortcut {
  description: string;
  keys: string[];
  category?: string;
}

/**
 * Shortcut category interface
 */
interface ShortcutCategory {
  title: string;
  icon: LucideIcon;
  shortcuts: KeyboardShortcut[];
}

/**
 * Component props interface
 */
interface Props {
  show?: boolean;
}

/**
 * Component emits interface
 */
interface Emits {
  (e: 'close'): void;
  (e: 'update:show', value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  show: false
});

const emit = defineEmits<Emits>();

// Reactive state
const searchQuery: Ref<string> = ref('');

/**
 * Handle modal open/close updates
 */
const handleModalUpdate = (isOpen: boolean): void => {
  emit('update:show', isOpen);
  if (!isOpen) {
    emit('close');
  }
};

/**
 * Keyboard shortcuts data organized by categories
 */
const shortcutCategories: ShortcutCategory[] = [
  {
    title: 'Navigation',
    icon: NavigationIcon,
    shortcuts: [
      { description: 'Open Calculator', keys: ['Ctrl', 'K'] },
      { description: 'Toggle Sidebar', keys: ['Ctrl', 'B'] },
      { description: 'Go to Home', keys: ['Ctrl', 'H'] },
      { description: 'Go to Settings', keys: ['Ctrl', ','] },
      { description: 'Open Shortcuts', keys: ['Ctrl', '/'] },
      { description: 'Toggle Theme', keys: ['Ctrl', 'Shift', 'T'] },
    ]
  },
  {
    title: 'Calculator',
    icon: CalculatorIcon,
    shortcuts: [
      { description: 'Clear All', keys: ['Escape'] },
      { description: 'Clear Entry', keys: ['Delete'] },
      { description: 'Backspace', keys: ['Backspace'] },
      { description: 'Calculate', keys: ['Enter'] },
      { description: 'Toggle Sign', keys: ['F9'] },
      { description: 'Square Root', keys: ['@'] },
      { description: 'Percentage', keys: ['%'] },
      { description: 'Memory Clear', keys: ['Ctrl', 'L'] },
      { description: 'Memory Recall', keys: ['Ctrl', 'R'] },
      { description: 'Memory Store', keys: ['Ctrl', 'M'] },
      { description: 'Memory Add', keys: ['Ctrl', 'P'] },
      { description: 'Memory Subtract', keys: ['Ctrl', 'Q'] },
    ]
  },
  {
    title: 'Calculator Modes',
    icon: SettingsIcon,
    shortcuts: [
      { description: 'Standard Mode', keys: ['Alt', '1'] },
      { description: 'Programmer Mode', keys: ['Alt', '2'] },
      { description: 'Toggle History', keys: ['Ctrl', 'H'] },
      { description: 'Toggle Memory', keys: ['Ctrl', 'M'] },
    ]
  },
  {
    title: 'Programmer Mode',
    icon: KeyboardIcon,
    shortcuts: [
      { description: 'Hexadecimal', keys: ['Alt', 'H'] },
      { description: 'Decimal', keys: ['Alt', 'D'] },
      { description: 'Octal', keys: ['Alt', 'O'] },
      { description: 'Binary', keys: ['Alt', 'B'] },
      { description: 'Bitwise AND', keys: ['&'] },
      { description: 'Bitwise OR', keys: ['|'] },
      { description: 'Bitwise XOR', keys: ['^'] },
      { description: 'Bitwise NOT', keys: ['~'] },
      { description: 'Left Shift', keys: ['<'] },
      { description: 'Right Shift', keys: ['>'] },
    ]
  },
  {
    title: 'General',
    icon: SettingsIcon,
    shortcuts: [
      { description: 'Copy Result', keys: ['Ctrl', 'C'] },
      { description: 'Paste', keys: ['Ctrl', 'V'] },
      { description: 'Select All', keys: ['Ctrl', 'A'] },
      { description: 'Undo', keys: ['Ctrl', 'Z'] },
      { description: 'Redo', keys: ['Ctrl', 'Y'] },
      { description: 'Find', keys: ['Ctrl', 'F'] },
      { description: 'Refresh', keys: ['F5'] },
      { description: 'Full Screen', keys: ['F11'] },
    ]
  }
];

/**
 * Format key display for different operating systems
 */
const formatKey = (key: string): string => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  const keyMap: Record<string, string> = {
    'Ctrl': isMac ? '⌘' : 'Ctrl',
    'Alt': isMac ? '⌥' : 'Alt',
    'Shift': isMac ? '⇧' : 'Shift',
    'Meta': isMac ? '⌘' : 'Win',
    'Enter': '↵',
    'Escape': 'Esc',
    'Backspace': '⌫',
    'Delete': isMac ? '⌦' : 'Del',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Tab': '⇥',
    'Space': '␣',
  };
  
  return keyMap[key] || key;
};

/**
 * Filter categories based on search query
 */
const filteredCategories: ComputedRef<ShortcutCategory[]> = computed(() => {
  if (!searchQuery.value.trim()) {
    return shortcutCategories;
  }
  
  const query = searchQuery.value.toLowerCase();
  
  return shortcutCategories
    .map(category => ({
      ...category,
      shortcuts: category.shortcuts.filter(shortcut =>
        shortcut.description.toLowerCase().includes(query) ||
        shortcut.keys.some(key => key.toLowerCase().includes(query))
      )
    }))
    .filter(category => category.shortcuts.length > 0);
});
</script>
