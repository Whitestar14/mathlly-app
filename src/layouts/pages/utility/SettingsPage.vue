<template>
  <BasePage title="Settings">
    <div class="max-w-2xl mx-auto space-y-8">
      <section class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium tracking-tight">
            Display Settings
          </h2>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div class="space-y-4">
            <div>
              <label for="precision"
                class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Precision</label>
              <Select v-model="localSettings.precision" :options="precisionOptions" />
            </div>
            <div class="flex items-center justify-between py-2">
              <label for="useFractions" class="text-sm font-medium text-gray-700 dark:text-gray-300">Use
                Fractions</label>
              <Switch v-model="localSettings.useFractions" />
            </div>

            <div class="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Number Formatting
              </h3>
              <div class="flex items-center justify-between py-2">
                <label for="useThousandsSeparator" class="text-sm text-gray-600 dark:text-gray-400">Use Thousands
                  Separator</label>
                <Switch v-model="localSettings.useThousandsSeparator" />
              </div>
              <div class="flex items-center justify-between py-2">
                <label class="text-sm text-gray-600 dark:text-gray-400">Binary Numbers</label>
                <Switch v-model="localSettings.formatBinary" />
              </div>
              <div class="flex items-center justify-between py-2">
                <label class="text-sm text-gray-600 dark:text-gray-400">Hexadecimal Numbers</label>
                <Switch v-model="localSettings.formatHexadecimal" />
              </div>
              <div class="flex items-center justify-between py-2">
                <label class="text-sm text-gray-600 dark:text-gray-400">Octal Numbers</label>
                <Switch v-model="localSettings.formatOctal" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium tracking-tight">
            Calculator Mode
          </h2>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div>
            <label for="mode" class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Default
              Mode</label>
            <Select v-model="localSettings.mode" :options="modeOptions" />
          </div>
        </div>
      </section>

      <section class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium tracking-tight">
            Themes & Preferences
          </h2>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div>
            <label for="theme" class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Theme</label>
            <Select v-model="localSettings.theme" :options="themeOptions" />
          </div>
          <div class="flex items-center justify-between py-2">
            <label for="borderless" class="text-sm font-medium text-gray-700 dark:text-gray-300">Disable
              Animations</label>
            <Switch v-model="localSettings.animationDisabled" />
          </div>
        </div>
      </section>

      <div class="flex justify-end space-x-4 pt-4">
        <Button variant="ghost" class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          @click="goBack">
          Cancel
        </Button>
        <Button variant="primary" @click="saveSettings">
          Save Changes
        </Button>
      </div>
    </div>
  </BasePage>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSettingsStore } from "@/stores/settings";
import BasePage from "@/components/base/BasePage.vue";
import Select from "@/components/ui/SelectBar.vue";
import Switch from "@/components/ui/ToggleBar.vue";
import Button from "@/components/base/BaseButton.vue";

const router = useRouter();

const settingsStore = useSettingsStore();

const localSettings = ref({
  precision: settingsStore.precision,
  useFractions: settingsStore.useFractions,
  useThousandsSeparator: settingsStore.useThousandsSeparator,
  formatBinary: settingsStore.formatBinary,
  formatHexadecimal: settingsStore.formatHexadecimal,
  formatOctal: settingsStore.formatOctal,
  theme: settingsStore.theme,
  mode: settingsStore.mode,
  animationDisabled: settingsStore.animationDisabled,
});

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
  { value: "Standard", label: "Standard" },
  { value: "Programmer", label: "Programmer" },
];

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

onMounted(async () => {
  await settingsStore.loadSettings();

  localSettings.value = {
    precision: settingsStore.precision,
    useFractions: settingsStore.useFractions,
    useThousandsSeparator: settingsStore.useThousandsSeparator,
    formatBinary: settingsStore.formatBinary,
    formatHexadecimal: settingsStore.formatHexadecimal,
    formatOctal: settingsStore.formatOctal,
    theme: settingsStore.theme,
    mode: settingsStore.mode,
    animationDisabled: settingsStore.animationDisabled,
  };
});

const goBack = () => {
  router.go(-1);
};

const saveSettings = async () => {
  await settingsStore.setDefaultMode(localSettings.value.mode);

  const settingsToSave = { ...localSettings.value };
  // delete settingsToSave.mode;
  await settingsStore.saveSettings(settingsToSave);
  goBack();
};
</script>
