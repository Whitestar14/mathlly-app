import { computed, watch, onMounted } from 'vue';
import { useDark, usePreferredDark } from '@vueuse/core';
import { useSettingsStore } from '@/stores/settings';

/**
 * Theme options available in the application
 * @type {Object}
 */
const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

/**
 * Composable for managing application theme with system preference detection
 * 
 * @returns {Object} Theme management API
 */
export function useTheme() {
  // Get settings store for persistence
  const settings = useSettingsStore();
  
  // Use VueUse's dark mode composable
  const isDark = useDark();
  
  // Detect system preference
  const prefersDark = usePreferredDark();

  /**
   * Current theme with getter/setter for two-way binding
   * @type {import('vue').ComputedRef<string>}
   */
  const selectedTheme = computed({
    get: () => settings.appearance.theme,
    set: async (newTheme) => {
      await settings.updateSetting('appearance.theme', newTheme);
    },
  });

  /**
   * Whether the current theme is system-based
   * @type {import('vue').ComputedRef<boolean>}
   */
  const isSystemTheme = computed(() => 
    selectedTheme.value === THEME_OPTIONS.SYSTEM
  );

  /**
   * Apply theme changes when settings change
   */
  watch(selectedTheme, (newTheme) => {
    if (newTheme === THEME_OPTIONS.DARK) {
      isDark.value = true;
    } else if (newTheme === THEME_OPTIONS.LIGHT) {
      isDark.value = false;
    } else if (newTheme === THEME_OPTIONS.SYSTEM) {
      isDark.value = prefersDark.value;
    }
  }, { immediate: true });

  /**
   * Update theme when system preference changes (if using system theme)
   */
  watch(prefersDark, (newPrefersDark) => {
    if (selectedTheme.value === THEME_OPTIONS.SYSTEM) {
      isDark.value = newPrefersDark;
    }
  });

  /**
   * Toggle between light and dark themes
   * @async
   */
  const toggleTheme = async () => {
    const newTheme = isDark.value ? THEME_OPTIONS.LIGHT : THEME_OPTIONS.DARK;
    await settings.updateSetting('appearance.theme', newTheme);
  };

  /**
   * Set a specific theme
   * @async
   * @param {string} newTheme - Theme to set ('light', 'dark', or 'system')
   */
  const setTheme = async (newTheme) => {
    if (Object.values(THEME_OPTIONS).includes(newTheme)) {
      await settings.updateSetting('appearance.theme', newTheme);
    } else {
      console.warn(`Invalid theme: ${newTheme}. Valid options are: ${Object.values(THEME_OPTIONS).join(', ')}`);
    }
  };

  // Initialize theme on mount
  onMounted(() => {
    // Apply initial theme
    const theme = selectedTheme.value;
    if (theme === THEME_OPTIONS.SYSTEM) {
      isDark.value = prefersDark.value;
    } else {
      isDark.value = theme === THEME_OPTIONS.DARK;
    }
  });

  return {
    isDark,
    selectedTheme,
    isSystemTheme,
    toggleTheme,
    setTheme,
    themeOptions: THEME_OPTIONS,
  };
}
