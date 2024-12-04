<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900"><header
      class="bg-white dark:bg-gray-800 p-4 flex items-center border-b border-gray-200 dark:border-gray-700"
    >
      <button
        @click="goBack"
        class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4"
      >
        <ArrowLeftIcon class="h-6 w-6" />
      </button>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Feedback</h1>
      </header>
    <div class="max-w-4xl mx-auto p-6">
      

      <!-- Feedback Options -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Submit Feedback</h2>
        
        <!-- GitHub Issues -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">Report an Issue</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Found a bug? Create an issue on GitHub</p>
            </div>
            <a
              href="https://github.com/Whitestar14/mathlly-app/issues/new?template=bug_report.md"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors"
            >
              Report Bug
            </a>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">Feature Request</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Have an idea? Share it with us</p>
              </div>
              <a
                href="https://github.com/Whitestar14/mathlly-app/issues/new?template=feature_request.md"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors"
              >
                Request Feature
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Guidelines -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Submission Guidelines</h2>
        <ul class="space-y-3">
          <li class="flex items-start">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p class="ml-3 text-sm text-gray-500 dark:text-gray-400">Be specific about the issue or feature request</p>
          </li>
          <li class="flex items-start">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p class="ml-3 text-sm text-gray-500 dark:text-gray-400">Include steps to reproduce if reporting a bug</p>
          </li>
          <li class="flex items-start">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p class="ml-3 text-sm text-gray-500 dark:text-gray-400">Provide screenshots or code examples if applicable</p>
          </li>
          <li class="flex items-start">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p class="ml-3 text-sm text-gray-500 dark:text-gray-400">Check if a similar issue already exists</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CheckCircleIcon, ArrowLeftIcon } from 'lucide-vue-next';
import { useRouter } from "vue-router";
const router = useRouter();

const goBack = () => {
  router.push("/");
};
</script>

