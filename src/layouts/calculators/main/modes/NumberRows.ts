import { markRaw } from 'vue';
import { Delete, ChevronsRightIcon, ChevronsLeftIcon } from 'lucide-vue-next';

export interface ButtonConfig {
  value: string;
  variant: 'number' | 'operator' | 'function' | 'memory';
  display?: string;
  icon?: any;
  checkMaxLength?: boolean;
}

// Common number pad (used by all modes)
export const numberRows = markRaw<ButtonConfig[][]>([
  // Row 1: 7-8-9-×
  [
    { value: '7', variant: 'number' },
    { value: '8', variant: 'number' },
    { value: '9', variant: 'number' },
    { value: '×', variant: 'operator' }
  ],
  // Row 2: 4-5-6--
  [
    { value: '4', variant: 'number' },
    { value: '5', variant: 'number' },
    { value: '6', variant: 'number' },
    { value: '-', variant: 'operator' }
  ],
  // Row 3: 1-2-3-+
  [
    { value: '1', variant: 'number' },
    { value: '2', variant: 'number' },
    { value: '3', variant: 'number' },
    { value: '+', variant: 'operator' }
  ],
  // Row 4: ±-0-.-=
  [
    { value: '±', variant: 'function' },
    { value: '0', variant: 'number' },
    { value: '.', variant: 'number' },
    { value: '=', variant: 'operator' }
  ]
]);

// Standard mode specific rows
export const standardFirstRow = markRaw<ButtonConfig[]>([
  { value: '%', variant: 'function', checkMaxLength: true },
  { value: 'CE', variant: 'function' },
  { value: 'C', variant: 'function' },
  { value: 'backspace', variant: 'function', icon: Delete }
]);

export const standardSecondRow = markRaw<ButtonConfig[]>([
  { value: '1/x', variant: 'function', display: '¹⁄ₓ' },
  { value: 'x²', variant: 'function', display: 'x²' },
  { value: '√', variant: 'function', display: '√x' },
  { value: '÷', variant: 'operator' }
]);

// Scientific mode specific rows
export const scientificFirstRow = markRaw<ButtonConfig[]>([
  { value: '(', variant: 'function' },
  { value: ')', variant: 'function' },
  { value: 'n!', variant: 'function' },
  { value: 'C', variant: 'function' }
]);

export const scientificSecondRow = markRaw<ButtonConfig[]>([
  { value: 'π', variant: 'function' },
  { value: 'e', variant: 'function' },
  { value: 'exp', variant: 'function' },
  { value: 'backspace', variant: 'function', icon: Delete }
]);

export const scientificThirdRow = markRaw<ButtonConfig[]>([
  { value: '1/x', variant: 'function' },
  { value: '|x|', variant: 'function' },
  { value: 'mod', variant: 'function' },
  { value: '÷', variant: 'operator' }
]);

// Programmer mode specific rows
export const programmerFirstRow = markRaw<ButtonConfig[]>([
  { value: '<<', variant: 'function', icon: ChevronsLeftIcon, checkMaxLength: true },
  { value: '>>', variant: 'function', icon: ChevronsRightIcon, checkMaxLength: true },
  { value: 'CE', variant: 'function' },
  { value: 'backspace', variant: 'function', icon: Delete }
]);

export const programmerSecondRow = markRaw<ButtonConfig[]>([
  { value: '(', variant: 'function' },
  { value: ')', variant: 'function' },
  { value: '%', variant: 'function' },
  { value: '÷', variant: 'operator' }
]);

// Common memory operations
export const memoryOperations = markRaw<string[]>(['MC', 'MR', 'M+', 'M-', 'MS']);

// Programmer mode hex letters
export const hexLetters = markRaw<string[]>(['A', 'B', 'C', 'D', 'E', 'F']);

// Scientific functions for left column
export const scientificFunctions = markRaw([
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

// Trigonometric functions
export const primaryTrigFunctions = markRaw([
  { value: 'sin', display: 'sin' },
  { value: 'cos', display: 'cos' },
  { value: 'tan', display: 'tan' },
  { value: 'asin', display: 'sin⁻¹' },
  { value: 'acos', display: 'cos⁻¹' },
  { value: 'atan', display: 'tan⁻¹' }
]);

export const secondaryTrigFunctions = markRaw([
  { value: 'csc', display: 'csc' },
  { value: 'sec', display: 'sec' },
  { value: 'cot', display: 'cot' },
  { value: 'acsc', display: 'csc⁻¹' },
  { value: 'asec', display: 'sec⁻¹' },
  { value: 'acot', display: 'cot⁻¹' }
]);

export const primaryHyperbolicFunctions = markRaw([
  { value: 'sinh', display: 'sinh' },
  { value: 'cosh', display: 'cosh' },
  { value: 'tanh', display: 'tanh' },
  { value: 'asinh', display: 'sinh⁻¹' },
  { value: 'acosh', display: 'cosh⁻¹' },
  { value: 'atanh', display: 'tanh⁻¹' }
]);

export const secondaryHyperbolicFunctions = markRaw([
  { value: 'csch', display: 'csch' },
  { value: 'sech', display: 'sech' },
  { value: 'coth', display: 'coth' },
  { value: 'acsch', display: 'csch⁻¹' },
  { value: 'asech', display: 'sech⁻¹' },
  { value: 'acoth', display: 'coth⁻¹' }
]);

// Additional functions
export const functionsList = markRaw([
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
