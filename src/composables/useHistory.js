import { ref, onMounted } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import db from '@/data/db';

/**
 * Maximum number of history items to keep
 * @type {number}
 */
const MAX_HISTORY_ITEMS = 100;

/**
 * Shared history items state across component instances
 * @type {import('vue').Ref<Array>}
 */
const historyItems = ref([]);

/**
 * Flag to track if history is currently loading
 * @type {import('vue').Ref<boolean>}
 */
const isLoading = ref(false);

/**
 * Composable for managing calculation history with IndexedDB persistence
 * 
 * @returns {Object} History management API
 */
export function useHistory() {
  /**
   * Loads history items from the database
   * @async
   * @returns {Promise<boolean>} Success status
   */
  const loadHistory = async () => {
    // Prevent multiple simultaneous loads
    if (isLoading.value) return false;
    
    isLoading.value = true;
    
    try {
      const items = await db.history
        .orderBy('timestamp')
        .reverse()
        .limit(MAX_HISTORY_ITEMS)
        .toArray();

      historyItems.value = items;
      return true;
    } catch (error) {
      console.error('Error loading history:', error);
      // Fallback to empty array if database access fails
      historyItems.value = [];
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Adds a new calculation to history with debouncing to prevent duplicates
   * @async
   * @param {string} expression - The math expression
   * @param {string} result - The calculated result
   */
  const addToHistory = useDebounceFn(async (expression, result) => {
    try {
      // Prevent duplicate entries
      const lastItem = historyItems.value[0];
      if (lastItem?.expression === expression && lastItem?.result === result) {
        return;
      }

      const timestamp = Date.now();
      const id = await db.history.add({ expression, result, timestamp });

      // Optimistic update for immediate UI feedback
      historyItems.value = [
        { id, expression, result, timestamp },
        ...historyItems.value,
      ];

      // Ensure we don't exceed the maximum number of items in the UI
      if (historyItems.value.length > MAX_HISTORY_ITEMS) {
        historyItems.value = historyItems.value.slice(0, MAX_HISTORY_ITEMS);
      }

      // Ensure database consistency by scheduling a reload
      // Use Promise instead of setTimeout for better reliability
      Promise.resolve().then(() => {
        // Only reload if we're not in the middle of another operation
        if (!isLoading.value) {
          loadHistory();
        }
      });
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  }, 300);

  /**
   * Deletes a specific history item
   * @async
   * @param {number} id - The ID of the item to delete
   * @returns {Promise<boolean>} Success status
   */
  const deleteItem = async (id) => {
    try {
      await db.history.delete(id);
      // Update local state to reflect changes
      historyItems.value = historyItems.value.filter(item => item.id !== id);
      return true;
    } catch (error) {
      console.error('Error deleting history item:', error);
      // Fallback to full reload if optimistic update fails
      await loadHistory();
      return false;
    }
  };

  /**
   * Clears all history items
   * @async
   * @returns {Promise<boolean>} Success status
   */
  const clearAll = async () => {
    try {
      await db.history.clear();
      historyItems.value = [];
      return true;
    } catch (error) {
      console.error('Error clearing history:', error);
      return false;
    }
  };

  // Load history when the composable is first used
  onMounted(() => {
    if (historyItems.value.length === 0 && !isLoading.value) {
      loadHistory();
    }
  });

  return {
    historyItems,
    isLoading,
    addToHistory,
    deleteItem,
    clearAll,
    loadHistory
  };
}
