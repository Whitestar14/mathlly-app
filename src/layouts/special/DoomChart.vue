<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { toPng } from 'html-to-image'
import { useLocalStorage, useIntervalFn } from '@vueuse/core'
import { useToast } from '@/composables/useToast'

// Component Imports
import QuestLog from './QuestLog.vue'
import Achievements from './UserAchievements.vue'
import PeerComparisonChart from './PeerComparisonChart.vue'
import GlitchEffect from './GlitchEffect.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BasePage from '@/components/base/BasePage.vue'
import ToggleBar from '@/components/ui/ToggleBar.vue'

// Lucide Icons
import {
  AlertTriangle,
  Clock,
  Download,
  Skull,
  CheckCircle2,
  XCircle,
  Terminal,
  AreaChartIcon,
  Sparkles,
  Calendar,
  Timer
} from 'lucide-vue-next'

// Composables
const { toast } = useToast()
const router = useRouter()

// State Management with VueUse and Refs
const age = ref('')
const submitted = ref(false)
const yearsLeft = ref(null)
const message = ref('')
const isVisible = ref(true)
const visitCount = useLocalStorage('doom-chart-visits', 1)
const showApocalypse = ref(false)
const isExporting = ref(false)
const keepFeatureEnabled = useLocalStorage('keep-doomchart-feature', false)
const showIntroModal = useLocalStorage('doom-modal-shown', true)

// Countdown timer state
const countdownDays = ref(0)
const countdownHours = ref(0)
const countdownMinutes = ref(0)
const countdownSeconds = ref(0)

// Target timestamp for the countdown (milliseconds)
const countdownTargetTime = ref(null)

// --- Lifecycle Hooks ---
// Check availability and increment visit count on component mount
onMounted(() => {
  checkAvailability()

  // Increment visit count and trigger apocalypse mode on 3rd visit
  if (visitCount.value) {
    visitCount.value++
    if (visitCount.value >= 3) {
      showApocalypse.value = true
    }
  }
})

// Watch for changes to keepFeatureEnabled to update visibility
watch(keepFeatureEnabled, () => {
  checkAvailability()
})

const resetCountdown = () => {
  countdownDays.value = 0
  countdownHours.value = 0
  countdownMinutes.value = 0
  countdownSeconds.value = 0
}

// Use useIntervalFn once at the top level
const { pause: pauseCountdown, resume: resumeCountdown } = useIntervalFn(calculateTimeLeft, 1000, { immediate: false }) // Start paused

// Watch for changes in yearsLeft to start/stop the countdown timer
watch(yearsLeft, (newValue) => {
  if (newValue !== null && newValue > 0) {
    // Calculate the target time based on current time + yearsLeft
    countdownTargetTime.value = new Date().getTime() + newValue * 365 * 24 * 60 * 60 * 1000
    resumeCountdown() // Resume the interval
  } else {
    pauseCountdown() // Pause the interval if no time left or not submitted
    // Reset countdown display when yearsLeft is not positive
    resetCountdown();
    
  }
}, { immediate: true }) // Run immediately on mount if yearsLeft has an initial value

// --- Countdown Timer Logic ---
// Function to calculate and update the countdown values
function calculateTimeLeft() {
  if (countdownTargetTime.value === null) return

  const now = new Date().getTime()
  const difference = countdownTargetTime.value - now

  if (difference <= 0) {
    // Countdown finished
    resetCountdown()
    pauseCountdown() // Stop the interval
    return
  }

  // Calculate time units
  countdownDays.value = Math.floor(difference / (1000 * 60 * 60 * 24))
  countdownHours.value = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  countdownMinutes.value = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  countdownSeconds.value = Math.floor((difference % (1000 * 60)) / 1000)
}

// Clean up the interval when the component is unmounted
onUnmounted(() => {
  pauseCountdown()
})

// --- Methods ---

// Check if the feature should be visible based on month, dev mode, or user preference
const checkAvailability = () => {
  const currentMonth = new Date().getMonth() // 0 for January, 4 for May
  const isDevelopment = process.env.NODE_ENV === 'development'
  const shouldBeVisible = currentMonth === 4 || isDevelopment || keepFeatureEnabled.value

  isVisible.value = shouldBeVisible

  // Redirect if not visible and not already on the home page
  if (!isVisible.value && router.currentRoute.value.path !== '/') {
    router.push('/')
  }
}

