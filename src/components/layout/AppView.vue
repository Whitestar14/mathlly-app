<template>
  <router-view v-slot="{ Component, route }">
    <Transition
      name="fade"
      mode="out-in"
    >
      <component 
        :is="Component"
        v-bind="isCalculatorRoute(route.path) ? calculatorProps : {}"
      />
    </Transition>
  </router-view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';

interface Props {
  mode: string;
  settings: Record<string, any>;
  isMobile: boolean;
}

const props = defineProps<Props>();

interface CalculatorProps {
  mode: string;
  settings: Record<string, any>;
  isMobile: boolean;
}

const calculatorProps = computed((): CalculatorProps => ({
  mode: props.mode,
  settings: props.settings,
  isMobile: props.isMobile
}));

const isCalculatorRoute = (path: string): boolean => 
  path === '/calculator' || path.startsWith('/calculator/');
</script>
