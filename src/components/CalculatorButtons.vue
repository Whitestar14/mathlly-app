<template>
  <component 
    :is="currentModeComponent" 
    @button-click="handleButtonClick" 
    @clear="handleClear"
    @base-change="handleBaseChange"
    :display-value="displayValue"
  />
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import BasicMode from './modes/BasicMode.vue';
import StandardMode from './modes/StandardMode.vue';
import ProgrammerMode from './modes/ProgrammerMode.vue';

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => ['Basic', 'Standard', 'Programmer'].includes(value)
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

const displayValue = ref({
  hex: '0',
  dec: '0',
  oct: '0',
  bin: '0'
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

// You'll need to implement a method to update displayValue
// This method should be called whenever the calculator's value changes
const updateDisplayValue = (value) => {
  displayValue.value = {
    hex: parseInt(value).toString(16).toUpperCase(),
    dec: value.toString(),
    oct: parseInt(value).toString(8),
    bin: parseInt(value).toString(2)
  };
};

// Call this method whenever the calculator's value changes
// For example, you might call it in response to a 'value-change' event from a parent component
</script>