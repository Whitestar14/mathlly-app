<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toPng } from 'html-to-image'
import QuestLog from './QuestLog.vue'
import Achievements from './Achievements.vue'
import PeerComparisonChart from './PeerComparisonChart.vue'
import TypewriterText from './TypewriterText.vue'
import GlitchEffect from './GlitchEffect.vue'
import { 
  AlertTriangle, 
  Clock, 
  Download, 
  Skull, 
  CheckCircle2, 
  XCircle, 
  Terminal 
} from 'lucide-vue-next'

// State management
const age = ref('')
const submitted = ref(false)
const yearsLeft = ref(null)
const message = ref('')
const isVisible = ref(true)
const visitCount = ref(1)
const showApocalypse = ref(false)
const isExporting = ref(false)

// Check if it's May or if we're in development mode
onMounted(() => {
  const currentMonth = new Date().getMonth()
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Feature only available in May (month index 4) or in development
  if (currentMonth !== 4 && !isDevelopment) {
    isVisible.value = false
    // In a real app, we would use router to redirect
    // router.push('/')
  }

  // Check visit count from localStorage
  const storedVisitCount = localStorage.getItem('doomchartVisits')
  if (storedVisitCount) {
    const count = parseInt(storedVisitCount)
    visitCount.value = count + 1
    localStorage.setItem('doomchartVisits', (count + 1).toString())

    // Show apocalypse version on 3rd visit
    if (count + 1 >= 3) {
      showApocalypse.value = true
    }
  } else {
    localStorage.setItem('doomchartVisits', '1')
  }
})

const handleAgeSubmit = (e) => {
  e.preventDefault()

  const parsedAge = parseFloat(age.value)
  if (isNaN(parsedAge) || parsedAge < 0) {
    message.value = 'Please enter a valid age.'
    return
  }

  // Calculate years left
  const remaining = 25 - parsedAge
  yearsLeft.value = remaining
  submitted.value = true

  // Set contextual message based on age
  if (parsedAge === 99) {
    message.value = "You've survived the tech singularity. Impressive."
  } else if (parsedAge === 1) {
    message.value = "You're too early. Go play outside."
  } else if (parsedAge < 18) {
    message.value = "You still have hope."
  } else if (parsedAge === 23) {
    message.value = "Time's ticking. Maybe don't learn another JS framework."
  } else if (parsedAge >= 25) {
    message.value = "Just lie on LinkedIn."
  } else {
    message.value = `${remaining.toFixed(1)} years until failure. No pressure.`
  }
}

const exportImage = async () => {
  const element = document.getElementById('doomchart-container')
  if (!element) return

  isExporting.value = true
  try {
    const dataUrl = await toPng(element, { quality: 0.95 })

    // Create download link
    const link = document.createElement('a')
    link.download = 'my-developer-doom.png'
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('Failed to export image:', error)
  } finally {
    isExporting.value = false
  }
}

const toggleApocalypse = () => {
  showApocalypse.value = !showApocalypse.value
}

const resetForm = () => {
  submitted.value = false
  age.value = ''
}
</script>

