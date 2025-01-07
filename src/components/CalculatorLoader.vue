<template>
    <main class="flex-grow flex">
      <div class="flex-grow bg-white dark:bg-gray-800 shadow-xl overflow-hidden transition-colors duration-300">
        <div class="px-6 mx-auto">
          <!-- Display skeleton -->
          <div class="animate-pulse space-y-6">
            <!-- Top bar skeleton -->
            <div class="flex justify-between items-center">
              <div class="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            </div>
            
            <!-- Calculator display skeleton -->
            <div class="space-y-2">
              <div class="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              <div class="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            </div>
  
            <!-- Calculator buttons grid skeleton -->
            <div class="grid grid-cols-4 gap-2">
              <div v-for="n in 20" :key="n" 
                   class="h-14 bg-gray-200 dark:bg-gray-700 rounded-md">
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </template>
  