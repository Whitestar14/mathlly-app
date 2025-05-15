<template>
  <router-view v-slot="{ Component, route }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" v-bind="shouldPassComponent(route.path) ? {
        mode,
        settings,
        isMobile
      } : {}" />
    </Transition>
  </router-view>
</template>

<script setup>
import { RouterView } from 'vue-router'

defineProps({
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

await new Promise(resolve => setTimeout(resolve, 1200))

/**
 * Determines if props and event listeners should be passed to the current route component
 * @param {string} path - Current route path
 * @returns {boolean} - True if props should be passed, false otherwise
 */
const shouldPassComponent = (path) => {
  return path.includes('/calculator')
}
</script>