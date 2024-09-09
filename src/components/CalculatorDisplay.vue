<template>
  <div class="text-right text-6xl mb-4 h-24 flex items-end justify-end">
    {{ display }}
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps(['display'])
</script>
