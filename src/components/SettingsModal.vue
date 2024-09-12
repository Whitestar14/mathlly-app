<template>
  <DialogRoot :open="isOpen" @update:open="updateOpen">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-black/50" />
      <DialogContent class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full">
        <DialogTitle class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</DialogTitle>
        <div class="space-y-4">
          <div>
            <label for="precision" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precision</label>
            <Select v-model="localSettings.precision" :options="precisionOptions" />
          </div>
          <div class="flex items-center justify-between">
            <label for="useFractions" class="text-sm font-medium text-gray-700 dark:text-gray-300">Use Fractions</label>
            <Switch v-model="localSettings.useFractions" />
          </div>
          <div class="flex items-center justify-between">
            <label for="useThousandsSeparator" class="text-sm font-medium text-gray-700 dark:text-gray-300">Use Thousands Separator</label>
            <Switch v-model="localSettings.useThousandsSeparator" />
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-2">
          <button @click="closeModal" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button @click="saveSettings" class="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700">
            Save Changes
          </button>
        </div>
        <DialogClose class="absolute top-3 right-3 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
          <XIcon class="h-6 w-6" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup>
import { ref, watch } from 'vue';
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from 'radix-vue';
import { XIcon } from 'lucide-vue-next';
import Select from './Select.vue';
import Switch from './Switch.vue';

const props = defineProps({
  isOpen: Boolean,
  settings: Object,
});

const emit = defineEmits(['update:isOpen', 'settingsChange']);

const localSettings = ref({ ...props.settings });

const precisionOptions = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' },
];

watch(() => props.settings, (newSettings) => {
  localSettings.value = { ...newSettings };
});

const updateOpen = (open) => {
  emit('update:isOpen', open);
};

const closeModal = () => {
  emit('update:isOpen', false);
};

const saveSettings = () => {
  emit('settingsChange', localSettings.value);
  closeModal();
};
</script>