import { computed } from 'vue';

/**
 * Badge type definitions with their styling
 * @type {Object}
 */
const BADGE_TYPES = {
  soon: {
    text: 'Coming Soon',
    classes: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  },
  new: {
    text: 'New',
    classes:
      'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/30',
  },
  version: {
    text: '', // Will be populated with customText
    classes:
      'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30',
  },
};

/**
 * Composable for creating consistent badge styling
 * 
 * @param {string} [type='soon'] - Badge type ('soon', 'new', 'version')
 * @param {string} [customText=''] - Custom text for the badge (used with 'version' type)
 * @returns {Object} Badge properties and styling
 */
export function useBadge(type = 'soon', customText = '') {
  /**
   * Get the badge configuration based on type
   * @type {import('vue').ComputedRef<Object>}
   */
  const getBadgeProps = computed(() => {
    const badgeConfig = BADGE_TYPES[type] || BADGE_TYPES.soon;
    
    // Handle version badge with custom text
    if (type === 'version') {
      return {
        ...badgeConfig,
        text: customText || 'Version',
      };
    }
    
    return badgeConfig;
  });

  return {
    getBadgeProps,
    badgeClasses: computed(() => getBadgeProps.value.classes),
  };
}
