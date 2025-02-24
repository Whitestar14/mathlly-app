import { ref, watch, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export function usePills(options = {}) {
  const {
    onNavigate = null,
    indicatorHeight = 15,
    verticalOffset = 7
  } = options;

  const currentPill = ref("");
  const indicatorPosition = ref(0);
  const showIndicator = ref(true);
  
  const route = useRoute();
  const router = useRouter();

  const updatePillIndicator = (element) => {
    if (!element) {
      showIndicator.value = false;
      return;
    }

    const offset = element.offsetTop + (element.offsetHeight / 2) - verticalOffset;
    indicatorPosition.value = offset;
    showIndicator.value = true;
  };

  const selectPill = (path) => {
    currentPill.value = path;
  };

  const handleNavigation = async (path, element) => {
    selectPill(path);
    
    await router.push(path);
    
    nextTick(() => {
      if (route.path === path) {
        updatePillIndicator(element);
      }
    });

    if (onNavigate) {
      onNavigate(path);
    }
  };

  // Watch route changes to update pill and indicator
  watch(
    () => route.path,
    (newPath) => {
      selectPill(newPath);
      nextTick(() => {
        const activeElement = document.querySelector(`button[data-path="${newPath}"]`);
        if (activeElement) {
          showIndicator.value = true;
          const offset = activeElement.offsetTop + (activeElement.offsetHeight / 2) - verticalOffset;
          indicatorPosition.value = offset;
        } else {
          showIndicator.value = false;
        }
      });
    },
    { immediate: true }
  );

  return {
    currentPill,
    indicatorPosition,
    showIndicator,
    updatePillIndicator,
    selectPill,
    handleNavigation,
    // Utility getters
    indicatorStyle: computed(() => ({
      top: `${indicatorPosition.value}px`,
      height: `${indicatorHeight}px`
    }))
  };
}
