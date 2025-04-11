import { ref, readonly, onUnmounted } from 'vue';
import { useTimeoutFn, useThrottleFn } from '@vueuse/core';

/**
 * Default toast duration in milliseconds
 * @type {number}
 */
const DEFAULT_DURATION = 5000;

/**
 * Maximum number of toasts to show at once
 * @type {number}
 */
const MAX_TOASTS = 5;

/**
 * Shared toast state across component instances
 * @type {import('vue').Ref<Array>}
 */
const toasts = ref([]);

/**
 * Active timeout cleanup functions
 * @type {Map<number, Function>}
 */
const timeoutCleanups = new Map();

/**
 * Composable for managing toast notifications
 * 
 * @returns {Object} Toast management API
 */
export function useToast() {
  /**
   * Create a throttled function for adding toasts to prevent spam
   * @type {Function}
   */
  const addToast = useThrottleFn((toastData) => {
    const id = Date.now();
    const duration = toastData.duration || DEFAULT_DURATION;
    const zIndex = 50 - toasts.value.length;

    // Limit the number of toasts
    if (toasts.value.length >= MAX_TOASTS) {
      // Remove the oldest toast
      const oldestToast = toasts.value[0];
      removeToast(oldestToast.id);
    }

    // Add the new toast
    toasts.value.push({ 
      id, 
      ...toastData, 
      zIndex: Math.max(1, zIndex) 
    });

    // Set up automatic removal
    const { stop } = useTimeoutFn(() => {
      removeToast(id);
    }, duration);
    
    // Store cleanup function
    timeoutCleanups.set(id, stop);
  }, 500); // 500ms throttle

  /**
   * Show a toast notification
   * 
   * @param {Object} toastData - Toast configuration
   * @param {string} toastData.message - Toast message
   * @param {string} [toastData.type='info'] - Toast type ('info', 'success', 'warning', 'error')
   * @param {number} [toastData.duration=5000] - Duration in milliseconds
   * @param {boolean} [toastData.dismissible=true] - Whether the toast can be dismissed
   */
  const toast = (toastData) => {
    addToast({
      type: 'info',
      dismissible: true,
      ...toastData
    });
  };

  /**
   * Remove a toast by ID
   * 
   * @param {number} id - Toast ID to remove
   */
  const removeToast = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
      
      // Clean up timeout if exists
      if (timeoutCleanups.has(id)) {
        timeoutCleanups.get(id)();
        timeoutCleanups.delete(id);
      }
    }
  };

  /**
   * Shorthand for success toast
   * 
   * @param {string} message - Toast message
   * @param {Object} [options={}] - Additional toast options
   */
  const success = (message, options = {}) => {
    toast({ message, type: 'success', ...options });
  };

  /**
   * Shorthand for error toast
   * 
   * @param {string} message - Toast message
   * @param {Object} [options={}] - Additional toast options
   */
  const error = (message, options = {}) => {
    toast({ message, type: 'error', ...options });
  };

  /**
   * Shorthand for warning toast
   * 
   * @param {string} message - Toast message
   * @param {Object} [options={}] - Additional toast options
   */
  const warning = (message, options = {}) => {
    toast({ message, type: 'warning', ...options });
  };

  /**
   * Clear all toasts
   */
  const clearAll = () => {
    // Clean up all timeouts
    timeoutCleanups.forEach(cleanup => cleanup());
    timeoutCleanups.clear();
    
    // Clear the toasts array
    toasts.value = [];
  };

  // Clean up timeouts when component is unmounted
  onUnmounted(() => {
    timeoutCleanups.forEach(cleanup => cleanup());
    timeoutCleanups.clear();
  });

  return {
    toast,
    success,
    error,
    warning,
    removeToast,
    clearAll,
    toasts: readonly(toasts),
  };
}
