<template>
  <div class="flex flex-col text-gray-700 dark:text-gray-300 p-2">
    <div class="grid grid-cols-2 gap-1 gap-x-5 mb-2 text-sm">
      <button
        v-for="base in ['HEX', 'DEC', 'OCT', 'BIN']"
        :key="base"
        :class="[
          'flex justify-between items-center p-2 rounded',
          activeBase === base
            ? 'bg-indigo-200 hover:bg-indigo-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700',
        ]"
        @click="handleBaseChange(base)"
      >
        <span
          class="dark:text-gray-300"
          :class="[activeBase === base ? 'text-gray-800' : 'text-gray-700']"
        >{{ base }}</span>
        <span>{{ formatDisplayValue(displayValues[base]?.display || 0) }}</span>
      </button>
    </div>

    <div class="border-t border-gray-300 dark:border-gray-700 my-1" />

    <!-- Main Programmer Buttons Interface -->
    <div class="grid grid-cols-5 gap-[0.2em] flex-grow max-h-[50vh]">
      <div class="flex flex-col gap-[0.2em] justify-between">
        <button
          v-for="letter in ['A', 'B', 'C', 'D', 'E', 'F']"
          :key="letter"
          :disabled="!isButtonEnabled(letter)"
          :class="[
            'btn letter-btn bg-gray-700',
            !isButtonEnabled(letter) ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          @click="handleClick(letter)"
        >
          {{ letter }}
        </button>
      </div>
      <div class="col-span-4 grid grid-cols-4 gap-[0.2em]">
        <button
          class="btn function-btn"
          @click="handleClick('<<')"
        >
          ≪
        </button>
        <button
          class="btn function-btn"
          @click="handleClick('>>')"
        >
          ≫
        </button>
        <button
          class="btn function-btn"
          @click="handleClick('C')"
        >
          C
        </button>
        <button
          class="btn function-btn"
          @click="handleClick('backspace')"
        >
          <Delete class="w-6 h-6 mx-auto" />
        </button>

        <button
          class="btn function-btn"
          @click="handleClick('(')"
        >
          (
        </button>
        <button
          class="btn function-btn"
          @click="handleClick(')')"
        >
          )
        </button>
        <button
          class="btn function-btn"
          @click="handleClick('%')"
        >
          %
        </button>
        <button
          class="btn operator-btn"
          @click="handleClick('÷')"
        >
          ÷
        </button>

        <button
          :disabled="!isButtonEnabled('7')"
          class="btn number-btn"
          @click="handleClick('7')"
        >
          7
        </button>
        <button
          :disabled="!isButtonEnabled('8')"
          class="btn number-btn"
          @click="handleClick('8')"
        >
          8
        </button>
        <button
          :disabled="!isButtonEnabled('9')"
          class="btn number-btn"
          @click="handleClick('9')"
        >
          9
        </button>
        <button
          class="btn operator-btn"
          @click="handleClick('×')"
        >
          ×
        </button>

        <button
          :disabled="!isButtonEnabled('4')"
          class="btn number-btn"
          @click="handleClick('4')"
        >
          4
        </button>
        <button
          :disabled="!isButtonEnabled('5')"
          class="btn number-btn"
          @click="handleClick('5')"
        >
          5
        </button>
        <button
          :disabled="!isButtonEnabled('6')"
          class="btn number-btn"
          @click="handleClick('6')"
        >
          6
        </button>
        <button
          class="btn operator-btn"
          @click="handleClick('-')"
        >
          −
        </button>

        <button
          :disabled="!isButtonEnabled('1')"
          class="btn number-btn"
          @click="handleClick('1')"
        >
          1
        </button>
        <button
          :disabled="!isButtonEnabled('2')"
          class="btn number-btn"
          @click="handleClick('2')"
        >
          2
        </button>
        <button
          :disabled="!isButtonEnabled('3')"
          class="btn number-btn"
          @click="handleClick('3')"
        >
          3
        </button>
        <button
          class="btn operator-btn"
          @click="handleClick('+')"
        >
          +
        </button>

        <button
          class="btn function-btn"
          @click="handleClick('±')"
        >
          ±
        </button>
        <button
          :disabled="!isButtonEnabled('0')"
          class="btn number-btn"
          @click="handleClick('0')"
        >
          0
        </button>
        <button
          :disabled="!isButtonEnabled('.')"
          class="btn number-btn"
          @click="handleClick('.')"
        >
          .
        </button>
        <button
          class="btn operator-btn"
          @click="handleClick('=')"
        >
          =
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete } from "lucide-vue-next";
import { computed, defineEmits, defineProps } from "vue";

const props = defineProps({
  displayValues: {
    type: Object,
    required: true,
  },
  activeBase: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["button-click", "clear", "base-change"]);

const handleBaseChange = (base) => {
  emit("base-change", base);
};

const handleClick = (value) => {
  if (value === "C" || value === "CE") {
    emit("clear");
  } else {
    emit("button-click", value);
  }
};

const isButtonEnabled = computed(() => (button) => {
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

const formatDisplayValue = (value) => {
  if (!value) return "0";
  // Remove prefixes and return the value as is
  let result = value.replace(/^(0x|0o|0b)/, "").toUpperCase();
  return result;
};

</script>

<style scoped>
@import "../../assets/css/buttons.css";

.btn {
  @apply px-3 py-2;
}

.letter-btn:disabled,
.number-btn:disabled {
  @apply opacity-50 cursor-not-allowed scale-100 active:scale-100 active:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600;
}
</style>
