<script setup>
import { ref, watch } from 'vue'
import { ScrollText, Clock } from 'lucide-vue-next'

const props = defineProps({
  yearsLeft: {
    type: Number,
    required: true
  },
  apocalypseMode: {
    type: Boolean,
    default: false
  },
  themeClasses: {
    type: Object,
    default: () => {}
  }
})

const quests = ref([])

watch(() => props.yearsLeft, generateQuests, { immediate: true })

function generateQuests() {
  // Generate quests based on years left
  const scaleFactor = props.yearsLeft / 5 // Scale time estimates based on years left

  const questTemplates = [
    { task: "Learn Rust", baseTime: 1.5 },
    { task: "Build your 5th abandoned side project", baseTime: 2.0 },
    { task: "Pretend to love LeetCode", baseTime: 0.3 },
    { task: "Contribute to open source (just README typos)", baseTime: 0.5 },
    { task: "Master system design (by watching YouTube)", baseTime: 1.2 },
    { task: "Create a portfolio that's 'almost done'", baseTime: 0.8 },
    { task: "Start a tech blog nobody reads", baseTime: 0.4 },
    { task: "Memorize Big O notation for interviews", baseTime: 0.6 },
    { task: "Attend hackathon (build nothing)", baseTime: 0.7 },
    { task: "Rewrite project in latest framework", baseTime: 1.0 },
  ]

  // Select 5 random quests
  const shuffled = [...questTemplates].sort(() => 0.5 - Math.random())
  const selectedQuests = shuffled.slice(0, 5)

  quests.value = selectedQuests.map((quest, index) => {
    // Scale time estimate based on years left, but keep it reasonable
    const timeEstimate = Math.min(props.yearsLeft * 0.8, quest.baseTime * scaleFactor)

    return {
      id: `quest-${index}`,
      task: quest.task,
      timeEstimate: parseFloat(timeEstimate.toFixed(1)),
      completed: false,
    }
  })
}

function toggleQuest(id) {
  quests.value = quests.value.map(quest => 
    quest.id === id ? { ...quest, completed: !quest.completed } : quest
  )
}
</script>

<template>
  <div class="p-4 rounded-lg animate-slide-up">
    <h3 class="text-lg font-semibold mb-3 flex items-center">
      <ScrollText class="w-4 h-4 mr-2" />
      Developer Quest Log
    </h3>

    <ul class="space-y-3">
      <li v-for="quest in quests" :key="quest.id" class="flex items-start p-3 rounded-md">
        <input
          :id="quest.id"
          type="checkbox"
          :checked="quest.completed"
          @change="toggleQuest(quest.id)"
          :class="`mr-2 mt-1 h-4 w-4 rounded border ${themeClasses.check}`"
        />
        <div class="grid gap-1">
          <label
            :for="quest.id"
            :class="`text-sm font-medium leading-none text-gray-700 dark:text-gray-300 ${
              quest.completed ? 'line-through opacity-70' : ''
            }`"
          >
            {{ quest.task }}
          </label>
          <div class="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <Clock class="w-3 h-3 mr-1" />
            <span>{{ quest.timeEstimate }} years remaining</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
  animation-delay: 0.3s;
  opacity: 0;
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
</style>
