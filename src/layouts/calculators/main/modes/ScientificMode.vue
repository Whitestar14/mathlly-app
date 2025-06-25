<template>
  <div class="flex flex-col gap-1">
    <!-- Mode toggles row -->
    <div class="grid grid-cols-3 gap-1 mb-1">
      <button
        class="calc-btn calc-function-btn calc-btn-grid text-xs"
        :class="{ 'calc-active-btn': true }"
        @click="cycleAngleMode"
      >
        {{ angleMode }}
      </button>
      <button
        class="calc-btn calc-function-btn calc-btn-grid text-xs"
        :class="{ 'calc-active-btn': notationMode === 'SCI' }"
        @click="handleModeToggle('F-E')"
      >
        {{ notationMode }}
      </button>
      <!-- Memory dropdown -->
      <DropdownMenuRoot>
        <DropdownMenuTrigger as-child>
          <button class="calc-btn calc-function-btn calc-btn-grid text-xs flex items-center justify-center gap-1">
            <span>M</span>
            <LucideChevronDown class="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent class="bg-gray-800 border border-gray-700 rounded-md shadow-lg p-1 w-[120px]">
          <div class="grid grid-cols-1 gap-1">
            <button
              v-for="op in memoryOperations"
              :key="op"
              class="calc-btn calc-memory-btn calc-btn-grid text-xs"
              :disabled="(op === 'MC' || op === 'MR') && !hasMemory"
              @click="handleClick(op)"
            >
              {{ op }}
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    </div>
    
    <!-- Function dropdown buttons -->
    <div class="grid grid-cols-2 gap-1 mb-1">
      <!-- Trigonometry dropdown -->
      <DropdownMenuRoot>
        <DropdownMenuTrigger as-child>
          <button class="calc-btn calc-function-btn calc-btn-grid w-full flex items-center justify-center gap-1">
            <LucideTriangle class="h-4 w-4" />
            <span class="text-sm">Trigonometry</span>
            <LucideChevronDown class="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent class="bg-gray-800 border border-gray-700 rounded-md shadow-lg p-1 w-[200px]">
          <!-- Toggle buttons inside dropdown -->
          <div class="grid grid-cols-2 gap-1 mb-2">
            <button
              class="calc-btn calc-function-btn calc-btn-grid text-xs"
              :class="{ 'calc-active-btn': hyperbolicMode }"
              @click="handleModeToggle('HYP')"
            >
              HYP
            </button>
            <button
              class="calc-btn calc-function-btn calc-btn-grid text-xs"
              :class="{ 'calc-active-btn': trigSecondFunctionActive }"
              @click="toggleTrigSecondFunction"
            >
              2ⁿᵈ
            </button>
          </div>
          
          <!-- Trig functions grid -->
          <div class="grid grid-cols-3 gap-1">
            <button
              v-for="func in currentTrigFunctions"
              :key="func.value"
              class="calc-btn calc-function-btn calc-btn-grid text-xs py-2"
              @click="handleTrigFunction(func.value)"
            >
              <span v-html="func.display || func.value"></span>
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenuRoot>
      
      <!-- Functions dropdown -->
      <DropdownMenuRoot>
        <DropdownMenuTrigger as-child>
          <button class="calc-btn calc-function-btn calc-btn-grid w-full flex items-center justify-center gap-1">
            <LucideSquareFunction class="h-4 w-4" />
            <span class="text-sm">Functions</span>
            <LucideChevronDown class="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent class="bg-gray-800 border border-gray-700 rounded-md shadow-lg p-1 w-[200px]">
          <div class="grid grid-cols-2 gap-1">
            <button
              v-for="func in functionsList"
              :key="func.value"
              class="calc-btn calc-function-btn calc-btn-grid text-xs py-2"
              @click="handleClick(func.value)"
            >
              <span v-html="func.display || func.value"></span>
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    </div>

    <div class="grid grid-cols-5 gap-1 flex-grow">
      <!-- Scientific functions column -->
      <div class="flex flex-col gap-1">
        <CalcButton
          value="2nd"
          variant="function"
          :class="{ 'calc-active-btn': secondFunctionActive }"
          @click="toggleSecondFunction"
        >
          <span>2ⁿᵈ</span>
        </CalcButton>
        
        <CalcButton
          v-for="func in scientificFunctions"
          :key="func.primary"
          :value="secondFunctionActive ? func.secondary : func.primary"
          variant="function"
          @click="handleClick(secondFunctionActive ? func.secondary : func.primary)"
        >
          <span v-html="secondFunctionActive ? func.secondaryDisplay : func.primaryDisplay"></span>
        </CalcButton>
      </div>

      <!-- Main calculator grid -->
      <div class="col-span-4 grid grid-cols-4 gap-1">
        <!-- Function and clear row -->
        <CalcButton 
          v-for="(btn, index) in functionRow" 
          :key="index"
          :value="btn.value"
          :icon="btn.icon"
          :variant="btn.variant"
          @click="handleClick(btn.value)"
        />

        <!-- Constants and operations row -->
        <CalcButton 
          v-for="(btn, index) in constantsRow" 
          :key="index"
          :value="btn.value"
          :icon="btn.icon"
          :variant="btn.variant"
          @click="handleClick(btn.value)"
        />

        <!-- Additional functions row -->
        <CalcButton 
          v-for="(btn, index) in additionalFunctionsRow" 
          :key="index"
          :value="btn.value"
          :variant="btn.variant"
          @click="handleClick(btn.value)"
        />

        <!-- Number pad and operations -->
        <template v-for="(row, rowIndex) in numberRows">
          <CalcButton 
            v-for="(btn, btnIndex) in row" 
            :key="`row-${rowIndex}-btn-${btnIndex}`"
            :value="btn.value"
            :disabled="btn.checkMaxLength ? isMaxLengthReached : false"
            :variant="btn.variant"
            @click="handleClick(btn.value)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, markRaw } from "vue";
