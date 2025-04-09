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
 * Composable for managing calculation history with IndexedDB persistence
 * 
 * @returns {Object} History management API
 */
export function useHistory() {
  /**
   * Loads history items from the database
   * @async
   */
  const loadHistory = async () => {
    try {
      const items = await db.history
        .orderBy('timestamp')
        .reverse()
        .limit(MAX_HISTORY_ITEMS)
        .toArray();

      historyItems.value = items;
    } catch (error) {
      console.error('Error loading history:', error);
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

      // Ensure database consistency without blocking UI
      setTimeout(() => loadHistory(), 500);
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  }, 300);

  /**
   * Deletes a specific history item
   * @async
   * @param {number} id - The ID of the item to delete
   */
  const deleteItem = async (id) => {
    try {
      await db.history.delete(id);
      // Update local state to reflect changes
      historyItems.value = historyItems.value.filter(item => item.id !== id);
    } catch (error) {
      console.error('Error deleting history item:', error);
      // Fallback to full reload if optimistic update fails
      await loadHistory();
    }
  };

  /**
   * Clears all history items
   * @async
   */
  const clearAll = async () => {
    try {
      await db.history.clear();
      historyItems.value = [];
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  // Load history when the composable is first used
  onMounted(() => {
    if (historyItems.value.length === 0) {
      loadHistory();
    }
  });

  return {
    historyItems,
    addToHistory,
    deleteItem,
    clearAll,
    loadHistory,
  };
}
