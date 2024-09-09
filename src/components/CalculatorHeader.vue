<template>
  <div class="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
    <div class="flex items-center space-x-2">
      <div class="w-8 h-8 bg-blue-500 rounded-full"></div>
      <h1 class="text-2xl font-bold">Calculator</h1>
    </div>
    <div class="flex items-center space-x-2">
      <div class="relative">
        <button @click="toggleDropdown" class="p-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between w-32">
          {{ mode }}
          <ChevronDown class="w-4 h-4 ml-2" />
        </button>
        <div v-if="isDropdownOpen" class="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 border rounded shadow-lg">
          <button @click="selectMode('standard')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">Standard</button>
          <button @click="selectMode('programmer')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">Programmer</button>
        </div>
      </div>
      <button @click="toggleTheme" class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
        <Sun v-if="!isDarkMode" class="w-5 h-5 text-gray-900 dark:text-white" />
        <Moon v-else class="w-5 h-5 text-gray-900 dark:text-white" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Sun, Moon, ChevronDown } from 'lucide-vue-next'

const mode = ref('standard')
const isDarkMode = ref(false)
const isDropdownOpen = ref(false)

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark')
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const selectMode = (selectedMode) => {
  mode.value = selectedMode
  isDropdownOpen.value = false
}
</script>
