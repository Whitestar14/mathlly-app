<!-- CalculatorButtons.vue -->
<template>
  <Suspense>
    <!-- Main Content -->
    <template #default>
      <component 
        :is="currentModeComponent" 
        :display-values="displayValues" 
        :active-base="activeBase"
        @button-click="handleButtonClick"
        @clear="handleClear"
        @base-change="handleBaseChange"
      />
    </template>
    <!-- Loading State -->
    <template #fallback>
      <div class="grid grid-cols-4 gap-2">
          <div 
            v-for="n in 20" 
            :key="n" 
            class="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg"
          ></div>
        </div>
    </template>
  </Suspense>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => ['Basic', 'Standard', 'Programmer'].includes(value)
  },
  displayValues: {
    type: Object,
    required: true
  },
  activeBase: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['button-click', 'clear', 'base-change']);

// Lazy load components with loading delay to prevent flash
const BasicMode = defineAsyncComponent(() => import('@/layouts/modes/BasicMode.vue'));
const StandardMode = defineAsyncComponent(() => import('@/layouts/modes/StandardMode.vue'));
const ProgrammerMode = defineAsyncComponent(() => import('@/layouts/modes/ProgrammerMode.vue'));

const currentModeComponent = computed(() => {
  switch (props.mode) {
    case 'Basic':
      return BasicMode;
    case 'Standard':
      return StandardMode;
    case 'Programmer':
      return ProgrammerMode;
    default:
      return BasicMode;
  }
});

const handleButtonClick = (value) => {
  emit('button-click', value);
};

const handleClear = () => {
  emit('clear');
};

const handleBaseChange = (base) => {
  emit('base-change', base);
};
</script>