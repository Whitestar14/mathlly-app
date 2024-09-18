<template>
  <div class="min-h-screen flex bg-background dark:bg-gray-900 transition-colors duration-300">
    <sidebar-menu
      :isOpen="isSidebarOpen"
      :isMobile="isMobile"
      @update:isOpen="updateSidebarOpen"
      @openAbout="navigateToAbout"
      @openSettings="openSettings"
    />
    <div class="flex flex-col flex-grow transition-all duration-300 ease-in-out"
         :class="[!isMobile && isSidebarOpen ? 'ml-64' : '']">
      <calculator-header 
        v-model:mode="mode" 
        @toggle-sidebar="toggleSidebar" 
        :isSidebarOpen="isSidebarOpen"
        :isMobile="isMobile"
      />
      <router-view v-slot="{ Component }">
        <component :is="Component" 
          :mode="mode"
          :settings="settings"
          @settings-change="updateSettings"
          :history="history"
          :isMobile="isMobile"
          :isHistoryOpen="isHistoryOpen"
          @update:mode="updateMode"
          @add-to-history="addToHistory"
          @clear-history="clearHistory"
          @select-history-item="selectHistoryItem"
          @delete-history-item="deleteHistoryItem"
          @toggle-history="toggleHistory"
        />
      </router-view>
    </div>
    <history-panel
      v-if="isMobile"
      :isOpen="isHistoryOpen"
      :isMobile="isMobile"
      :history="history"
      :clearHistory="clearHistory"
      :onSelectHistoryItem="selectHistoryItem"
      :deleteHistoryItem="deleteHistoryItem"
      @close="closeHistory"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import CalculatorHeader from './components/CalculatorHeader.vue';
import SidebarMenu from './components/SidebarMenu.vue';
import HistoryPanel from './components/HistoryPanel.vue';

const router = useRouter();

const mode = ref('Standard');
const settings = ref({
  precision: 4,
  useFractions: false,
  useThousandsSeparator: true,
});

const isSidebarOpen = ref(false);
const isHistoryOpen = ref(false);
const history = ref([]);
const isMobile = ref(window.innerWidth < 768);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const updateSidebarOpen = (value) => {
  isSidebarOpen.value = value;
};

const openSettings = () => {
    router.push('/settings');
};

const navigateToAbout = () => {
  router.push('/about');
};

const updateSettings = (newSettings) => {
  settings.value = { ...newSettings };
};

const updateMode = (newMode) => {
  mode.value = newMode;
};

const toggleHistory = () => {
  isHistoryOpen.value = !isHistoryOpen.value;
};

const closeHistory = () => {
  isHistoryOpen.value = false;
};

const clearHistory = () => {
  history.value = [];
};

const selectHistoryItem = (item) => {
  if (isMobile.value) {
    closeHistory();
  }
};

const deleteHistoryItem = (index) => {
  history.value.splice(index, 1);
};

const addToHistory = (expression, result) => {
  history.value.unshift({ id: Date.now(), expression, result });
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  handleResize();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    isSidebarOpen.value = true;
  } else {
    isSidebarOpen.value = false;
  }
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}
</style>