// Handle the age submission form
const handleAgeSubmit = (e) => {
  e.preventDefault()

  const parsedAge = parseFloat(age.value)
  if (isNaN(parsedAge) || parsedAge < 0) {
    message.value = 'Please enter a valid age.'
    yearsLeft.value = null // Reset yearsLeft if input is invalid
    submitted.value = false // Keep form visible
    return
  }

  // Calculate years left until age 25
  const remaining = 25 - parsedAge
  yearsLeft.value = remaining
  submitted.value = true

  // Set contextual message based on age
  if (parsedAge === 99) {
    message.value = "You've survived the tech singularity. Press F to pay respects."
  } else if (parsedAge >= 1 && parsedAge <= 3) {
    message.value = "You're too early. Go play outside."
  } else if (parsedAge > 3 && parsedAge <= 10) {
    message.value = "Prodigy alert. delete your cookies, narc."
  } else if (parsedAge < 18) {
    message.value = "You (probably) still have hope."
  } else if (parsedAge === 23) {
    message.value = "Time's ticking. Maybe don't learn another JS framework."
  } else if (parsedAge >= 25 && parsedAge < 30) {
    message.value = "Just lie on LinkedIn."
  } else if (parsedAge >= 30 && parsedAge < 70) {
    message.value = "Have you considered baking Sourdough?"
  } else if (parsedAge >= 70 && parsedAge < 99) {
     message.value = "You've seen it all. Time to return to the Amish"
  }
  else {
    // Default message for other ages >= 25
    message.value = `${Math.abs(remaining).toFixed(1)} years ${remaining >= 0 ? 'until failure' : 'past failure'}. No pressure.`
  }
}

// Export the chart as a PNG image
const exportImage = async () => {
  const element = document.getElementById('doomchart-container')
  if (!element) {
    toast({
      type: 'error',
      description: 'Could not find the element to export.',
      duration: 5000
    })
    return
  }

  isExporting.value = true
  try {
    const dataUrl = await toPng(element, { quality: 0.98 })

    // Create download link and trigger download
    const link = document.createElement('a')
    link.download = 'my-developer-doom.png'
    link.href = dataUrl
    link.click()

    toast({
      type: 'success',
      description: 'Doom chart exported successfully!',
      duration: 3000
    })
  } catch (error) {
    console.error('Image export failed:', error);
    toast({
      type: 'error',
      description: `Failed to export image. Please try again.`, // Generic error message for user
      duration: 5000
    })
  } finally {
    isExporting.value = false
  }
}

// Toggle the apocalypse theme mode
const toggleApocalypse = () => {
  showApocalypse.value = !showApocalypse.value
}

// Reset the form and calculated results
const resetForm = () => {
  submitted.value = false
  age.value = ''
  yearsLeft.value = null
  message.value = ''
  countdownTargetTime.value = null // Reset countdown target
  pauseCountdown() // Ensure countdown is paused
}

// Close the intro modal
const closeIntroModal = () => {
  showIntroModal.value = false
}

// Format countdown number with leading zero (e.g., 5 -> 05)
const formatCountdown = (num) => {
  return num.toString().padStart(2, '0')
}

// --- Computed Properties ---

