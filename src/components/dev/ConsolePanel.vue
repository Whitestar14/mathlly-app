<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ logs.length }}</span>
      </div>
      
      <div class="flex items-center gap-2">
        <BaseButton
          variant="ghost"
          size="sm"
          :disabled="logs.length === 0"
          @click="clearLogs"
        >
          <TrashIcon class="h-3 w-3" />
        </BaseButton>
        
        <BaseButton
          :variant="isCapturing ? 'destructive' : 'outline'"
          size="sm"
          @click="toggleCapture"
        >
          <div class="flex items-center gap-1.5">
            <div 
              v-if="isCapturing"
              class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"
            />
            <PlayIcon
              v-else
              class="h-3 w-3"
            />
            {{ isCapturing ? 'Stop' : 'Start' }}
          </div>
        </BaseButton>
      </div>
    </div>

    <!-- Console Display -->
    <div 
      ref="logContainer"
      class="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
    >
      <div class="h-full overflow-y-auto p-3 font-mono text-xs">
        <!-- Log entries -->
        <div
          v-for="(log, index) in logs"
          :key="index"
          class="flex items-start gap-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-1 px-1 rounded group"
        >
          <span class="text-gray-400 dark:text-gray-500 text-xs shrink-0 w-16">
            {{ formatTime(log.timestamp) }}
          </span>
          
          <span 
            class="shrink-0 w-12 text-xs font-medium uppercase"
            :class="getLevelColor(log.level)"
          >
            {{ log.level }}
          </span>
          
          <span class="flex-1 text-gray-800 dark:text-gray-200 leading-relaxed">
            {{ log.message }}
          </span>
          
          <BaseButton
            variant="ghost"
            size="icon"
            class="opacity-0 group-hover:opacity-100 h-6 w-6"
            @click="copyLog(log)"
          >
            <CopyIcon class="h-3 w-3" />
          </BaseButton>
        </div>
        
        <!-- Empty state -->
        <div
          v-if="logs.length === 0"
          class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
        >
          <TerminalIcon class="h-8 w-8 mb-3 opacity-40" />
          <p class="text-sm">
            {{ isCapturing ? 'Console is ready' : 'Start capturing to see logs' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Test Controls -->
    <div class="sticky bottom-0 bg-white dark:bg-gray-700 mt-4 p-2 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex gap-1">
          <BaseButton
            v-for="level in logLevels"
            :key="level"
            variant="outline"
            size="sm"
            class="text-xs"
            :class="getLevelButtonStyle(level)"
            :disabled="!isCapturing"
            @click="testLog(level)"
          >
            {{ level }}
          </BaseButton>
        </div>
        
        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span v-if="logs.length > 0">{{ getStats() }}</span>
          <BaseButton
            v-if="logs.length > 5"
            variant="link"
            size="sm"
            class="text-xs h-auto p-0"
            @click="scrollToBottom"
          >
            Latest ↓
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { TerminalIcon, PlayIcon, TrashIcon, CopyIcon } from 'lucide-vue-next'
import BaseButton from '@/components/base/BaseButton.vue'

type LogLevel = 'log' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
}

const logs = ref<LogEntry[]>([])
const isCapturing = ref(false)
const logContainer = ref<HTMLElement>()

const logLevels: LogLevel[] = ['log', 'info', 'warn', 'error']

// Store original console methods
const originalMethods = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
}

const addLog = (level: LogLevel, ...args: any[]) => {
  if (!isCapturing.value) return
  
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ')
  
  logs.value.push({
    timestamp: new Date().toISOString(),
    level,
    message
  })
  
  // Keep last 50 logs
  if (logs.value.length > 50) {
    logs.value.shift()
  }
  
  nextTick(scrollToBottom)
}

const toggleCapture = () => {
  isCapturing.value = !isCapturing.value
  
  if (isCapturing.value) {
    // Override console methods
    console.log = (...args) => {
      originalMethods.log(...args)
      addLog('log', ...args)
    }
    console.info = (...args) => {
      originalMethods.info(...args)
      addLog('info', ...args)
    }
    console.warn = (...args) => {
      originalMethods.warn(...args)
      addLog('warn', ...args)
    }
    console.error = (...args) => {
      originalMethods.error(...args)
      addLog('error', ...args)
    }
  } else {
    // Restore original methods
    Object.assign(console, originalMethods)
  }
}

const clearLogs = () => {
  logs.value = []
}

const scrollToBottom = () => {
  if (logContainer.value) {
    const scrollElement = logContainer.value.querySelector('.overflow-y-auto')
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    minute: '2-digit',
    second: '2-digit'
  })
}

const getLevelColor = (level: LogLevel) => {
  const colors = {
    log: 'text-gray-600 dark:text-gray-400',
    info: 'text-blue-600 dark:text-blue-400',
    warn: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400'
  }
  return colors[level]
}

const getLevelButtonStyle = (level: LogLevel) => {
  const styles = {
    log: 'hover:border-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
    info: 'hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
    warn: 'hover:border-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300',
    error: 'hover:border-red-400 hover:text-red-700 dark:hover:text-red-300'
  }
  return styles[level]
}

const getStats = () => {
  const counts = logs.value.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1
    return acc
  }, {} as Record<LogLevel, number>)
  
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([level, count]) => `${count} ${level}`)
    .join(', ')
}

const copyLog = async (log: LogEntry) => {
  try {
    const text = `[${formatTime(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message}`
    await navigator.clipboard.writeText(text)
    console.log('Copied to clipboard')
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

const testLog = (level: LogLevel) => {
  const messages = {
    log: 'Sample log message',
    info: 'Information message with data',
    warn: 'Warning: something needs attention',
    error: 'Error: something went wrong'
  }
  
  console[level](messages[level], { 
    timestamp: Date.now(), 
    random: Math.floor(Math.random() * 1000) 
  })
}

onMounted(() => {
  toggleCapture()
})

onUnmounted(() => {
  if (isCapturing.value) {
    Object.assign(console, originalMethods)
  }
})
</script>
