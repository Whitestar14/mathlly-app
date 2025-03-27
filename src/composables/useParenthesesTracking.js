import { inject, computed } from 'vue';

export function useParenthesesTracking() {
  const calculator = inject('calculator');

  return {
    parenthesesTracker: computed(
      () => calculator?.value?.operations?.parenthesesTracker
    ),
  };
}