// Theme classes based on apocalypse mode
const themeClasses = computed(() => ({
  text: showApocalypse.value ? 'text-red-600 dark:text-red-500' : 'text-indigo-600 dark:text-indigo-400',
  text2: 'text-gray-800 dark:text-gray-200',
  icon: showApocalypse.value ? 'text-red-600 dark:text-red-500' : 'text-indigo-600 dark:text-indigo-400',
  bg: showApocalypse.value ? 'bg-gradient-to-br from-white to-red-50 dark:from-red-950 dark:to-black' : 'bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-950',
  bg2: showApocalypse.value ? 'bg-red-100/20 dark:bg-red-900/50' : 'bg-indigo-100/20 dark:bg-indigo-900/30',
  border: showApocalypse.value ? 'border-red-100/50 dark:border-red-800/50' : 'border-indigo-200 dark:border-indigo-700/50',
  border2: showApocalypse.value ? 'dark:border-gray-300/30' : 'border-gray-300 dark:border-gray-700',
  bgSecondary: showApocalypse.value ? 'bg-red-50/60 dark:bg-red-950/80' : 'bg-white/80 dark:bg-gray-800/80',
  bgCard: showApocalypse.value ? 'bg-red-900/40 dark:bg-red-900/60' : 'bg-gray-200/60 dark:bg-gray-800/60',
  button: showApocalypse.value ? 'bg-red-700 dark:bg-red-500 dark:hover:bg-red-400 hover:bg-red-600 text-white' : 'bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white',
  buttonOutline: showApocalypse.value ? 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400 dark:hover:text-black' : 'border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-400 dark:hover:text-black',
  progress: showApocalypse.value ? 'bg-red-500' : 'bg-indigo-500',
  input: showApocalypse.value ? 'bg-white/20 border-red-700/50 dark:border-red-800/50 text-gray-900 dark:text-white placeholder-gray-700 dark:placeholder-gray-300' : 'bg-gray-100/70 dark:bg-gray-900/70 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
  check: showApocalypse.value ? 'checked:accent-red-600' : 'checked:accent-indigo-600 dark:checked:accent-indigo-400',
  pattern: showApocalypse.value ? '' : 'pattern-dots', // Consider a different pattern or none for apocalypse
  countdownBg: showApocalypse.value ? 'bg-red-100/30 dark:bg-red-900/30' : 'bg-indigo-100/30 dark:bg-indigo-900/30',
  countdownText: showApocalypse.value ? 'text-red-700 dark:text-red-300' : 'text-indigo-700 dark:text-indigo-300',
  countdownDigit: showApocalypse.value ? 'bg-red-100/40 dark:bg-red-900/40 text-red-800 dark:text-red-200' : 'bg-indigo-100/40 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200',
}))

// Dynamic classes for the main container based on apocalypse mode
const mainContainerClasses = computed(() => [
  'min-h-screen',
  'p-4',
  'md:p-8',
  themeClasses.value.bg,
  themeClasses.value.pattern,
]);

// Dynamic classes for the doom chart container
const doomContainerClasses = computed(() => [
  'p-6',
  'rounded-lg',
  'border',
  'backdrop-blur-sm',
  themeClasses.value.border,
  themeClasses.value.bgSecondary,
]);

// Dynamic classes for the header
const headerClasses = computed(() => [
  'mb-8',
  'text-center',
  'relative',
  'backdrop-blur-sm',
  'p-4',
  'rounded-lg',
  'border',
  'border-opacity-20',
  themeClasses.value.border2,
]);

// Dynamic classes for the footer
const footerClasses = computed(() => [
  'mt-8',
  'text-center',
  'text-xs',
  'text-gray-500',
  'p-3',
  'rounded-lg',
  'backdrop-blur-sm',
  'border',
  'border-opacity-10',
  themeClasses.value.border2,
]);

</script>

