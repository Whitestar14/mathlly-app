import { computed } from 'vue'

export function useBadge(type = 'soon') {
  const badges = {
    soon: {
      text: 'Coming Soon',
      classes: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
    },
    new: {
      text: 'New',
      classes: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
    }
  }

  const getBadgeProps = computed(() => badges[type] || badges.soon)

  return {
    getBadgeProps
  }
}