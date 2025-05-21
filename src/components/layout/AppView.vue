<template>
  <router-view v-slot="{ Component, route }">
    <Transition name="fade" mode="out-in">
        <component 
          :is="Component"
          v-bind="isCalculatorRoute(route.path) ? calculatorProps : {}" 
        />
    </Transition>
  </router-view>
</template>

<script setup>
import { computed } from 'vue'
import { RouterView } from 'vue-router'

const props = defineProps({
  mode: {
    type: String,
    required: true,
  },
  settings: {
    type: Object,
    required: true,
  },
  isMobile: {
    type: Boolean,
    required: true,
  }
})

const calculatorProps = computed(() => ({
  mode: props.mode,
  settings: props.settings,
  isMobile: props.isMobile
}))

const isCalculatorRoute = (path) => path.includes('/calculator')
</script>
