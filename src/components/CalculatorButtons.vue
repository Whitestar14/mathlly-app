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
      <div class="flex items-center justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-t-indigo-500" />
      </div>
    </template>
  </Suspense>
</template>

<script setup>
import { computed, defineProps, defineEmits, defineAsyncComponent } from 'vue';

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
const BasicMode = defineAsyncComponent(() => import('./modes/BasicMode.vue'));
const StandardMode = defineAsyncComponent(() => import('./modes/StandardMode.vue'));
const ProgrammerMode = defineAsyncComponent(() => import('./modes/ProgrammerMode.vue'));

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