<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  delay: {
    type: Number,
    default: 0
  },
  speed: {
    type: Number,
    default: 50
  }
})

const displayText = ref('')
const currentIndex = ref(0)
const startTyping = ref(false)

onMounted(() => {
  setTimeout(() => {
    startTyping.value = true
  }, props.delay)
})

watch([() => startTyping.value, () => props.text], () => {
  // Reset when text changes
  if (props.text !== displayText.value) {
    currentIndex.value = 0
    displayText.value = ''
  }
}, { immediate: true })

watch(() => startTyping.value, (newValue) => {
  if (newValue) {
    typeNextChar()
  }
})

function typeNextChar() {
  if (currentIndex.value < props.text.length) {
    displayText.value = props.text.substring(0, currentIndex.value + 1)
    currentIndex.value++
    setTimeout(typeNextChar, props.speed)
  }
}
</script>

<template>
  <span>{{ displayText }}</span>
</template>