<template>
  <div v-if="isVisible" :class="`min-h-screen p-4 md:p-8 ${showApocalypse ? 'bg-black' : 'bg-zinc-900'}`">
    <div class="max-w-4xl mx-auto opacity-0 animate-fade-in">
      <header class="mb-8 text-center">
        <GlitchEffect>
          <h1 :class="`text-4xl md:text-5xl font-bold mb-2 ${showApocalypse ? 'text-red-500' : 'text-emerald-400'}`">
            DOOMCHART
          </h1>
        </GlitchEffect>
        <p class="text-zinc-400 text-sm md:text-base">
          <TypewriterText text="Calculate your remaining time before developer obsolescence." />
        </p>

        <!-- Hidden button for apocalypse mode -->
        <button
          @click="toggleApocalypse"
          class="absolute top-4 right-4 text-zinc-800 hover:text-zinc-700"
          aria-label="Toggle apocalypse mode"
        >
          <Terminal :size="16" />
        </button>
      </header>

      <div
        id="doomchart-container"
        :class="`p-6 rounded-lg border ${
          showApocalypse ? 'border-red-900 bg-black text-red-500' : 'border-emerald-800 bg-zinc-800 text-emerald-300'
        }`"
      >
        <div v-if="!submitted" class="animate-slide-up">
          <form @submit="handleAgeSubmit" class="space-y-4">
            <div class="space-y-2">
              <label for="age" class="block text-sm font-medium">
                <TypewriterText text="Enter your age to calculate time until failure:" />
              </label>
              <div class="flex space-x-2">
                <input
                  id="age"
                  v-model="age"
                  type="number"
                  step="0.1"
                  min="0"
                  max="120"
                  :class="`bg-zinc-900 border-zinc-700 text-zinc-100 rounded-md p-2 w-full ${
                    showApocalypse ? 'border-red-900' : 'border-emerald-700'
                  }`"
                  placeholder="Your age (e.g., 22.5)"
                  required
                />
                <button
                  type="submit"
                  :class="`px-4 py-2 rounded-md ${
                    showApocalypse ? 'bg-red-900 hover:bg-red-800' : 'bg-emerald-700 hover:bg-emerald-600'
                  }`"
                >
                  Calculate Doom
                </button>
              </div>
            </div>
          </form>
        </div>

        <div v-else class="space-y-6 animate-fade-in">
          <div class="text-center mb-6">
            <GlitchEffect>
              <h2 :class="`text-2xl font-bold mb-2 ${showApocalypse ? 'text-red-400' : 'text-emerald-300'}`">
                {{ yearsLeft !== null && yearsLeft < 0 ? "FAILURE ACHIEVED" : "FAILURE COUNTDOWN" }}
              </h2>
            </GlitchEffect>

            <div class="text-xl font-mono">
              <TypewriterText :text="message" />
            </div>

            <div v-if="yearsLeft !== null && yearsLeft >= 0" class="mt-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs">Now</span>
                <span class="text-xs">Failure (25y)</span>
              </div>
              <div class="w-full bg-zinc-700 rounded-full h-3 overflow-hidden">
                <div
                  :class="`h-full ${showApocalypse ? 'bg-red-600' : 'bg-emerald-500'}`"
                  :style="`width: ${((25 - yearsLeft) / 25) * 100}%`"
                ></div>
              </div>
              <div class="mt-2 text-center">
                <span
                  :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    showApocalypse ? 'border-red-800 text-red-400' : 'border-emerald-800 text-emerald-400'
                  }`"
                >
                  <Clock class="w-3 h-3 mr-1" />
                  {{ yearsLeft.toFixed(1) }} years remaining
                </span>
              </div>
            </div>

            <div v-if="yearsLeft !== null && yearsLeft < 0" class="mt-4 flex flex-col items-center">
              <Skull
                :class="`w-16 h-16 ${showApocalypse ? 'text-red-500' : 'text-emerald-500'} animate-pulse`"
              />
              <p class="mt-2 font-mono text-sm">
                You've already failed by {{ Math.abs(yearsLeft).toFixed(1) }} years.
              </p>
              <span
                :class="`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  showApocalypse ? 'border-red-800 text-red-400' : 'border-emerald-800 text-emerald-400'
                }`"
              >
                Achievement Unlocked: Quarter-Life Crisis
              </span>
            </div>
          </div>

          <template v-if="yearsLeft !== null && yearsLeft >= 0">
            <QuestLog :yearsLeft="yearsLeft" :apocalypseMode="showApocalypse" />
            <Achievements :age="parseFloat(age)" :apocalypseMode="showApocalypse" />
            <PeerComparisonChart :age="parseFloat(age)" :apocalypseMode="showApocalypse" />
          </template>

          <div v-if="yearsLeft !== null && yearsLeft < 0" class="space-y-6">
            <div
              :class="`p-4 rounded-lg border ${
                showApocalypse ? 'bg-red-950 border-red-900' : 'bg-zinc-900 border-emerald-900'
              }`"
            >
              <h3 class="text-lg font-semibold mb-3 flex items-center">
                <AlertTriangle class="w-4 h-4 mr-2" />
                Post-Failure Coping Strategies
              </h3>
              <ul class="space-y-2 text-sm">
                <li class="flex items-start">
                  <CheckCircle2 class="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  <span>Rebrand yourself as a "seasoned developer"</span>
                </li>
                <li class="flex items-start">
                  <CheckCircle2 class="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  <span>Start calling bugs "unexpected features"</span>
                </li>
                <li class="flex items-start">
                  <CheckCircle2 class="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                  <span>Become a manager (no coding required)</span>
                </li>
                <li class="flex items-start">
                  <XCircle class="w-4 h-4 mr-2 mt-0.5 text-red-500" />
                  <span>Learn another JavaScript framework</span>
                </li>
                <li class="flex items-start">
                  <XCircle class="w-4 h-4 mr-2 mt-0.5 text-red-500" />
                  <span>Admit your actual YOE in interviews</span>
                </li>
              </ul>
            </div>

            <Achievements :age="parseFloat(age)" :apocalypseMode="showApocalypse" />
          </div>

          <div class="flex justify-between pt-4 border-t border-zinc-700">
            <button
              @click="resetForm"
              :class="`px-4 py-2 rounded-md border ${
                showApocalypse ? 'border-red-800 text-red-400' : 'border-emerald-800 text-emerald-400'
              }`"
            >
              Reset
            </button>
            <button
              @click="exportImage"
              :disabled="isExporting"
              :class="`px-4 py-2 rounded-md border flex items-center ${
                showApocalypse ? 'border-red-800 text-red-400' : 'border-emerald-800 text-emerald-400'
              }`"
            >
              <Download class="w-4 h-4 mr-2" />
              {{ isExporting ? "Exporting..." : "Export Your Despair" }}
            </button>
          </div>
        </div>
      </div>

      <footer class="mt-6 text-center text-xs text-zinc-500">
        <p>Available only in May. Existential dread available year-round.</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
}

.animate-pulse {
  animation: pulse 2s infinite;
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

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
