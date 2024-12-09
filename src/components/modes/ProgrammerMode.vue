<template>
  <div class="flex flex-col text-gray-700 dark:text-gray-300 p-2">
    <div class="grid grid-cols-2 gap-1 gap-x-5 mb-2 text-sm">
      <button
        v-for="base in ['HEX', 'DEC', 'OCT', 'BIN']"
        :key="base"
        @click="handleBaseChange(base)"
        :class="[
          'flex justify-between items-center p-2 rounded',
          activeBase === base
            ? 'bg-indigo-200 hover:bg-indigo-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700',
        ]"
      >
        <span
          class="dark:text-gray-300"
          :class="[activeBase === base ? 'text-gray-800' : 'text-gray-700']"
          >{{ base }}</span
        >
        <span>{{ currentDisplayValues[base]?.display || '0' }}</span>
      </button>
    </div>

    <div class="border-t border-gray-300 dark:border-gray-700 my-1"></div>

    <!-- Main Programmer Buttons Interface -->
    <div class="grid grid-cols-5 gap-[0.2em] flex-grow max-h-[50vh]">
      <div class="flex flex-col gap-[0.2em] justify-between">
        <button
          v-for="letter in ['A', 'B', 'C', 'D', 'E', 'F']"
          :key="letter"
          @click="handleClick(letter)"
          :disabled="!isButtonEnabled(letter)"
          :class="[
            'btn letter-btn bg-gray-700',
            !isButtonEnabled(letter) ? 'opacity-50 cursor-not-allowed' : '',
          ]"
        >
          {{ letter }}
        </button>
      </div>
      <div class="col-span-4 grid grid-cols-4 gap-[0.2em]">
        <button @click="handleClick('<<')" class="btn function-btn">≪</button>
        <button @click="handleClick('>>')" class="btn function-btn">≫</button>
        <button @click="handleClick('C')" class="btn function-btn">C</button>
        <button @click="handleClick('backspace')" class="btn function-btn">
          <Delete class="w-6 h-6 mx-auto" />
        </button>

        <button @click="handleClick('(')" class="btn function-btn">(</button>
        <button @click="handleClick(')')" class="btn function-btn">)</button>
        <button @click="handleClick('%')" class="btn function-btn">%</button>
        <button @click="handleClick('÷')" class="btn operator-btn">÷</button>

        <button
          @click="handleClick('7')"
          :disabled="!isButtonEnabled('7')"
          class="btn number-btn"
        >
          7
        </button>
        <button
          @click="handleClick('8')"
          :disabled="!isButtonEnabled('8')"
          class="btn number-btn"
        >
          8
        </button>
        <button
          @click="handleClick('9')"
          :disabled="!isButtonEnabled('9')"
          class="btn number-btn"
        >
          9
        </button>
        <button @click="handleClick('×')" class="btn operator-btn">×</button>

        <button
          @click="handleClick('4')"
          :disabled="!isButtonEnabled('4')"
          class="btn number-btn"
        >
          4
        </button>
        <button
          @click="handleClick('5')"
          :disabled="!isButtonEnabled('5')"
          class="btn number-btn"
        >
          5
        </button>
        <button
          @click="handleClick('6')"
          :disabled="!isButtonEnabled('6')"
          class="btn number-btn"
        >
          6
        </button>
        <button @click="handleClick('-')" class="btn operator-btn">−</button>

        <button
          @click="handleClick('1')"
          :disabled="!isButtonEnabled('1')"
          class="btn number-btn"
        >
          1
        </button>
        <button
          @click="handleClick('2')"
          :disabled="!isButtonEnabled('2')"
          class="btn number-btn"
        >
          2
        </button>
        <button
          @click="handleClick('3')"
          :disabled="!isButtonEnabled('3')"
          class="btn number-btn"
        >
          3
        </button>
        <button @click="handleClick('+')" class="btn operator-btn">+</button>

        <button @click="handleClick('±')" class="btn function-btn">±</button>
        <button
          @click="handleClick('0')"
          :disabled="!isButtonEnabled('0')"
          class="btn number-btn"
        >
          0
        </button>
        <button
          @click="handleClick('.')"
          :disabled="!isButtonEnabled('.')"
          class="btn number-btn"
        >
          .
        </button>
        <button @click="handleClick('=')" class="btn operator-btn">=</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Delete } from "lucide-vue-next";
import { computed, defineEmits, defineProps, watch, toRef } from "vue";

const props = defineProps({
  displayValues: {
    type: Object,
    required: true,
    default: () => ({
      HEX: { input: "0", display: "0" },
      DEC: { input: "0", display: "0" },
      OCT: { input: "0", display: "0" },
      BIN: { input: "0", display: "0" },
    }),
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

const formatDisplayValue = (value, base) => {
  if (!value) return "0";
  // Remove prefixes and return the value as is
  let result = value.replace(/^(0x|0o|0b)/, "").toUpperCase();
  console.log("Result:" + result);
  return result;
};

// Replace the existing watch with this deep watcher
watch(
  () => props.displayValues,
  (newValues) => {
    console.log("Display values updated:", newValues);
  },
  { deep: true, immediate: true }
);

const currentDisplayValues = computed(() => {
  return Object.entries(props.displayValues).reduce((acc, [base, value]) => {
    acc[base] = {
      ...value,
      display: formatDisplayValue(value.display, base)
    };
    return acc;
  }, {});
});


</script>

<style scoped>
@import "../../assets/css/CalculatorButtons.css";

.btn {
  @apply px-3 py-2;
}

.letter-btn:disabled,
.number-btn:disabled {
  @apply opacity-50 cursor-not-allowed scale-100 active:scale-100 active:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600;
}
</style>
