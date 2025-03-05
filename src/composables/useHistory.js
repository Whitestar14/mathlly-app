import { ref, nextTick } from "vue";
import { useDebounceFn } from "@vueuse/core";
import db from "@/data/db";

export function useHistory() {
  const historyPanelRef = ref(null);
  const historyItems = ref([]);
  const isHistoryOpen = ref(false);

  const addToHistory = useDebounceFn((expression, result) => {
    const timestamp = Date.now();
    db.history.add({ expression, result, timestamp });

    if (historyPanelRef.value) {
      nextTick(() => {
        historyPanelRef.value.updateHistory();
      });
    }
  }, 500);

  const clearHistory = async () => {
    await db.history.clear();
  };

  const toggleHistory = () => {
    isHistoryOpen.value = !isHistoryOpen.value;
  };
  
  const closeHistory = () => {
    isHistoryOpen.value = false;
  };

  const deleteHistoryItem = async (id) => {
    await db.history.delete(id);
  };

  return {
    historyItems,
    historyPanelRef,
    toggleHistory,
    closeHistory,
    addToHistory,
    clearHistory,
    deleteHistoryItem
  };
}
