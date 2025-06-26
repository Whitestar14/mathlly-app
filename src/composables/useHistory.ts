import { ref, onMounted, type Ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import db from '@/data/db';

/**
 * History item interface
 */
export interface HistoryItem {
  id?: number
  expression: string
  result: string
  timestamp: number
}

/**
 * Maximum number of history items to keep
 */
const MAX_HISTORY_ITEMS = 100;

/**
 * Shared history items state across component instances
 */
const historyItems: Ref<HistoryItem[]> = ref([]);

/**
 * Flag to track if history is currently loading
 */
const isLoading: Ref<boolean> = ref(false);

/**
 * History service interface
 */
export interface UseHistoryReturn {
  historyItems: Ref<HistoryItem[]>
  isLoading: Ref<boolean>
  addToHistory: (expression: string, result: string) => Promise<void>
  deleteItem: (id: number) => Promise<boolean>
  clearAll: () => Promise<boolean>
  loadHistory: () => Promise<boolean>
}

/**
 * Composable for managing calculation history with IndexedDB persistence
 */
export function useHistory(): UseHistoryReturn {
  /**
   * Loads history items from the database
   */
  const loadHistory = async (): Promise<boolean> => {
    // Prevent multiple simultaneous loads
    if (isLoading.value) return false;
    
    isLoading.value = true;
    
    try {
      const items = await db.history
        .orderBy('timestamp')
        .reverse()
        .limit(MAX_HISTORY_ITEMS)
        .toArray();

      historyItems.value = items.map(item => ({
        id: item.id,
        expression: item.expression ?? '',
        result: item.result ?? '',
        timestamp: item.timestamp
      }));
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
   */
  const addToHistory = useDebounceFn(async (expression: string, result: string): Promise<void> => {
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
   */
  const deleteItem = async (id: number): Promise<boolean> => {
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
   */
  const clearAll = async (): Promise<boolean> => {
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
