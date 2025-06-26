<template>
  <div 
    :class="[
      'my-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent',
      'dark:via-gray-700',
      className
    ]"
  />
</template>

<script setup>
defineProps({
  className: {
    type: String,
    default: ''
  }
});
</script>