<template>
  <BasePage title="DOOM" :show-header="false" :show-footer="false" main-class="flex flex-col" :is-tool-layout="true">
    <div v-if="isVisible" :class="mainContainerClasses">
      <BaseModal :open="showIntroModal" @update:is-open="showIntroModal = $event">
        <template #title>
          <div class="flex items-center">
            <AreaChartIcon :class="`${themeClasses.icon} w-4 h-4 mr-2`" />
            <h2 :class="`font-semibold ${themeClasses.text2}`">Doom Chart</h2>
          </div>
        </template>

        <div class="space-y-6">
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
            Welcome to your developer obsolescence calculator. Enter your current age to find out how much time you have left before you become irrelevant in tech. It's all in good fun... mostly.
          </p>

          <div class="p-4 rounded-lg bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center mb-2">
              <Calendar class="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
              <span :class="`text-sm font-medium ${themeClasses.text2}`">Availability</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              This feature is normally only available during May, but you can choose to keep it year-round for continuous existential reflection.
            </p>

            <div class="flex items-center mt-3 space-x-2">
              <ToggleBar v-model="keepFeatureEnabled" />
              <span class="text-sm text-gray-600 dark:text-gray-400">
                Keep this feature year-round
              </span>
            </div>
          </div>

          <div class="flex justify-end">
            <BaseButton variant="primary" @click="closeIntroModal" :class="themeClasses.button">
              Begin Assessment
            </BaseButton>
          </div>
        </div>
      </BaseModal>

      <div class="max-w-4xl mx-auto animate-fade-in font-mono">
        <header :class="headerClasses">
          <GlitchEffect>
            <h1 :class="`text-4xl md:text-6xl font-extrabold mb-3 ${themeClasses.text}`">
              DOOM.CHART
            </h1>
          </GlitchEffect>

          <div class="flex items-center justify-center gap-3 flex-col">
            <p :class="`${themeClasses.text2} text-base md:text-lg leading-relaxed`">
              Calculate your remaining time before developer obsolescence.
            </p>
            <div>
              <BaseBadge v-if="!keepFeatureEnabled" type="special" text="May Special" :showNotch="true" />
            </div>
          </div>

          <div class="absolute top-4 right-4">
            <BaseButton size="icon" variant="ghost" class="dark:hover:bg-gray-800/50" @click="toggleApocalypse"
              aria-label="Toggle apocalypse mode">
              <Terminal :size="20" :class="themeClasses.icon" />
            </BaseButton>
          </div>
        </header>

        <div id="doomchart-container" :class="doomContainerClasses">
          <div v-if="!submitted" class="animate-slide-up">
            <form @submit="handleAgeSubmit" class="space-y-6">
              <div class="space-y-3">
                <label for="age" :class="`block text-sm font-medium ${themeClasses.text2}`">
                  Enter your age to calculate time until failure:
                </label>
                <div class="flex flex-col sm:flex-row gap-4 items-center">
                  <div class="relative h-10 flex-auto w-full sm:w-auto">
                    <input id="age" v-model="age"
                      :class="`w-full h-full p-2 pr-12 text-base rounded-md ${themeClasses.border} ${themeClasses.text2} ${themeClasses.input} outline-none focus:outline-2 focus:outline-offset-2 dark:focus:outline-indigo-400 focus:outline-indigo-600 transition-all duration-200`"
                      placeholder="e.g., 22.5" required />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400 text-sm">
                      years
                    </div>
                  </div>
                  <BaseButton type="submit" variant="primary" :class="themeClasses.button" class="sm:w-auto w-full h-10">
                    Calculate Doom
                  </BaseButton>
                </div>
                <p :class="`text-sm ${themeClasses.text2} mt-2 opacity-80`">Enter your current age to see how much time you have
                  left before becoming obsolete in tech.
                </p>
              </div>
              <p v-if="message && !submitted" class="text-sm text-red-500 dark:text-red-400">{{ message }}</p>
            </form>
          </div>

          <div v-else class="space-y-8 animate-fade-in">
            <div v-if="yearsLeft !== null && yearsLeft > 0"
              :class="`p-4 md:p-6 rounded-lg border ${themeClasses.border} ${themeClasses.countdownBg} backdrop-blur-sm animate-pulse-slow`">
              <div class="flex flex-col items-center justify-center space-y-4">
                <div class="flex items-center">
                  <Timer class="w-6 h-6 mr-2" :class="themeClasses.countdownText" />
                  <h3 :class="`text-lg md:text-xl font-semibold ${themeClasses.countdownText}`">
                    COUNTDOWN TO OBSOLESCENCE
                  </h3>
                </div>

                <div class="grid grid-cols-4 gap-1 sm:gap-6 w-full max-w-md">
                  <div class="flex flex-col items-center">
                    <div
                      :class="`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-lg font-mono text-2xl md:text-3xl font-bold ${themeClasses.countdownDigit}`">
                      {{ formatCountdown(countdownDays) }}
                    </div>
                    <span class="text-xs mt-2 text-gray-600 dark:text-gray-200 uppercase">DAYS</span>
                  </div>

                  <div class="flex flex-col items-center">
                    <div
                      :class="`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-lg font-mono text-2xl md:text-3xl font-bold ${themeClasses.countdownDigit}`">
                      {{ formatCountdown(countdownHours) }}
                    </div>
                    <span class="text-xs mt-2 text-gray-600 dark:text-gray-200 uppercase">HOURS</span>
                  </div>

                  <div class="flex flex-col items-center">
                    <div
                      :class="`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-lg font-mono text-2xl md:text-3xl font-bold ${themeClasses.countdownDigit}`">
                      {{ formatCountdown(countdownMinutes) }}
                    </div>
                    <span class="text-xs mt-2 text-gray-600 dark:text-gray-200 uppercase">MINUTES</span>
                  </div>

                  <div class="flex flex-col items-center">
                    <div
                      :class="`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-lg font-mono text-2xl md:text-3xl font-bold ${themeClasses.countdownDigit}`">
                      {{ formatCountdown(countdownSeconds) }}
                    </div>
                    <span class="text-xs mt-2 text-gray-600 dark:text-gray-200 uppercase">SECONDS</span>
                  </div>
                </div>

                <p class="text-sm text-center text-gray-600 dark:text-gray-200 leading-relaxed">
                  Time remaining until your skills become irrelevant in the tech industry (based on an estimated developer half-life of 25 years).
                </p>
              </div>
            </div>

            <div class="text-center mb-6">
              <GlitchEffect>
                <h2 :class="`text-2xl font-bold mb-3 ${themeClasses.text}`">
                  {{ yearsLeft !== null && yearsLeft < 0 ? "FAILURE ACHIEVED" : "FAILURE COUNTDOWN" }} </h2>
              </GlitchEffect>

              <p :class="`text-lg font-mono ${themeClasses.text2}`">
                {{ message }}
              </p>

              <div v-if="yearsLeft !== null && yearsLeft >= 0" class="mt-2 p-2 rounded-lg border border-opacity-30"
                :class="themeClasses.border">
                <div class="flex items-center justify-between mb-2 text-gray-800 dark:text-gray-200 text-sm">
                  <span>Now ({{ parseFloat(age).toFixed(1) }}y)</span>
                  <span>Failure (25y)</span>
                </div>
                <div class="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div :class="`h-full ${themeClasses.progress}`" :style="`width: ${((25 - yearsLeft) / 25) * 100}%`">
                  </div>
                </div>
                <div class="mt-2 text-center">
                  <span
                    :class="`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${themeClasses.buttonOutline}`">
                    <Clock class="w-3 h-3 mr-1" />
                    {{ yearsLeft.toFixed(1) }} years remaining
                  </span>
                </div>
              </div>

              <div v-if="yearsLeft !== null && yearsLeft < 0"
                class="mt-4 flex flex-col justify-center items-center p-4 rounded-lg border border-opacity-30"
                :class="themeClasses.border">
                <Skull :class="`w-16 h-16 ${themeClasses.text} animate-pulse mb-3`" />
                <p :class="`font-mono text-sm mb-2 ${themeClasses.text}`">
                  You've already failed by {{ Math.abs(yearsLeft).toFixed(1) }} years.
                </p>
                <div>
                  <BaseBadge type="special" text="Achievement Unlocked: Quarter-Life Crisis" :showNotch="true" />
                </div>
              </div>
            </div>

            <!-- Content for users with time remaining -->
            <template v-if="yearsLeft !== null && yearsLeft >= 0">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="rounded-lg border border-opacity-30 p-4 backdrop-blur-sm" :class="themeClasses.border">
                  <QuestLog :yearsLeft="yearsLeft" :apocalypseMode="showApocalypse" :themeClasses="themeClasses" />
                </div>
                <div class="rounded-lg border border-opacity-30 p-4 backdrop-blur-sm" :class="themeClasses.border">
                  <Achievements :age="parseFloat(age)" :apocalypseMode="showApocalypse" :themeClasses="themeClasses" />
                </div>
              </div>

              <div class="rounded-lg border border-opacity-30 p-4 backdrop-blur-sm" :class="themeClasses.border">
                <PeerComparisonChart :age="parseFloat(age)" :apocalypseMode="showApocalypse"
                  :themeClasses="themeClasses" />
              </div>
            </template>

            <!-- Content for users who have already "failed" -->
            <div v-if="yearsLeft !== null && yearsLeft < 0" class="space-y-6">
              <div :class="`p-4 rounded-lg border backdrop-blur-sm ${themeClasses.bg} ${themeClasses.border}`">
                <h3 class="text-lg font-semibold mb-4 flex items-center">
                  <AlertTriangle class="w-5 h-5 mr-2" :class="themeClasses.text" />
                  Post-Failure Coping Strategies
                </h3>
                <ul class="space-y-3 text-sm text-gray-300">
                  <li
                    :class="`flex items-start p-2 rounded-md bg-opacity-20 ${themeClasses.bg2} ${themeClasses.text2}`">
                    <CheckCircle2 class="w-5 h-5 mr-3 mt-0.5 text-green-500" />
                    <span>Rebrand yourself as a "seasoned developer"</span>
                  </li>
                  <li
                    :class="`flex items-start p-2 rounded-md bg-opacity-20 ${themeClasses.bg2} ${themeClasses.text2}`">
                    <CheckCircle2 class="w-5 h-5 mr-3 mt-0.5 text-green-500" />
                    <span>Start calling bugs "unexpected features"</span>
                  </li>
                  <li
                    :class="`flex items-start p-2 rounded-md bg-opacity-20 ${themeClasses.bg2} ${themeClasses.text2}`">
                    <CheckCircle2 class="w-5 h-5 mr-3 mt-0.5 text-green-500" />
                    <span>Become a manager (no coding required)</span>
                  </li>
                  <li
                    :class="`flex items-start p-2 rounded-md bg-opacity-20 ${themeClasses.bg2} ${themeClasses.text2}`">
                    <XCircle class="w-5 h-5 mr-3 mt-0.5 text-red-500" />
                    <span>Learn another JavaScript framework</span>
                  </li>
                  <li
                    :class="`flex items-start p-2 rounded-md bg-opacity-20 ${themeClasses.bg2} ${themeClasses.text2}`">
                    <XCircle class="w-5 h-5 mr-3 mt-0.5 text-red-500" />
                    <span>Admit your actual YOE in interviews</span>
                  </li>
                </ul>
              </div>

              <div class="rounded-lg border border-opacity-30 p-4 backdrop-blur-sm" :class="themeClasses.border">
                <Achievements :age="parseFloat(age)" :apocalypseMode="showApocalypse" :themeClasses="themeClasses" />
              </div>
            </div>

            <div class="flex flex-col sm:flex-row justify-between gap-4 pt-6 mt-4 border-t" :class="themeClasses.border2">
              <BaseButton @click="resetForm" variant="outline" :class="themeClasses.buttonOutline" class="w-full sm:w-auto">
                Reset
              </BaseButton>
              <BaseButton @click="exportImage" :disabled="isExporting" variant="outline"
                :class="themeClasses.buttonOutline" class="w-full sm:w-auto">
                <Download class="w-4 h-4 mr-2" />
                {{ isExporting ? "Exporting..." : "Export Your Despair" }}
              </BaseButton>
            </div>
          </div>
        </div>

        <footer :class="footerClasses">
          <div class="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
            <p v-if="!keepFeatureEnabled">
              <Calendar class="inline w-3 h-3 mr-1" /> Available only in May. Existential dread available year-round.
            </p>
            <p v-else>
              <Sparkles class="inline w-3 h-3 mr-1" /> You've chosen to keep this feature. Existential dread is now
              available year-round.
            </p>

            <span v-if="visitCount > 1" class="text-xs opacity-70">
              Visit count: {{ visitCount }}
            </span>
          </div>
        </footer>
      </div>
    </div>
    <div v-else class="flex items-center justify-center min-h-screen text-gray-600 dark:text-gray-400 text-lg">
      This feature is not currently available.
    </div>
  </BasePage>
</template>

<style scoped>
/* Base animations */
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
}

.animate-pulse-slow {
  animation: pulseSlow 3s infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulseSlow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}
</style>
