import { markRaw } from 'vue';

export const numberRows = markRaw([
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
    { value: '±', variant: 'number' },
    { value: '0', variant: 'number' },
    { value: '.', variant: 'number' },
    { value: '=', variant: 'operator' }
  ]
]);