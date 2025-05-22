import { shallowRef, watch, readonly } from 'vue';
import { useRoute } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import { isHandlingError, networkStatus } from '@/router/errorHandler';

const currentTitle = shallowRef('Mathlly');
const titleHistory = shallowRef([]);
const APP_NAME = 'Mathlly';

/**
 * Manages the page title for the application, handling both static and dynamic title updates.
 * 
 * @typedef {Object} PageTitleReturn
 * @property {(newTitle: string) => void} setTitle - Function to manually set a new page title
 * @property {import('vue').Ref<string>} title - Reactive reference to the current title
 * @property {import('vue').Ref<string>} currentTitle - Read-only reference to the current document title
 * 
 * @param {string} [title=''] - Initial title to set for the page
 * @returns {PageTitleReturn} Object containing title management utilities
 */
export function useTitle(title = '') {
  const route = useRoute();
  const titleRef = shallowRef(title);

  /**
   * Formats a title with the app name
   * @param {string} newTitle - The title to format
   * @returns {string} The formatted title
   */
  const formatTitle = (newTitle) => {
    return newTitle ? `${newTitle} - ${APP_NAME}` : APP_NAME;
  };

  /**
   * Sets a new page title with proper formatting and history tracking
   * @param {string} newTitle - The new title to set
   */
  const setTitle = useDebounceFn((newTitle) => {
    if (isHandlingError.value && !route.meta.errorPage) return;

    const formattedTitle = formatTitle(newTitle);

    if (titleHistory.value.length >= 5) {
      titleHistory.value.shift();
    }
    titleHistory.value.push(formattedTitle);

    if (document.title !== formattedTitle) {
      document.title = formattedTitle;
      currentTitle.value = formattedTitle;
    }
  }, 50);

  watch(
    [titleRef, () => route.path, networkStatus],
    ([newTitle, , isOnline]) => {
      if (!isOnline && !route.meta.errorPage) {
        const offlineTitle = (newTitle || title) ? `${newTitle || title} (Offline)` : 'Offline';
        setTitle(offlineTitle);
      } else {
        setTitle(newTitle || title);
      }
    },
    { immediate: true }
  );

  return {
    setTitle,
    title: titleRef,
    currentTitle: readonly(currentTitle)
  };
}