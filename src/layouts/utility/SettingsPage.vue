<template>
  <BasePage title="Settings">
    <div class="space-y-8 mx-auto max-w-4xl">
      <!-- Header with search functionality -->
      <div class="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-6">
        <div class="relative w-full sm:w-64">
          <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <input 
            type="text" 
            placeholder="Search settings..." 
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            v-model="searchQuery"
          />
        </div>
      </div>

      <!-- Display Settings Section -->
      <SettingsSection 
        title="Display Settings" 
        icon="MonitorIcon"
        :expanded="expandedSections.display"
        @toggle="toggleSection('display')"
        :visible="isSettingVisible('display')"
      >
        <div class="space-y-6">
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
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Set the number of decimal places to display in calculation results
              </p>
            </div>
            
            <div class="flex items-center justify-between py-2">
              <div>
                <label
                  for="useFractions"
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >Use Fractions</label>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Display results as fractions when possible
                </p>
              </div>
              <Switch v-model="localSettings.useFractions" />
            </div>

            <div class="flex items-center justify-between py-2">
              <div>
                <label
                  for="syntaxHighlighting"
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >Syntax Highlighting</label>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Highlight numbers, operators, and functions with different colors
                </p>
              </div>
              <Switch v-model="localSettings.syntaxHighlighting" />
            </div>

            <div class="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Number Formatting
              </h3>
              <div class="flex items-center justify-between py-2">
                <div>
                  <label
                    for="useThousandsSeparator"
                    class="text-sm text-gray-700 dark:text-gray-300"
                  >Use Thousands Separator</label>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Add commas to separate thousands in large numbers
                  </p>
                </div>
                <Switch v-model="localSettings.useThousandsSeparator" />
              </div>
              
              <div class="flex items-center justify-between py-2">
                <div>
                  <label class="text-sm text-gray-700 dark:text-gray-300">Binary Numbers</label>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Format binary numbers for better readability
                  </p>
                </div>
                <Switch v-model="localSettings.formatBinary" />
              </div>
              
              <div class="flex items-center justify-between py-2">
                <div>
                  <label class="text-sm text-gray-700 dark:text-gray-300">Hexadecimal Numbers</label>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Format hexadecimal numbers for better readability
                  </p>
                </div>
                <Switch v-model="localSettings.formatHexadecimal" />
              </div>
              
              <div class="flex items-center justify-between py-2">
                <div>
                  <label class="text-sm text-gray-700 dark:text-gray-300">Octal Numbers</label>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Format octal numbers for better readability
                  </p>
                </div>
                <Switch v-model="localSettings.formatOctal" />
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>

      <!-- Calculator Mode Section -->
      <SettingsSection 
        title="Calculator Mode" 
        icon="CalculatorIcon"
        :expanded="expandedSections.calculator"
        @toggle="toggleSection('calculator')"
        :visible="isSettingVisible('calculator')"
      >
        <div>
          <label
            for="mode"
            class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
          >Default Mode</label>
          <Select
            v-model="localSettings.mode"
            :options="modeOptions"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Choose which calculator mode to use by default when opening the app
          </p>
        </div>
      </SettingsSection>

      <!-- Startup Preferences Section -->
      <SettingsSection 
        title="Startup Preferences" 
        icon="PowerIcon"
        :expanded="expandedSections.startup"
        @toggle="toggleSection('startup')"
        :visible="isSettingVisible('startup')"
      >
        <div>
          <label
            for="startupNavigation"
            class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
          >When app starts, open:</label>
          <Select
            v-model="localSettings.startupNavigation"
            :options="startupOptions"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Choose which page to show when you first open the app
          </p>
        </div>
      </SettingsSection>

      <!-- Themes & Preferences Section -->
      <SettingsSection 
        title="Themes & Preferences" 
        icon="PaletteIcon"
        :expanded="expandedSections.themes"
        @toggle="toggleSection('themes')"
        :visible="isSettingVisible('themes')"
      >
        <div class="space-y-4">
          <div>
            <label
              for="theme"
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
            >Theme</label>
            <Select
              v-model="localSettings.theme"
              :options="themeOptions"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Choose your preferred color theme or follow system settings
            </p>
          </div>
          
          <div class="flex items-center justify-between py-2">
            <div>
              <label
                for="animationDisabled"
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >Disable Animations</label>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Turn off animations for improved performance or reduced motion
              </p>
            </div>
            <Switch v-model="localSettings.animationDisabled" />
          </div>
        </div>
      </SettingsSection>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-gray-50 dark:bg-gray-900 py-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          @click="goBack"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          @click="saveSettings"
        >
          Save Changes
        </Button>
      </div>
    </div>
  </BasePage>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useSettingsStore } from "@/stores/settings";
