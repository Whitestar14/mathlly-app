<template>
  <div class="grid grid-cols-2 gap-1 mb-2 text-sm">
    <button
      v-for="base in ['HEX', 'DEC', 'OCT', 'BIN']"
      :key="base"
      :class="[
        'flex justify-between items-center p-2 rounded transition-colors duration-200',
        activeBase === base
          ? 'bg-indigo-50 dark:bg-gray-700/70 text-gray-500 border border-indigo-300 dark:border-indigo-300/25 dark:text-gray-200'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30',
      ]"
      @click="$emit('base-change', base)"
    >
      <span
        :class="[
          activeBase === base
            ? 'text-indigo-600 dark:text-indigo-300'
            : 'text-gray-600 dark:text-gray-400',
        ]"
      >{{ base }}</span>
      <span
        :class="[
          'monospace',
          activeBase === base
            ? 'text-indigo-500 dark:text-indigo-300 font-medium'
            : 'text-gray-800 dark:text-gray-300',
        ]"
      >{{ formatDisplayValue(displayValues[base]?.display || 0, base) }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  displayValues: {
    type: Object,
    required: true,
  },
  activeBase: {
    type: String,
    required: true,
  },
});

defineEmits(['base-change']);

const formatDisplayValue = (value, base) => {
  if (!value) return "0";

  const MAX_PREVIEW_LENGTHS = {
    BIN: 12,
    OCT: 8,
    DEC: 8,
    HEX: 6,
  };

  let result = value
    .toString()
    .replace(/^(0x|0o|0b)/, "")
    .toUpperCase();

  if (result.length > MAX_PREVIEW_LENGTHS[base]) {
    return result.slice(0, MAX_PREVIEW_LENGTHS[base]) + "…";
  }

  return result;
};
</script>
