<template>
  <button
    :class="[
      'group outline-none flex w-full items-center rounded-lg transition-all duration-150 ease-out',
      'px-3 py-2 text-sm font-medium',
      'hover:scale-[1.02] active:scale-[0.98]',
      'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
      {
        // Default state
        'text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-700/50': !active && !disabled,
        
        // Active state
        'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm': active && !disabled,
        
        // Disabled state
        'opacity-50 cursor-not-allowed hover:scale-100 hover:bg-transparent': disabled
      },
      itemClass
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <component 
      :is="icon" 
      v-if="icon" 
      :class="[
        'h-4 w-4 mr-3 flex-shrink-0 transition-colors duration-150',
        {
          'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200': !active && !disabled,
          'text-indigo-600 dark:text-indigo-400': active && !disabled
        }
      ]"
    />
    
    <div class="flex-1 min-w-0">
      <div
        v-if="label"
        class="font-medium truncate"
      >
        {{ label }}
      </div>
      <div 
        v-if="description" 
        :class="[
          'text-xs mt-0.5 truncate transition-colors duration-150',
          {
            'text-gray-500 dark:text-gray-400': !active,
            'text-indigo-600/80 dark:text-indigo-400/80': active
          }
        ]"
      >
        {{ description }}
      </div>
      <slot v-if="!label" />
    </div>

    <div 
      v-if="shortcut" 
      :class="[
        'ml-3 text-xs font-mono px-1.5 py-0.5 rounded transition-colors duration-150',
        {
          'text-gray-400 dark:text-gray-500 bg-gray-100/50 dark:bg-gray-700/50': !active,
          'text-indigo-600 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-900/50': active
        }
      ]"
    >
      {{ shortcut }}
    </div>

    <component 
      :is="endIcon" 
      v-if="endIcon" 
      :class="[
        'h-4 w-4 ml-3 flex-shrink-0 transition-colors duration-150',
        {
          'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300': !active && !disabled,
          'text-indigo-600 dark:text-indigo-400': active && !disabled
        }
      ]"
    />
  </button>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number, Object],
    default: null
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  endIcon: {
    type: [Object, Function],
    default: null
  },
  shortcut: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  },
  itemClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click', 'select']);

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event);
    emit('select', props.value || props.label);
  }
};
</script>
