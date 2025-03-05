import { ref, onMounted } from "vue";
import { useDebounceFn } from "@vueuse/core";
import db from "@/data/db";

export function useHistory() {
  const MAX_HISTORY_ITEMS = 100;
  const historyItems = ref([]);

  const loadHistory = async () => {
    try {
      const items = await db.history
        .orderBy("timestamp")
        .reverse()
        .limit(MAX_HISTORY_ITEMS)
        .toArray();
      
      historyItems.value = items;
    } catch (error) {
      console.error('Error loading history:', error);
  }
}

const addToHistory = useDebounceFn(async (expression, result) => {
  try {
    // Prevent adding identical consecutive entries
    const lastItem = historyItems.value[0];
    if (lastItem && 
        lastItem.expression === expression && 
        lastItem.result === result) {
      return;
    }

    const timestamp = Date.now();
    await db.history.add({ expression, result, timestamp });
    
    // Fetch updated history to ensure consistency
    await loadHistory();
  } catch (error) {
    console.error('Error adding to history:', error);
  }
}, 100);

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
    loadHistory
  };
}