import { useToast } from "@/composables/useToast";
import SettingsSection from "@/components/ui/SettingsSection.vue"
import BasePage from "@/components/base/BasePage.vue";
import Select from "@/components/ui/SelectBar.vue";
import Switch from "@/components/ui/ToggleBar.vue";
import Button from "@/components/base/BaseButton.vue";
import { 
  SearchIcon
} from "lucide-vue-next";

const router = useRouter();
const settings = useSettingsStore();
const { toast } = useToast();

// Search functionality
const searchQuery = ref('');

// Expandable sections
const expandedSections = ref({
  display: true,
  calculator: true,
  startup: true,
  themes: true
});

const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section];
};

// Filter settings based on search
const isSettingVisible = (section) => {
  if (!searchQuery.value) return true;
  
  const query = searchQuery.value.toLowerCase();
  
  const sectionKeywords = {
    display: ['display', 'precision', 'fractions', 'thousands', 'separator', 'binary', 'hexadecimal', 'octal', 'format', 'syntax', 'highlighting'],
    calculator: ['calculator', 'mode', 'standard', 'programmer'],
    startup: ['startup', 'navigation', 'home', 'calculator', 'last visited'],
    themes: ['theme', 'light', 'dark', 'system', 'animations', 'disable']
  };
  
  return sectionKeywords[section].some(keyword => keyword.includes(query));
};

const localSettings = ref({
  precision: settings.precision,
  useFractions: settings.useFractions,
  useThousandsSeparator: settings.useThousandsSeparator,
  formatBinary: settings.formatBinary,
  formatHexadecimal: settings.formatHexadecimal,
  formatOctal: settings.formatOctal,
  theme: settings.theme,
  mode: settings.mode,
  animationDisabled: settings.animationDisabled,
  startupNavigation: settings.startupNavigation,
  syntaxHighlighting: settings.syntaxHighlighting,
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

const startupOptions = [
  { value: 'home', label: 'Home' },
  { value: 'calculator', label: 'Calculator Page' },
  { value: 'last-visited', label: 'Last Visited Page' },
];

// Check if settings have changed
const hasChanges = computed(() => {
  return JSON.stringify(localSettings.value) !== JSON.stringify({
    precision: settings.precision,
    useFractions: settings.useFractions,
    useThousandsSeparator: settings.useThousandsSeparator,
    formatBinary: settings.formatBinary,
    formatHexadecimal: settings.formatHexadecimal,
    formatOctal: settings.formatOctal,
    theme: settings.theme,
    mode: settings.mode,
    animationDisabled: settings.animationDisabled,
    startupNavigation: settings.startupNavigation,
    syntaxHighlighting: settings.syntaxHighlighting,
  });
});

onMounted(async () => {
  await settings.loadSettings();

  localSettings.value = {
    precision: settings.precision,
    useFractions: settings.useFractions,
    useThousandsSeparator: settings.useThousandsSeparator,
    formatBinary: settings.formatBinary,
    formatHexadecimal: settings.formatHexadecimal,
    formatOctal: settings.formatOctal,
    theme: settings.theme,
    mode: settings.mode,
    animationDisabled: settings.animationDisabled,
    startupNavigation: settings.startupNavigation || 'home', // Provide default value
    syntaxHighlighting: settings.syntaxHighlighting !== undefined ? settings.syntaxHighlighting : true, // Default to true if not set
  };
});

const goBack = () => {
  if (hasChanges.value) {
    if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
      router.go(-1);
    }
  } else {
    router.go(-1);
  }
};

const saveSettings = async () => {
  try {
    await settings.setDefaultMode(localSettings.value.mode);

    const settingsToSave = { ...localSettings.value };
    await settings.saveSettings(settingsToSave);
    toast({
      title: "Settings saved",
      message: "Your preferences have been updated successfully.",
    });
    
    router.go(-1);
  } catch (error) {
    toast({
      type: "error",
      title: "Error saving settings",
      message: "There was a problem saving your preferences. Please try again.",
    });
    console.error("Error saving settings:", error);
  }
};
</script>

<style scoped>
/* Fade transition for sections */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}
</style>
