import { defineStore } from "pinia";
import { ref } from "vue";

export const useDisplayStore = defineStore("display", () => {
  // Core state
  const settings = ref({});
  const isLoading = ref(true);
  const modes = ref(['Standard', 'Programmer']);

  // Actions
  const setSettings = (newSettings) => {
    settings.value = { ...settings.value, ...newSettings };
  };

  const updateState = (newState) => {
    if (newState.isLoading !== undefined) isLoading.value = newState.isLoading;
  };

  return {
    // State
    settings,
    isLoading,
    modes,
    // Actions
    setSettings,
    updateState,
  };
});