<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  intensity: {
    type: Number,
    default: 5
  }
})

const isGlitching = ref(false)
const glitchStyle = ref({})

onMounted(() => {
  // Random glitch effect
  const glitchInterval = setInterval(() => {
    if (Math.random() > 0.7) {
      isGlitching.value = true
      
      // Apply random glitch transform
      glitchStyle.value = {
        transform: `translate(${Math.random() * props.intensity - props.intensity/2}px, 0)`,
        opacity: 0.8 + Math.random() * 0.2
      }
      
      setTimeout(() => {
        isGlitching.value = false
        glitchStyle.value = {}
      }, 200)
    }
  }, 2000)

  return () => clearInterval(glitchInterval)
})
</script>

<template>
  <div class="relative inline-block">
    <span class="relative z-10" :style="isGlitching ? glitchStyle : {}">
      <slot></slot>
    </span>
    <span 
      v-if="isGlitching" 
      class="absolute top-0 left-0 text-red-500 opacity-70 z-0" 
      style="clip-path: inset(10% 0 60% 0);"
    >
      <slot></slot>
    </span>
    <span 
      v-if="isGlitching" 
      class="absolute top-0 left-0 text-blue-500 opacity-70 z-0" 
      style="clip-path: inset(60% 0 10% 0); transform: translateX(-2px);"
    >
      <slot></slot>
    </span>
  </div>
</template>
