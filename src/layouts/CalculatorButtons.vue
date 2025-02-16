<!-- CalculatorButtons.vue -->
<template>
  <Suspense>
    <!-- Main Content -->
    <template #default>
      <component 
        :is="currentModeComponent" 
        :display-values="displayValues" 
        :active-base="activeBase"
        :input-length="inputLength"
        :max-length="maxLength"
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
        />
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
    validator: (value) => ['Standard', 'Programmer'].includes(value)
  },
  displayValues: {
    type: Object,
    required: true
  },
  activeBase: {
    type: String,
    required: true
  },
  inputLength: {
    type: Number,
    required: true
  },
  maxLength: {
    type: Number,
    default: 50
  }
});

const emit = defineEmits(['button-click', 'clear', 'base-change']);

// Lazy load components with loading delay to prevent flash
const StandardMode = defineAsyncComponent(() => import('@/layouts/modes/StandardMode.vue'));
const ProgrammerMode = defineAsyncComponent(() => import('@/layouts/modes/ProgrammerMode.vue'));

const currentModeComponent = computed(() => {
  switch (props.mode) {
    case 'Standard':
      return StandardMode;
    case 'Programmer':
      return ProgrammerMode;
    default:
      return StandardMode;
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