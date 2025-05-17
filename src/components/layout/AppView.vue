<template>
  <router-view v-slot="{ Component, route }">
    <Transition name="fade" mode="out-in">
      <!-- KeepAlive causes the title bar to persist only the latest pages -->
       <!-- Make the Select bar animate subtly on enter just as the shadcn component -->
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

await new Promise(resolve => setTimeout(resolve, 800))
</script>
