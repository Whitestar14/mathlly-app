<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { SearchIcon, CircleHelp } from "lucide-vue-next";
import { useSettingsStore } from "@/stores/settings";
import { filterByQuery } from "@/utils/misc/queryFilter";
import { DEFAULT_SETTINGS } from "@/stores/settings"
import { useToast } from "@/composables/useToast";
import { cloneDeep } from "@/utils/misc/objectUtils";
import BasePage from "@/components/base/BasePage.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import Select from "@/components/ui/SelectBar.vue";
import Switch from "@/components/ui/ToggleBar.vue";
import Button from "@/components/base/BaseButton.vue";
import Collapsible from '@/components/base/BaseCollapsible.vue';

defineOptions({
  name: "SettingsPage"
})

const router = useRouter();
const settingsStore = useSettingsStore();
const { toast } = useToast();
const searchQuery = ref('');
const showUnsavedChangesModal = ref(false);

const settingsManifest = [
  { id: 'display', title: 'Display Settings', icon: 'MonitorIcon', keywords: ['precision', 'decimal places', 'fractions', 'syntax highlighting', 'number formatting', 'thousands separator', 'comma', 'binary', 'hexadecimal', 'octal', 'font', 'appearance'] },
  { id: 'calculator', title: 'Calculator Mode', icon: 'CalculatorIcon', keywords: ['mode', 'standard', 'programmer', 'scientific', 'default calculator'] },
  { id: 'startup', title: 'Startup Preferences', icon: 'PowerIcon', keywords: ['launch', 'open page', 'initial screen', 'home', 'calculator page', 'last visited', 'boot'] },
  { id: 'themes', title: 'Themes & Preferences', icon: 'PaletteIcon', keywords: ['color theme', 'appearance', 'light mode', 'dark mode', 'system theme', 'animations', 'disable transitions', 'visuals'] }
];

const filteredManifest = computed(() =>
  filterByQuery(settingsManifest, searchQuery.value, ['title', 'keywords'])
);

const isRendered = (sectionId) => {
  return filteredManifest.value.some(section => section.id === sectionId);
};

// Single source of truth - get settings directly from the store
const localSettings = ref(cloneDeep(DEFAULT_SETTINGS));

// Create a snapshot of the current store state
const storeSnapshot = computed(() => ({
  display: {
    precision: settingsStore.display.precision,
    useFractions: settingsStore.display.useFractions,
    formatting: {
      useThousandsSeparator: settingsStore.display.formatting.useThousandsSeparator,
      formatBinary: settingsStore.display.formatting.formatBinary,
      formatHexadecimal: settingsStore.display.formatting.formatHexadecimal,
      formatOctal: settingsStore.display.formatting.formatOctal,
    },
    syntaxHighlighting: settingsStore.display.syntaxHighlighting,
  },
  calculator: {
    mode: settingsStore.calculator.mode,
  },
  appearance: {
    theme: settingsStore.appearance.theme,
    animationDisabled: settingsStore.appearance.animationDisabled,
    checkForUpdates: settingsStore.appearance.checkForUpdates,
  },
  startup: {
    navigation: settingsStore.startup.navigation,
  }
}));

const hasChanges = computed(() => {
  return JSON.stringify(localSettings.value) !== JSON.stringify(storeSnapshot.value);
});

const precisionOptions = Array.from({ length: 11 }, (_, i) => ({ value: i, label: i.toString() }));
const modeOptions = [{ value: "Standard", label: "Standard" }, { value: "Programmer", label: "Programmer" }];
const themeOptions = [{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }];
const startupOptions = [{ value: 'home', label: 'Home' }, { value: 'calculator', label: 'Calculator Page' }, { value: 'last-visited', label: 'Last Visited Page' }];

onMounted(async () => {
  await settingsStore.loadSettings();
  
  localSettings.value = cloneDeep(storeSnapshot.value);
});

const goBack = () => {
  if (hasChanges.value) {
    showUnsavedChangesModal.value = true; // Show modal instead of confirm dialog
  } else {
    router.go(-1);
  }
};

const confirmNavigation = () => {
  showUnsavedChangesModal.value = false;
  router.go(-1);
};

const cancelNavigation = () => {
  showUnsavedChangesModal.value = false;
};

const saveSettings = async () => {
  if (!hasChanges.value) {
    toast({ title: "No changes", message: "There are no changes to save.", type: "info" });
    return;
  }
  
  try {
    await settingsStore.saveSettings(localSettings.value);
    
    toast({ 
      type: "success", 
      title: "Settings saved", 
      description: "Your preferences have been updated successfully."
    });
    
    localSettings.value = cloneDeep(storeSnapshot.value);

    router.go(-1);
  } catch (error) {
    toast({ 
      type: "error", 
      title: "Error saving settings", 
      description: "There was a problem saving your preferences." 
    });
    console.error("Error saving settings:", error);
  }
};
</script>

