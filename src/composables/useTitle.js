import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import { isHandlingError, networkStatus } from '@/router/errorHandler';

/** @type {import('vue').Ref<string>} */
const currentTitle = ref('Mathlly');
/** @type {import('vue').Ref<string>} */
const titleHistory = ref([]);

/**
 * Manages the page title for the application, handling both static and dynamic title updates.
 * 
 * @typedef {Object} PageTitleReturn
 * @property {(newTitle: string) => void} setTitle - Function to manually set a new page title
 * @property {import('vue').Ref<string>} title - Reactive reference to the current title
 * 
 * @param {string} [title=''] - Initial title to set for the page
 * @returns {PageTitleReturn} Object containing title management utilities
 */
export function useTitle(title = '') {
  const route = useRoute();
  const titleRef = ref(title);

  /**
   * Sets a new page title with proper formatting
   * @param {string} newTitle - The new title to set
   * @returns {void}
   */
  const setTitle = useDebounceFn((newTitle) => {
    if (isHandlingError.value && !route.meta.errorPage) return;

    const formattedTitle = newTitle ? `${newTitle} - Mathlly` : 'Mathlly';

    titleHistory.value.push(formattedTitle);
    if (titleHistory.value.length > 5) titleHistory.value.shift();
      if (titleHistory.value[titleHistory.value.length - 1] === formattedTitle) {
        currentTitle.value = formattedTitle;
        document.title = formattedTitle;
      }
  }, 50);

  // Watch for title prop changes
  watch(
    titleRef,
    (newTitle) => {
      setTitle(newTitle);
    },
    { immediate: true }
  );

  // Watch for route changes to ensure title is updated
  watch(
    () => route.path,
    () => {
      if (title) {
        setTitle(title);
      }
    }
  );

  watch(networkStatus, (isOnline) => {
    if (!isOnline && !route.meta.errorPage) {
      const offlineTitle = title ? `${title} (Offline)` : 'Offline';
      setTitle(offlineTitle);
    } else if (isOnline && title) {
      setTitle(title);
    }
  })

  return {
    setTitle,
    title: titleRef,
    currentTitle
  };
}