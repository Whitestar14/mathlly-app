<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <header class="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto flex items-center h-16 px-4">
        <button
          class="mr-4 h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          @click="goBack"
        >
          <ArrowLeftIcon class="h-6 w-6" />
        </button>
        <h1 class="text-xl font-semibold">
          Settings
        </h1>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8 md:py-12">
      <div class="max-w-2xl mx-auto space-y-8">
        <section class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold tracking-tight">
              Display Settings
            </h2>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div class="space-y-4">
              <div>
                <label
                  for="precision"
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
                >Precision</label>
                <Select
                  v-model="localSettings.precision"
                  :options="precisionOptions"
                />
              </div>
              <div class="flex items-center justify-between py-2">
                <label
                  for="useFractions"
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >Use Fractions</label>
                <Switch v-model="localSettings.useFractions" />
              </div>
              <div class="flex items-center justify-between py-2">
                <label
                  for="useThousandsSeparator"
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >Use Thousands Separator</label>
                <Switch v-model="localSettings.useThousandsSeparator" />
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold tracking-tight">
              Calculator Mode
            </h2>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div>
              <label
                for="mode"
                class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
              >Default Mode</label>
              <Select
                v-model="localSettings.mode"
                :options="modeOptions"
              />
            </div>
          </div>
        </section>

        <section class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold tracking-tight">
              Theme
            </h2>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div>
              <label
                for="theme"
                class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
              >Theme Preference</label>
              <Select
                v-model="localSettings.theme"
                :options="themeOptions"
              />
            </div>
            <div class="flex items-center justify-between py-2">
              <label
                for="borderless"
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >Borderless Mode</label>
              <Switch v-model="localSettings.borderless" />
            </div>
          </div>
        </section>


        <div class="flex justify-end space-x-4 pt-4">
          <button
            class="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            @click="goBack"
          >
            Cancel
          </button>
          <button
            class="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            @click="saveSettings"
          >
            Save Changes
          </button>
        </div>
      </div>
    </main>
  </div>
</template>


<script setup>
import { ArrowLeftIcon } from "lucide-vue-next";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSettingsStore } from '@/stores/settings';
import Select from "@/components/SelectBar.vue";
import Switch from "@/components/ToggleBar.vue";

const router = useRouter();
const settingsStore = useSettingsStore();

// Initialize local settings from store
const localSettings = ref({
  precision: settingsStore.precision,
  useFractions: settingsStore.useFractions,
  useThousandsSeparator: settingsStore.useThousandsSeparator,
  theme: settingsStore.theme,
  mode: settingsStore.mode,
  borderless: settingsStore.borderless
});

// Options for select inputs
const precisionOptions = [
  { value: 0, label: "0" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },
  { value: 10, label: "10" },
];

const modeOptions = [
  { value: 'Basic', label: 'Basic' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Programmer', label: 'Programmer' }
];

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' }
];

onMounted(async () => {
  await settingsStore.loadSettings();
  // Update local settings after loading from store
  localSettings.value = {
    precision: settingsStore.precision,
    useFractions: settingsStore.useFractions,
    useThousandsSeparator: settingsStore.useThousandsSeparator,
    theme: settingsStore.theme,
    mode: settingsStore.mode,
    borderless: settingsStore.borderless
  };
});

const goBack = () => {
  router.go(-1);
};

const saveSettings = async () => {
  await settingsStore.saveSettings(localSettings.value);
  goBack();
};
</script>