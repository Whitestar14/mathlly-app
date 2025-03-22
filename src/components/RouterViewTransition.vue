<template>
  <router-view v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component 
        :is="Component" 
        :mode="mode" 
        :settings="settings" 
        :is-mobile="isMobile"
        @settings-change="$emit('settings-change', $event)" 
        @update:mode="$emit('update:mode', $event)" 
      />
    </Transition>
  </router-view>
</template>

<script setup>
defineProps({
  mode: {
    type: String,
    required: true
  },
  settings: {
    type: Object,
    required: true
  },
  isMobile: {
    type: Boolean,
    required: true
  }
})

defineEmits(['settings-change', 'update:mode'])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
