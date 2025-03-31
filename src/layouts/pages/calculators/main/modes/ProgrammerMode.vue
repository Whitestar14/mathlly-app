<template>
  <div class="flex flex-col gap-1">
    <div class="grid grid-cols-5 gap-1">
      <button
        v-for="op in ['MC', 'MR', 'M+', 'M-', 'MS']"
        :key="op"
        class="calc-btn calc-memory-btn calc-btn-grid"
        :class="{ 'opacity-50': (op === 'MC' || op === 'MR') && !hasMemory }"
        @click="handleClick(op)"
      >
        {{ op }}
      </button>
    </div>

    <div class="grid grid-cols-5 gap-1 flex-grow">
      <div class="flex flex-col gap-1">
        <button
          v-for="letter in ['A', 'B', 'C', 'D', 'E', 'F']"
          :key="letter"
          :disabled="!isButtonEnabled(letter)"
          :class="[
            'calc-btn calc-letter-btn calc-btn-grid',
            !isButtonEnabled(letter) || isMaxLengthReached
              ? 'opacity-50 cursor-not-allowed'
              : '',
          ]"
          @click="handleClick(letter)"
        >
          {{ letter }}
        </button>
      </div>
      <div class="col-span-4 grid grid-cols-4 gap-1">
        <button
          class="calc-btn calc-function-btn calc-btn-grid"
          :disabled="isMaxLengthReached"
          @click="handleClick('<<')"
        >
          <ChevronsLeftIcon class="w-6 h-6 mx-auto" />
        </button>
        <button
          class="calc-btn calc-function-btn calc-btn-grid"
          :disabled="isMaxLengthReached"
          @click="handleClick('>>')"
        >
          <ChevronsRightIcon class="w-6 h-6 mx-auto" />
        </button>
        <button
          class="calc-btn calc-function-btn calc-btn-grid"
          @click="handleClick('CE')"
        >
          CE
        </button>
        <button
          class="calc-btn calc-function-btn calc-btn-grid"
          @click="handleClick('backspace')"
        >
          <Delete class="w-6 h-6 mx-auto" />
        </button>

        <button
          class="calc-btn calc-function-btn calc-btn-grid"
          :disabled="isMaxLengthReached"
          @click="handleClick('(')"
        >
          (
        </button>
        <button
          class="calc-btn calc-function-btn calc-btn-grid"
          :disabled="isMaxLengthReached"
          @click="handleClick(')')"
        >
          )
        </button>
        <button
          class="calc-btn calc-function-btn calc-btn-grid"
          :disabled="isMaxLengthReached"
          @click="handleClick('%')"
        >
          %
        </button>
        <button
          class="calc-btn calc-operator-btn calc-btn-grid"
          :disabled="isMaxLengthReached"
          @click="handleClick('÷')"
        >
          ÷
        </button>

        <button
          :disabled="!isButtonEnabled('7') || isMaxLengthReached"
          class="calc-btn calc-number-btn calc-btn-grid"
          @click="handleClick('7')"
        >
          7
        </button>
        <button
          :disabled="!isButtonEnabled('8') || isMaxLengthReached"
          class="calc-btn calc-number-btn calc-btn-grid"
          @click="handleClick('8')"
        >
          8
        </button>
        <button
          :disabled="!isButtonEnabled('9') || isMaxLengthReached"
          class="calc-btn calc-number-btn calc-btn-grid"
          @click="handleClick('9')"
        >
          9
        </button>
        <button
          class="calc-btn calc-operator-btn calc-btn-grid"
          :disabled="isMaxLengthReached"
          @click="handleClick('×')"
        >
          ×
        </button>

        <button
          :disabled="!isButtonEnabled('4') || isMaxLengthReached"
          class="calc-btn calc-number-btn calc-btn-grid"
          @click="handleClick('4')"
        >
          4
        </button>
        <button
          :disabled="!isButtonEnabled('5') || isMaxLengthReached"
          class="calc-btn calc-number-btn calc-btn-grid"
          @click="handleClick('5')"
        >
          5
        </button>
        <button
          :disabled="!isButtonEnabled('6') || isMaxLengthReached"
          class="calc-btn calc-number-btn calc-btn-grid"
          @click="handleClick('6')"
        >
          6
        </button>
        <button
          class="calc-btn calc-operator-btn calc-btn-grid"
          :disabled="isMaxLengthReached"
          @click="handleClick('-')"
        >
          −
        </button>

        <button
          :disabled="!isButtonEnabled('1') || isMaxLengthReached"
          class="calc-btn calc-number-btn calc-btn-grid"
          @click="handleClick('1')"
        >
          1
        </button>
        <button
          :disabled="!isButtonEnabled('2') || isMaxLengthReached"
          class="calc-btn calc-number-btn calc-btn-grid"
          @click="handleClick('2')"
        >
          2
        </button>
        <button
          :disabled="!isButtonEnabled('3') || isMaxLengthReached"
          class="calc-btn calc-number-btn calc-btn-grid"
          @click="handleClick('3')"
        >
          3
        </button>
        <button
          class="calc-btn calc-operator-btn calc-btn-grid"
          :disabled="isMaxLengthReached"
          @click="handleClick('+')"
        >
          +
        </button>

        <button
          class="calc-btn calc-function-btn calc-btn-grid"
          :disabled="isMaxLengthReached"
          @click="handleClick('±')"
        >
          ±
        </button>
        <button
          :disabled="!isButtonEnabled('0') || isMaxLengthReached"
          class="calc-btn calc-number-btn calc-btn-grid"
          @click="handleClick('0')"
        >
          0
        </button>
        <button
          :disabled="!isButtonEnabled('.') || isMaxLengthReached"
          class="calc-btn calc-number-btn calc-btn-grid"
          @click="handleClick('.')"
        >
          .
        </button>
        <button
          class="calc-btn calc-operator-btn calc-btn-grid"
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
  hasMemory: {
    type: Boolean,
    default: false
  },
});

const emit = defineEmits(["button-click", "clear"]);

const handleClick = (value) => {
  emit("button-click", value);
};

const isMaxLengthReached = computed(() => props.inputLength >= props.maxLength);

const isButtonEnabled = computed(() => (button) => {
  if (isMaxLengthReached.value && /^[0-9A-F.]$/.test(button.toUpperCase())) {
    return false;
  }

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
</script>