import CalcButton from '@/components/ui/CalculatorButton.vue';
import { 
  LucideDelete, 
  LucideTriangle, 
  LucideSquareFunction, 
  LucideChevronDown 
} from 'lucide-vue-next';
import { numberRows } from './NumberRows';
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from 'radix-vue';

const props = defineProps({
  inputLength: {
    type: Number,
    required: true
  },
  maxLength: {
    type: Number,
    default: 29
  },
  hasMemory: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['button-click', 'clear', 'mode-toggle']);

// State
const secondFunctionActive = ref(false);
const trigSecondFunctionActive = ref(false);
const angleMode = ref('DEG');
const notationMode = ref('F-E');
const hyperbolicMode = ref(false);

const isMaxLengthReached = computed(() => 
  props.inputLength >= props.maxLength
);

const memoryOperations = markRaw(['MC', 'MR', 'M+', 'M-', 'MS']);

// Scientific functions column
const scientificFunctions = markRaw([
  { 
    primary: 'x²', 
    secondary: 'x³', 
    primaryDisplay: 'x²', 
    secondaryDisplay: 'x³' 
  },
  { 
    primary: '√', 
    secondary: '∛', 
    primaryDisplay: '²√x', 
    secondaryDisplay: '³√x' 
  },
  { 
    primary: 'x^y', 
    secondary: 'y√x', 
    primaryDisplay: 'xʸ', 
    secondaryDisplay: 'ʸ√x' 
  },
  { 
    primary: '10^x', 
    secondary: '2^x', 
    primaryDisplay: '10ˣ', 
    secondaryDisplay: '2ˣ' 
  },
  { 
    primary: 'log', 
    secondary: 'log2', 
    primaryDisplay: 'log', 
    secondaryDisplay: 'log₂' 
  },
  { 
    primary: 'ln', 
    secondary: 'e^x', 
    primaryDisplay: 'ln', 
    secondaryDisplay: 'eˣ' 
  }
]);

// Function and clear row
const functionRow = markRaw([
  { value: '(', variant: 'function' },
  { value: ')', variant: 'function' },
  { value: 'n!', variant: 'function' },
  { value: 'C', variant: 'function' }
]);

// Constants and operations row
const constantsRow = markRaw([
  { value: 'π', variant: 'function' },
  { value: 'e', variant: 'function' },
  { value: 'exp', variant: 'function' },
  { value: 'backspace', variant: 'function', icon: LucideDelete }
]);

// Additional functions row
const additionalFunctionsRow = markRaw([
  { value: '1/x', variant: 'function' },
  { value: '|x|', variant: 'function' },
  { value: 'mod', variant: 'function' },
  { value: '÷', variant: 'operator' }
]);

// Primary trigonometric functions
const primaryTrigFunctions = markRaw([
  { value: 'sin', display: 'sin' },
  { value: 'cos', display: 'cos' },
  { value: 'tan', display: 'tan' },
  { value: 'asin', display: 'sin⁻¹' },
  { value: 'acos', display: 'cos⁻¹' },
  { value: 'atan', display: 'tan⁻¹' }
]);

// Secondary trigonometric functions (with 2nd button)
const secondaryTrigFunctions = markRaw([
  { value: 'csc', display: 'csc' },
  { value: 'sec', display: 'sec' },
  { value: 'cot', display: 'cot' },
  { value: 'acsc', display: 'csc⁻¹' },
  { value: 'asec', display: 'sec⁻¹' },
  { value: 'acot', display: 'cot⁻¹' }
]);

// Primary hyperbolic functions
const primaryHyperbolicFunctions = markRaw([
  { value: 'sinh', display: 'sinh' },
  { value: 'cosh', display: 'cosh' },
  { value: 'tanh', display: 'tanh' },
  { value: 'asinh', display: 'sinh⁻¹' },
  { value: 'acosh', display: 'cosh⁻¹' },
  { value: 'atanh', display: 'tanh⁻¹' }
]);

// Secondary hyperbolic functions (with 2nd button)
const secondaryHyperbolicFunctions = markRaw([
  { value: 'csch', display: 'csch' },
  { value: 'sech', display: 'sech' },
  { value: 'coth', display: 'coth' },
  { value: 'acsch', display: 'csch⁻¹' },
  { value: 'asech', display: 'sech⁻¹' },
  { value: 'acoth', display: 'coth⁻¹' }
]);

// Compute current trig functions based on both 2nd and hyperbolic mode
const currentTrigFunctions = computed(() => {
  if (hyperbolicMode.value) {
    return trigSecondFunctionActive.value ? secondaryHyperbolicFunctions : primaryHyperbolicFunctions;
  } else {
    return trigSecondFunctionActive.value ? secondaryTrigFunctions : primaryTrigFunctions;
  }
});

// Function list
const functionsList = markRaw([
  { value: 'abs', display: '|x|' },
  { value: 'ceil', display: '⌈x⌉' },
  { value: 'floor', display: '⌊x⌋' },
  { value: 'round', display: 'round' },
  { value: 'rand', display: 'rand' },
  { value: 'dms', display: '→DMS' },
  { value: 'deg', display: '→DEG' },
  { value: 'gcd', display: 'gcd' },
  { value: 'lcm', display: 'lcm' }
]);

const handleClick = (value) => {
  if (value === 'C') {
    emit('clear');
  } else {
    emit('button-click', value);
  }
};

const handleTrigFunction = (value) => {
  emit('button-click', value);
};

// Cycle through angle modes: DEG -> RAD -> GRAD -> DEG
const cycleAngleMode = () => {
  if (angleMode.value === 'DEG') {
    angleMode.value = 'RAD';
  } else if (angleMode.value === 'RAD') {
    angleMode.value = 'GRAD';
  } else {
    angleMode.value = 'DEG';
  }
  
  emit('mode-toggle', { mode: 'ANGLE', value: angleMode.value });
};

const handleModeToggle = (mode) => {
  if (mode === 'F-E') {
    notationMode.value = notationMode.value === 'F-E' ? 'SCI' : 'F-E';
    emit('mode-toggle', { mode, value: notationMode.value });
  } else if (mode === 'HYP') {
    hyperbolicMode.value = !hyperbolicMode.value;
    emit('mode-toggle', { mode, value: hyperbolicMode.value });
  }
};

const toggleSecondFunction = () => {
  secondFunctionActive.value = !secondFunctionActive.value;
};

const toggleTrigSecondFunction = () => {
  trigSecondFunctionActive.value = !trigSecondFunctionActive.value;
};
</script>
