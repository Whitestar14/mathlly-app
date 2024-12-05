<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300"
  >
    <header
      class="bg-white dark:bg-gray-800 p-4 flex items-center border-b border-gray-200 dark:border-gray-700"
    >
      <button
        @click="goBack"
        class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4"
      >
        <ArrowLeftIcon class="h-6 w-6" />
      </button>
      <h1 class="text-2xl font-semibold">Settings</h1>
    </header>

    <main class="flex-grow p-6">
      <div class="max-w-2xl mx-auto">
        <div class="space-y-6">
          <section
            class="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-md"
          >
            <h2 class="text-xl font-semibold mb-4">Display Settings</h2>
            <div class="space-y-4">
              <div>
                <label
                  for="precision"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >Precision</label
                >
                <Select
                  v-model="localSettings.precision"
                  :options="precisionOptions"
                />
              </div>
              <div class="flex items-center justify-between">
                <label
                  for="useFractions"
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Use Fractions</label
                >
                <Switch v-model="localSettings.useFractions" />
              </div>
              <div class="flex items-center justify-between">
                <label
                  for="useThousandsSeparator"
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Use Thousands Separator</label
                >
                <Switch v-model="localSettings.useThousandsSeparator" />
              </div>
            </div>
          </section>

          <section
            class="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-md"
          >
            <h2 class="text-xl font-semibold mb-4">Theme</h2>
            <div class="flex items-center justify-between">
              <!-- Add theme toggle here if needed -->
            </div>
          </section>
        </div>

        <div class="mt-8 flex justify-end space-x-2">
          <button
            @click="goBack"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            @click="saveSettings"
            class="px-6 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 transition-colors duration-300"
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
import { defineEmits, defineProps, ref, watch } from "vue";
import { useRouter } from "vue-router";
import Select from "../Select.vue";
import Switch from "../Switch.vue";

const router = useRouter();

const props = defineProps({
  settings: Object,
});

const emit = defineEmits(["settings-change"]);

const localSettings = ref({
  precision: props.settings.precision,
  useFractions: props.settings.useFractions,
  useThousandsSeparator: props.settings.useThousandsSeparator
});

watch(
  () => props.settings,
  (newSettings) => {
    localSettings.value = {
      precision: newSettings.precision,
      useFractions: newSettings.useFractions,
      useThousandsSeparator: newSettings.useThousandsSeparator
    };
  },
  { deep: true }
);

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

const goBack = () => {
  router.push("/");
};

const saveSettings = () => {
  const settingsToSave = {
    precision: localSettings.value.precision,
    useFractions: localSettings.value.useFractions,
    useThousandsSeparator: localSettings.value.useThousandsSeparator
  };
  emit("settings-change", settingsToSave);
  goBack();
};
</script>