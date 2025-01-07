<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div class="container mx-auto flex items-center h-16 px-4">
        <button
          class="mr-4 h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          @click="goBack"
        >
          <ArrowLeftIcon class="h-5 w-5" />
        </button>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Feedback
        </h1>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <div class="space-y-8">
        <section class="space-y-6">
          <h2 class="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Submit Feedback
          </h2>
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div class="flex justify-between items-center group">
              <div>
                <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Report an Issue
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Found a bug? Create an issue on GitHub
                </p>
              </div>
              <a
                href="https://github.com/Whitestar14/mathlly-app/issues/new?template=bug_report.md"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
              >
                Report Bug
              </a>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div class="flex justify-between items-center group">
                <div>
                  <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Feature Request
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Have an idea? Share it with us
                  </p>
                </div>
                <a
                  href="https://github.com/Whitestar14/mathlly-app/issues/new?template=feature_request.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                >
                  Request Feature
                </a>
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-6">
          <h2 class="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Submission Guidelines
          </h2>
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <ul class="space-y-4">
              <li
                v-for="(guideline, index) in [
                  'Be specific about the issue or feature request',
                  'Include steps to reproduce if reporting a bug',
                  'Provide screenshots or code examples if applicable',
                  'Check if a similar issue already exists'
                ]"
                :key="index"
                class="flex items-start group"
              >
                <CheckCircleIcon class="h-4 w-4 text-indigo-500 dark:text-indigo-400 mt-1 mr-3 shrink-0 opacity-75 group-hover:opacity-100 transition-opacity" />
                <span class="text-sm text-gray-600 dark:text-gray-300">{{ guideline }}</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
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

