<template>
  <div :class="[
    isToolLayout ? 'flex flex-col flex-grow' : 'min-h-screen',
    'bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'
  ]">
    <header v-if="showHeader"
      class="sticky -top-px z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto flex items-center gap-2 h-14 px-4">
        <Button v-show="showBackButton" variant="ghost" size="icon" @click="goBack">
          <ArrowLeftIcon class="h-5 w-5" />
        </Button>
        <h1 class="text-xl font-medium">
          {{ title }}
        </h1>
      </div>
    </header>

    <main :class="[mainClass, isToolLayout ? 'flex-grow' : '']">
      <slot></slot>
    </main>

    <footer v-if="showFooter" class="mt-auto py-8 border-t border-gray-200 dark:border-gray-700">
      <div class="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {{ new Date().getFullYear() }} Mathlly. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from 'lucide-vue-next'
import { useTitle } from '@/composables/useTitle'
import Button from '@/components/base/BaseButton.vue'
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: false
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  mainClass: {
    type: String,
    default: 'container mx-auto px-4 py-8 md:py-12'
  },
  isToolLayout: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

useTitle(computed(() => props.title))

const goBack = () => {
  router.go(-1)
}
</script>
