import { computed, watch } from 'vue';
import { useDark } from '@vueuse/core';
import { useSettingsStore } from '@/stores/settings';

export function useTheme() {
  const settings = useSettingsStore();
  const isDark = useDark();

  // Define computed with getter and setter.
  const selectedTheme = computed({
    get: () => settings.theme,
    set: async (newTheme) => {
      await settings.saveSettings({
        ...settings.$state,
        theme: newTheme,
      });
    },
  });

  // Sync theme changes between settings and VueUse dark mode.
  watch(selectedTheme, (newTheme) => {
    if (newTheme === 'dark') {
      isDark.value = true;
    } else if (newTheme === 'light') {
      isDark.value = false;
    } else if (newTheme === 'system') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });

  const toggleTheme = async () => {
    const newTheme = isDark.value ? 'light' : 'dark';
    await settings.saveSettings({
      ...settings.$state,
      theme: newTheme,
    });
  };

  const setTheme = async (newTheme) => {
    await settings.saveSettings({
      ...settings.$state,
      theme: newTheme,
    });
  };

  return {
    isDark,
    selectedTheme,
    toggleTheme,
    setTheme,
  };
}
