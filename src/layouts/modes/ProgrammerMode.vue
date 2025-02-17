<template>
  <div class="flex flex-col text-gray-700 dark:text-gray-300 p-2">
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
        @click="handleBaseChange(base)"
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
              ? 'text-indigo-500 dark:text-indigo-300 font-semibold'
              : 'text-gray-800 dark:text-gray-300',
          ]"
        >{{
          formatDisplayValue(displayValues[base]?.display || 0, base)
        }}</span>
      </button>
    </div>

    <div class="border-t border-gray-300 dark:border-gray-700 my-1" />

    <!-- Main Programmer Buttons Interface -->
    <div class="grid grid-cols-5 gap-[0.2em] flex-grow">
      <div class="flex flex-col gap-[0.2em] justify-between">
        <button
          v-for="letter in ['A', 'B', 'C', 'D', 'E', 'F']"
          :key="letter"
          :disabled="!isButtonEnabled(letter)"
          :class="[
            'calc-btn calc-letter-btn bg-gray-700',
            !isButtonEnabled(letter) || isMaxLengthReached
              ? 'opacity-50 cursor-not-allowed'
              : '',
          ]"
          @click="handleClick(letter)"
        >
          {{ letter }}
        </button>
      </div>
      <div class="col-span-4 grid grid-cols-4 gap-[0.2em]">
        <button
          class="calc-btn calc-function-btn"
          :disabled="isMaxLengthReached"
          @click="handleClick('<<')"
        >
          <ChevronsLeftIcon class="w-6 h-6 mx-auto" />
        </button>
        <button
          class="calc-btn calc-function-btn"
          :disabled="isMaxLengthReached"
          @click="handleClick('>>')"
        >
          <ChevronsRightIcon class="w-6 h-6 mx-auto" />
        </button>
        <button
          class="calc-btn calc-function-btn"
          @click="handleClick('CE')"
        >
          CE
        </button>
        <button
          class="calc-btn calc-function-btn"
          @click="handleClick('backspace')"
        >
          <Delete class="w-6 h-6 mx-auto" />
        </button>

        <button
          class="calc-btn calc-function-btn"
          :disabled="isMaxLengthReached"
          @click="handleClick('(')"
        >
          (
        </button>
        <button
          class="calc-btn calc-function-btn"
          :disabled="isMaxLengthReached"
          @click="handleClick(')')"
        >
          )
        </button>
        <button
          class="calc-btn calc-function-btn"
          :disabled="isMaxLengthReached"
          @click="handleClick('%')"
        >
          %
        </button>
        <button
          class="calc-btn calc-operator-btn"
          :disabled="isMaxLengthReached"
          @click="handleClick('÷')"
        >
          ÷
        </button>

        <button
          :disabled="!isButtonEnabled('7') || isMaxLengthReached"
          class="calc-btn calc-number-btn"
          @click="handleClick('7')"
        >
          7
        </button>
        <button
          :disabled="!isButtonEnabled('8') || isMaxLengthReached"
          class="calc-btn calc-number-btn"
          @click="handleClick('8')"
        >
          8
        </button>
        <button
          :disabled="!isButtonEnabled('9') || isMaxLengthReached"
          class="calc-btn calc-number-btn"
          @click="handleClick('9')"
        >
          9
        </button>
        <button
          class="calc-btn calc-operator-btn"
          :disabled="isMaxLengthReached"
          @click="handleClick('×')"
        >
          ×
        </button>

        <button
          :disabled="!isButtonEnabled('4') || isMaxLengthReached"
          class="calc-btn calc-number-btn"
          @click="handleClick('4')"
        >
          4
        </button>
        <button
          :disabled="!isButtonEnabled('5') || isMaxLengthReached"
          class="calc-btn calc-number-btn"
          @click="handleClick('5')"
        >
          5
        </button>
        <button
          :disabled="!isButtonEnabled('6') || isMaxLengthReached"
          class="calc-btn calc-number-btn"
          @click="handleClick('6')"
        >
          6
        </button>
        <button
          class="calc-btn calc-operator-btn"
          :disabled="isMaxLengthReached"
          @click="handleClick('-')"
        >
          −
        </button>

        <button
          :disabled="!isButtonEnabled('1') || isMaxLengthReached"
          class="calc-btn calc-number-btn"
          @click="handleClick('1')"
        >
          1
        </button>
        <button
          :disabled="!isButtonEnabled('2') || isMaxLengthReached"
          class="calc-btn calc-number-btn"
          @click="handleClick('2')"
        >
          2
        </button>
        <button
          :disabled="!isButtonEnabled('3') || isMaxLengthReached"
          class="calc-btn calc-number-btn"
          @click="handleClick('3')"
        >
          3
        </button>
        <button
          class="calc-btn calc-operator-btn"
          :disabled="isMaxLengthReached"
          @click="handleClick('+')"
        >
          +
        </button>

        <button
          class="calc-btn calc-function-btn"
          :disabled="isMaxLengthReached"
          @click="handleClick('±')"
        >
          ±
        </button>
        <button
          :disabled="!isButtonEnabled('0') || isMaxLengthReached"
          class="calc-btn calc-number-btn"
          @click="handleClick('0')"
        >
          0
        </button>
        <button
          :disabled="!isButtonEnabled('.') || isMaxLengthReached"
          class="calc-btn calc-number-btn"
          @click="handleClick('.')"
        >
          .
        </button>
        <button
          class="calc-btn calc-operator-btn"
          @click="handleClick('=')"
        >
          =
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete, ChevronsRightIcon, ChevronsLeftIcon } from "lucide-vue-next";
import { computed } from "vue";

const props = defineProps({
  displayValues: {
    type: Object,
    required: true,
  },
  activeBase: {
    type: String,
    required: true,
  },
  inputLength: {
    type: Number,
    required: true,
  },
  maxLength: {
    type: Number,
    default: 29,
  },
});

const emit = defineEmits(["button-click", "clear", "base-change"]);

const handleBaseChange = (base) => {
  emit("base-change", base);
};

const handleClick = (value) => {
    emit("button-click", value);
};

// Fix: Remove value parameter since it's not being used correctly
const isMaxLengthReached = computed(() => props.inputLength >= props.maxLength);

// Fix: Update isButtonEnabled to handle max length and allowed characters
const isButtonEnabled = computed(() => (button) => {
  // First check max length for number inputs
  if (isMaxLengthReached.value && /^[0-9A-F.]$/.test(button.toUpperCase())) {
    return false;
  }

  // Then check base restrictions
  switch (props.activeBase) {
    case "HEX":
      return /^[0-9A-F]$/.test(button.toUpperCase());
    case "DEC":
      return /^[0-9]$/.test(button);
    case "OCT":
      return /^[0-7]$/.test(button);
    case "BIN":
      return /^[01]$/.test(button);
    default:
      return true;
  }
});

const formatDisplayValue = (value, base) => {
  if (!value) return "0";

  const MAX_PREVIEW_LENGTHS = {
    BIN: 12, // Reduced from 16 to show fewer digits in buttons
    OCT: 8, // Reduced from 12
    DEC: 8, // Reduced from 10
    HEX: 6, // Reduced from 8
  };

  // Process the value based on base
  let result = value
    .toString()
    .replace(/^(0x|0o|0b)/, "")
    .toUpperCase();

  // Truncate if too long and add ellipsis
  if (result.length > MAX_PREVIEW_LENGTHS[base]) {
    return result.slice(0, MAX_PREVIEW_LENGTHS[base]) + "…";
  }

  return result;
};
</script>

<style lang="css" scoped>
@import url("../../assets/css/buttons.css");

</style>
