import { ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import db from '@/data/db';

const historyItems = ref([]);

export function useHistory() {
  const MAX_HISTORY_ITEMS = 100;

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

  const addToHistory = useDebounceFn(async (expression, result) => {
    try {
      const lastItem = historyItems.value[0];
      if (lastItem?.expression === expression && lastItem?.result === result) {
        return;
      }

      const timestamp = Date.now();
      const id = await db.history.add({ expression, result, timestamp });

      // Optimistic update
      historyItems.value = [
        { id, expression, result, timestamp },
        ...historyItems.value,
      ];

      // Ensure consistency without triggering animation
      setTimeout(() => loadHistory(), 500);
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  }, 300);

  // Simplified database operations
  const deleteItem = async (id) => {
    await db.history.delete(id);
    await loadHistory();
  };

  const clearAll = async () => {
    await db.history.clear();
    historyItems.value = [];
  };

  return {
    historyItems,
    addToHistory,
    deleteItem,
    clearAll,
    loadHistory,
  };
}
