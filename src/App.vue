<template>
  <Suspense>
    <template #default>
      <async-app-setup />
    </template>
    <template #fallback>
      <base-loader
        variant="macro"
        message="Initializing Mathlly..."
      />
    </template>
  </Suspense>
</template>

<script setup>
import BaseLoader from "@/components/base/BaseLoader.vue";
import AsyncAppSetup from '@/components/AsyncAppSetup.vue';
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
