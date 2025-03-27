import { computed } from 'vue';

export function useBadge(type = 'soon', customText = '') {
  const badges = {
    soon: {
      text: 'Coming Soon',
      classes: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    },
    new: {
      text: 'New',
      classes:
        'bg-indigo-50 dark:bg-gray-800/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-gray-800',
    },
    version: {
      text: customText || 'Version',
      classes:
        'bg-indigo-50 dark:bg-gray-800/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-gray-800',
    },
  };

  const getBadgeProps = computed(() => badges[type] || badges.soon);

  return {
    getBadgeProps,
  };
}
