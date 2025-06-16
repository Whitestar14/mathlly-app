<template>
  <div
    :class="[
      isToolLayout ? 'flex flex-col flex-grow' : 'h-full',
      'bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'
    ]"
  >
    <header
      v-if="showHeader"
      class="sticky -top-px z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div class="container mx-auto flex items-center gap-2 h-14 px-4">
        <Button
          v-show="showBackButton"
          variant="ghost"
          size="icon"
          @click="goBack"
        >
          <ArrowLeftIcon class="h-5 w-5" />
        </Button>
        <div class="flex items-center gap-3">
          <h1 class="text-xl font-medium">
            {{ title }}
          </h1>
        </div>
      </div>
    </header>

    <main :class="[mainClass, isToolLayout ? 'flex-grow' : '']">
      <slot />
    </main>

    <footer
      v-if="showFooter"
      class="mt-auto py-8 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {{ new Date().getFullYear() }} Mathlly. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'
import { useRouter, type Router } from 'vue-router'
import { ArrowLeftIcon } from 'lucide-vue-next'
import { useTitle } from '@/composables/useTitle'
import Button from '@/components/base/BaseButton.vue'

interface Props {
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showBackButton?: boolean;
  mainClass?: string;
  isToolLayout?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showHeader: true,
  showFooter: false,
  showBackButton: true,
  mainClass: 'container mx-auto px-4 py-8 md:py-12',
  isToolLayout: false,
  badge: false
})

const router: Router = useRouter()

const titleComputed: ComputedRef<string> = computed(() => props.title)
useTitle(titleComputed)

const goBack = (): void => {
  router.go(-1)
}
</script>
