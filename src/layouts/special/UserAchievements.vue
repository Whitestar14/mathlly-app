<script setup>
import { ref, watch } from 'vue'
import { Trophy, Lock } from 'lucide-vue-next'

const props = defineProps({
  age: {
    type: Number,
    required: true
  },
  apocalypseMode: {
    type: Boolean,
    default: false
  },
  themeClasses: {
    type: Object,
    default: () => ({})
  }
})

const achievements = ref([])

watch(() => props.age, generateAchievements, { immediate: true })

function generateAchievements() {
  // Base achievements
  const baseAchievements = [
    {
      id: "burnout",
      title: "Burnout Speedrun Any%",
      description: "Achieved burnout in record time",
      unlocked: props.age > 20,
    },
    {
      id: "stackoverflow",
      title: "Cried Over StackOverflow Answers x3",
      description: "Emotional damage from condescending answers",
      unlocked: props.age > 18,
    },
    {
      id: "ghosted",
      title: "Ghosted Recruiter (with <3 YOE)",
      description: "The tables have turned",
      unlocked: props.age > 22,
    },
    {
      id: "imposter",
      title: "Imposter Syndrome Master",
      description: "Convinced yourself you don't belong here",
      unlocked: true,
    },
    {
      id: "framework",
      title: "Framework Hopper",
      description: "Abandoned 3+ projects to try new frameworks",
      unlocked: props.age > 19,
    },
  ]

  // Special achievements based on age
  if (props.age >= 25) {
    baseAchievements.push({
      id: "quarter-life",
      title: "Quarter-Life Crisis Unlocked",
      description: "Congratulations on your failure!",
      unlocked: true,
    })
  }

  if (props.age === 99) {
    baseAchievements.push({
      id: "singularity",
      title: "Tech Singularity Survivor",
      description: "You've outlived the AI takeover",
      unlocked: true,
    })
  }

  if (props.age === 1) {
    baseAchievements.push({
      id: "prodigy",
      title: "Coding Prodigy",
      description: "Started coding before walking",
      unlocked: true,
    })
  }

  achievements.value = baseAchievements
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold mb-3 flex items-center">
      <Trophy class="w-4 h-4 mr-2" />
      Developer Achievements
    </h3>

    <div class="grid grid-cols-1 gap-3">
      <div
        v-for="achievement in achievements"
        :key="achievement.id"
        :class="`p-3 rounded-md border ${
          achievement.unlocked
            ? apocalypseMode
              ? 'border-red-200 dark:border-red-800 bg-red-100/20 dark:bg-red-900/20'
              : 'border-indigo-200 dark:border-indigo-800 bg-indigo-100/20 dark:bg-indigo-900/20'
            : 'border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-900/50 opacity-60'
        }`"
      >
        <div class="flex items-center justify-between mb-1">
          <h4 class="text-sm font-medium flex items-center">
            <Trophy v-if="achievement.unlocked" class="w-3 h-3 mr-1" />
            <Lock v-else class="w-3 h-3 mr-1" />
            {{ achievement.title }}
          </h4>
          <span
            :class="`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            achievement.unlocked ? apocalypseMode ? 'bg-red-200 dark:bg-red-800 text-gray-950 dark:text-white' : 'bg-indigo-200 dark:bg-indigo-800 text-gray-950 dark:text-white' : 'border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`"
          >
            {{ achievement.unlocked ? "Unlocked" : "Locked" }}
          </span>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-400">{{ achievement.description }}</p>
      </div>
    </div>
  </div>
</template>
