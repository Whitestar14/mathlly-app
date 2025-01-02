<!-- CalculatorButtons.vue -->
<template>
  <component 
    :is="currentModeComponent" 
    :display-values="displayValues" 
    :active-base="activeBase"
    @button-click="handleButtonClick"
    @clear="handleClear"
    @base-change="handleBaseChange"
  />
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';
import BasicMode from './modes/BasicMode.vue';
import StandardMode from './modes/StandardMode.vue';
import ProgrammerMode from './modes/ProgrammerMode.vue';

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