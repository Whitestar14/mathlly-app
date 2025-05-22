import { computed } from 'vue';

/**
 * Badge type definitions with their styling
 * @type {Object}
 */
const BADGE_TYPES = {
  soon: {
    text: 'Coming Soon',
    classes: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    notch: 'bg-gray-400 dark:bg-gray-500',
  },
  new: {
    text: 'New',
    classes:
      'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/30',
    notch: 'bg-green-500 dark:bg-green-400',
  },
  custom: {
    text: '',
    classes:
      'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30',
    notch: 'bg-indigo-500 dark:bg-indigo-400',
  },
  special: {
    text: 'Special',
    classes:
      'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/30',
    notch: 'bg-yellow-500 dark:bg-yellow-400',
  },
};

/**
 * Composable for creating consistent badge styling
 * 
 * @param {string} [type='soon'] - Badge type ('soon', 'new', 'custom')
 * @param {string} [customText=''] - Custom text for the badge (used with 'custom' type)
 * @returns {Object} Badge properties and styling
 */
export function useBadge(type = 'soon', customText = '') {
  /**
   * Get the badge configuration based on type
   * @type {import('vue').ComputedRef<Object>}
   */
  const getBadgeProps = computed(() => {
    const badgeConfig = BADGE_TYPES[type] || BADGE_TYPES.soon;
    
    if (type === 'custom') {
      return {
        ...badgeConfig,
        text: customText,
      };
    }
    
    return badgeConfig;
  });

  return {
    getBadgeProps
  };
}
