<script setup>
import { computed } from 'vue'
import { BarChart3 } from 'lucide-vue-next'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

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

// Generate fake data based on user's age
const chartData = computed(() => {
  const userConfidence = Math.min(100, 40 + props.age * 2.5)
  const userSkill = Math.min(100, props.age * 2)
  const userBurnout = Math.min(100, props.age * 3)

  return {
    labels: ['You', 'Startup CTO', 'CS Graduate', 'Tech Lead', '10x Dev'],
    datasets: [
      {
        label: 'Confidence',
        data: [userConfidence, 65, 85, 45, 95],
        backgroundColor: props.apocalypseMode ? '#ef4444' : '#6366f1',
      },
      {
        label: 'Actual Skill',
        data: [userSkill, 70, 55, 80, 90],
        backgroundColor: props.apocalypseMode ? '#b91c1c' : '#4f46e5',
      },
      {
        label: 'Burnout Level',
        data: [userBurnout, 50, 75, 30, 85],
        backgroundColor: props.apocalypseMode ? '#7f1d1d' : '#4338ca',
      }
    ]
  }
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: props.apocalypseMode ? '#f87171' : '#a5b4fc'
        },
        grid: {
          color: props.apocalypseMode ? '#4b0f0f' : '#312e81'
        }
      },
      x: {
        ticks: {
          color: props.apocalypseMode ? '#f87171' : '#a5b4fc'
        },
        grid: {
          color: props.apocalypseMode ? '#4b0f0f' : '#312e81'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: props.apocalypseMode ? '#f87171' : '#a5b4fc'
        }
      },
      tooltip: {
        backgroundColor: props.apocalypseMode ? 'rgba(127, 29, 29, 0.8)' : 'rgba(67, 56, 202, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: props.apocalypseMode ? '#b91c1c' : '#4f46e5',
        borderWidth: 1
      }
    }
  }
})
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold mb-3 flex items-center">
      <BarChart3 class="w-4 h-4 mr-2" />
      Peer Comparison
    </h3>

    <div class="h-64 w-full">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

    <div class="mt-2 text-xs text-gray-600 dark:text-gray-500 text-center italic">
      *Data scientifically made up for maximum emotional damage
    </div>
  </div>
</template>