<template>
  <div>
    <BasePage title="Settings">
    <div class="space-y-8 mx-auto max-w-4xl">
      <div class="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-6">
        <div class="relative w-full sm:w-64">
          <BaseInput
              v-model="searchQuery"
              placeholder="Search settings..."
              :icon="SearchIcon"
              aria-label="Search settings"
            />
        </div>
      </div>

      <Collapsible
        v-if="isRendered('display')"
        id="display"
        title="Display Settings" 
        icon="Monitor"
        :defaultOpen="true" 
      >
        <div class="space-y-6">
          <div class="space-y-4">
            <div>
              <label
                for="precision"
                class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
              >Precision</label>
              <Select
                v-model="localSettings.display.precision"
                :options="precisionOptions"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Set the number of decimal places to display in calculation results
              </p>
            </div>
            
            <div class="flex items-center justify-between py-2">
              <div class="max-w-[80%]">
                <label
                  for="useFractions"
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >Use Fractions</label>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Display results as fractions when possible
                </p>
              </div>
              <Switch v-model="localSettings.display.useFractions" />
            </div>

            <div class="flex items-center justify-between py-2">
              <div class="max-w-[80%]">
                <div class="flex items-center gap-2">
                  <label
                    for="syntaxHighlighting"
                    class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Syntax Highlighting</label>
                  <CircleHelp
                    class="h-4 w-4 cursor-help"
                    v-tippy="{ content: 'Experimental feature. Performance may be affected on complex calculations', placement: 'top', onShow() { return true } }"
                  />
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Highlight numbers, operators, and functions with different colors
                </p>
              </div>
              <Switch v-model="localSettings.display.syntaxHighlighting" />
            </div>

            <div class="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Number Formatting
              </h3>
              <div class="flex items-center justify-between py-2">
                <div class="max-w-[80%]">
                  <label
                    for="useThousandsSeparator"
                    class="text-sm text-gray-700 dark:text-gray-300"
                  >Use Thousands Separator</label>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Add commas to separate thousands in large numbers
                  </p>
                </div>
                <Switch v-model="localSettings.display.formatting.useThousandsSeparator" />
              </div>
              
              <div class="flex items-center justify-between py-2">
                <div class="max-w-[80%]">
                  <label class="text-sm text-gray-700 dark:text-gray-300">Binary Numbers</label>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Format binary numbers for better readability
                  </p>
                </div>
                <Switch v-model="localSettings.display.formatting.formatBinary" />
              </div>
              
              <div class="flex items-center justify-between py-2">
                <div class="max-w-[80%]">
                  <label class="text-sm text-gray-700 dark:text-gray-300">Hexadecimal Numbers</label>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Format hexadecimal numbers for better readability
                  </p>
                </div>
                <Switch v-model="localSettings.display.formatting.formatHexadecimal" />
              </div>
              
              <div class="flex items-center justify-between py-2">
                <div class="max-w-[80%]">
                  <label class="text-sm text-gray-700 dark:text-gray-300">Octal Numbers</label>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    Format octal numbers for better readability
                  </p>
                </div>
                <Switch v-model="localSettings.display.formatting.formatOctal" />
              </div>
            </div>
          </div>
        </div>
      </Collapsible>

      <Collapsible
        v-if="isRendered('calculator')"
        id="calculator"
        title="Calculator Mode" 
        icon="Calculator"
        :defaultOpen="true"
      >
        <div>
          <label
            for="mode"
            class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
          >Default Mode</label>
          <Select
            v-model="localSettings.calculator.mode"
            :options="modeOptions"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Choose which calculator mode to use by default when opening the app
          </p>
        </div>
      </Collapsible>

      <Collapsible
        v-if="isRendered('startup')"
        id="startup"
        title="Startup Preferences" 
        icon="Power"
        :defaultOpen="true"
      >
        <div>
          <label
            for="startupNavigation"
            class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
          >When app starts, open:</label>
          <Select
            v-model="localSettings.startup.navigation"
            :options="startupOptions"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Choose which page to show when you first open the app
          </p>
        </div>
      </Collapsible>

      <Collapsible
        v-if="isRendered('themes')"
        id="themes"
        title="Themes & Preferences" 
        icon="Palette"
        :defaultOpen="true"
      >
        <div class="space-y-4">
          <div>
            <label
              for="theme"
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block"
            >Theme</label>
            <Select
              v-model="localSettings.appearance.theme"
              :options="themeOptions"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Choose your preferred color theme or follow system settings
            </p>
          </div>
          
          <div class="flex items-center justify-between py-2">
            <div class="max-w-[80%]">
              <div class="flex items-center gap-2">
                  <label
                    for="animationDisabled"
                    class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Disable Animation</label>
                  <CircleHelp
                    class="h-4 w-4 cursor-help"
                    v-tippy="{ content: 'May experience layout thrashing and flashes during transitions. Backdrops will be disabled.', placement: 'top', onShow() { return true } }"
                  />
                </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Turn off animations for improved performance or reduced motion
              </p>
            </div>
            <Switch v-model="localSettings.appearance.animationDisabled" />
          </div>

          <div class="flex items-center justify-between py-2">
            <div class="max-w-[80%]">
              <div class="flex items-center gap-2">
                <label
                  for="checkForUpdates"
                  class="text-sm font-medium text-gray-700 dark:text-gray-300"
                >Check for Updates</label>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Automatically check for new updates in the background
              </p>
            </div>
            <Switch v-model="localSettings.appearance.checkForUpdates" />
          </div>
        </div>
      </Collapsible>
      
      <div v-if="filteredManifest.length === 0 && searchQuery" class="text-center py-10">
        <p class="text-gray-600 dark:text-gray-400 text-lg">No settings found for "{{ searchQuery }}".</p>
        <p class="text-sm text-gray-500 dark:text-gray-500">Try a different search term.</p>
      </div>

   

      <div class="flex justify-end space-x-4 bg-gray-50 dark:bg-gray-900 py-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="ghost" @click="goBack">Cancel</Button>
        <Button variant="primary" @click="saveSettings" :disabled="!hasChanges">Save Changes</Button>
      </div>
    </div>
  </BasePage> 
  <BaseModal v-model:open="showUnsavedChangesModal">
      <template #title>Unsaved Changes</template>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.
        </p>
      
      <div class="flex justify-end space-x-3">
        <Button variant="outline" @click="cancelNavigation">
          Stay on Page
        </Button>
        <Button variant="destructive" @click="confirmNavigation">
          Discard Changes
        </Button>
      </div>
    </BaseModal>
  </div>
</template>

