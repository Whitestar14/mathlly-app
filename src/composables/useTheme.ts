import { computed, watch, onMounted, type ComputedRef } from 'vue';
import { useDark, usePreferredDark, type RemovableRef } from '@vueuse/core';
import { useSettingsStore } from '@/stores/settings';

/**
 * Theme options available in the application
 */
const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const;

// Create a type from the theme options
export type ThemeOption = typeof THEME_OPTIONS[keyof typeof THEME_OPTIONS];

/**
 * Settings store interface for theme management
 */
interface SettingsStore {
  appearance: {
    theme: ThemeOption;
  };
  updateSetting: (key: string, value: ThemeOption) => Promise<void>;
}

/**
 * Theme composable return type
 */
export interface UseThemeReturn {
  isDark: RemovableRef<boolean>;
  selectedTheme: ComputedRef<ThemeOption>;
  isSystemTheme: ComputedRef<boolean>;
  toggleTheme: () => Promise<void>;
  setTheme: (newTheme: ThemeOption) => Promise<void>;
  themeOptions: typeof THEME_OPTIONS;
}

/**
 * Composable for managing application theme with system preference detection
 * 
 * @returns {UseThemeReturn} Theme management API
 */
export function useTheme(): UseThemeReturn {
  // Get settings store for persistence
  const settings = useSettingsStore() as SettingsStore;
  
  // Use VueUse's dark mode composable
  const isDark = useDark();
  
  // Detect system preference
  const prefersDark = usePreferredDark();

  /**
   * Current theme with getter/setter for two-way binding
   */
  const selectedTheme: ComputedRef<ThemeOption> = computed({
    get: (): ThemeOption => settings.appearance.theme,
    set: async (newTheme: ThemeOption): Promise<void> => {
      await settings.updateSetting('appearance.theme', newTheme);
    },
  });

  /**
   * Whether the current theme is system-based
   */
  const isSystemTheme: ComputedRef<boolean> = computed(() => 
    selectedTheme.value === THEME_OPTIONS.SYSTEM
  );

  /**
   * Apply theme changes when settings change
   */
  watch(selectedTheme, (newTheme: ThemeOption) => {
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
  watch(prefersDark, (newPrefersDark: boolean) => {
    if (selectedTheme.value === THEME_OPTIONS.SYSTEM) {
      isDark.value = newPrefersDark;
    }
  });

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = async (): Promise<void> => {
    const newTheme: ThemeOption = isDark.value ? THEME_OPTIONS.LIGHT : THEME_OPTIONS.DARK;
    await settings.updateSetting('appearance.theme', newTheme);
  };

  /**
   * Set a specific theme
   */
  const setTheme = async (newTheme: ThemeOption): Promise<void> => {
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
