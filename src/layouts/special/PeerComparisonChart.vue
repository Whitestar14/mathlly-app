<script setup>
import { ref, computed, onMounted } from 'vue'
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
  }
})

// Generate fake data based on user's age
const chartData = computed(() => {
  const userConfidence = Math.min(100, 40 + props.age * 2.5)
  const userSkill = Math.min(100, props.age * 2)
  const userBurnout = Math.min(100, props.age * 3)

  return {
    labels: ['You', 'Peer 1', 'Peer 2', 'Peer 3', '10x Dev'],
    datasets: [
      {
        label: 'Confidence',
        data: [userConfidence, 65, 85, 45, 95],
        backgroundColor: props.apocalypseMode ? '#ef4444' : '#10b981',
      },
      {
        label: 'Actual Skill',
        data: [userSkill, 70, 55, 80, 90],
        backgroundColor: props.apocalypseMode ? '#b91c1c' : '#047857',
      },
      {
        label: 'Burnout Level',
        data: [userBurnout, 50, 75, 30, 85],
        backgroundColor: props.apocalypseMode ? '#7f1d1d' : '#064e3b',
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
          color: props.apocalypseMode ? '#f87171' : '#6ee7b7'
        },
        grid: {
          color: props.apocalypseMode ? '#4b0f0f' : '#1f3a2e'
        }
      },
      x: {
        ticks: {
          color: props.apocalypseMode ? '#f87171' : '#6ee7b7'
        },
        grid: {
          color: props.apocalypseMode ? '#4b0f0f' : '#1f3a2e'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: props.apocalypseMode ? '#f87171' : '#6ee7b7'
        }
      },
      tooltip: {
        backgroundColor: props.apocalypseMode ? 'rgba(127, 29, 29, 0.8)' : 'rgba(6, 78, 59, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: props.apocalypseMode ? '#b91c1c' : '#047857',
        borderWidth: 1
      }
    }
  }
})
</script>

<template>
  <div
    :class="`p-4 rounded-lg border animate-slide-up ${
      apocalypseMode ? 'bg-red-950 border-red-900' : 'bg-zinc-900 border-emerald-900'
    }`"
  >
    <h3 class="text-lg font-semibold mb-3 flex items-center">
      <BarChart3 class="w-4 h-4 mr-2" />
      Peer Comparison
    </h3>

    <div class="h-64 w-full">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

    <div class="mt-2 text-xs text-zinc-500 text-center italic">
      *Data scientifically made up for maximum emotional damage
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
  animation-delay: 0.5s;
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
