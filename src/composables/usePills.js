import { ref, watch, nextTick, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  useElementVisibility,
  useResizeObserver,
  useMutationObserver,
  useDebounceFn,
} from '@vueuse/core';

export function usePills(options = {}) {
  const {
    onNavigate = null,
    indicatorHeight = 15,
    verticalOffset = 7,
    horizontalOffset = 7,
    position = 'left',
    defaultPill = '',
    indicatorWidth = 2,
    updateRoute = true,
    hideIndicatorPaths = [],
    autoInit = false,
    containerRef = null,
    watchVisibility = false,
  } = options;

  const currentPill = ref(defaultPill);
  const indicatorPosition = ref(0);
  const showIndicator = ref(false);

  const route = useRoute();
  const router = useRouter();

  // Create a ref to track the active element
  const activeElementRef = ref(null);

  // Use VueUse's useElementVisibility to track visibility
  const isElementVisible = useElementVisibility(activeElementRef);

  const styleMap = {
    left: {
      mainDimension: 'top',
      mainSize: 'height',
      crossSize: 'width',
      mainOffset: verticalOffset,
      crossValue: indicatorWidth + 'px',
      mainUnit: 'px',
      crossUnit: 'px',
    },
    right: {
      mainDimension: 'top',
      mainSize: 'height',
      crossSize: 'width',
      mainOffset: verticalOffset,
      crossValue: indicatorWidth + 'px',
      mainUnit: 'px',
      crossUnit: 'px',
      crossOffset: '0px',
      crossAlign: 'right',
    },
    top: {
      mainDimension: 'left',
      mainSize: 'width',
      crossSize: 'height',
      mainOffset: horizontalOffset,
      crossValue: indicatorWidth + 'px',
      mainUnit: 'px',
      crossUnit: 'px',
      crossOffset: '0px',
      crossAlign: 'top',
    },
    bottom: {
      mainDimension: 'left',
      mainSize: 'width',
      crossSize: 'height',
      mainOffset: horizontalOffset,
      crossValue: indicatorWidth + 'px',
      mainUnit: 'px',
      crossUnit: 'px',
      crossOffset: '0px',
      crossAlign: 'bottom',
    },
  };

  const getOffset = (element) => {
    const currentStyle = styleMap[position];
    if (!currentStyle || !element) return 0;

    // Update the activeElementRef to the current element
    activeElementRef.value = element;
    const mainSize =
      element[
        currentStyle.mainSize == 'width' ? 'offsetWidth' : 'offsetHeight'
      ];
    const mainOffset =
      element[currentStyle.mainDimension == 'top' ? 'offsetTop' : 'offsetLeft'];

    return mainOffset + mainSize / 2 - currentStyle.mainOffset;
  };

  const updatePillIndicator = (element, force = false) => {
    if (!element && !force) {
      showIndicator.value = false;
      return;
    }
    if (!element) {
      showIndicator.value = false;
    } else {
      if (hideIndicatorPaths.includes(currentPill.value)) {
        showIndicator.value = false;
        return;
      }

      // Update the activeElementRef to track this element's visibility
      activeElementRef.value = element;

      // Check if element is actually visible
      if (!isElementVisible.value) {
        showIndicator.value = false;
        return;
      }

      indicatorPosition.value = getOffset(element);
      showIndicator.value = true;
    }
  };

  const selectPill = (path) => {
    currentPill.value = path;
  };

  const handleNavigation = async (path, element) => {
    selectPill(path);
    if (updateRoute) {
      await router.push(path);
    }
    nextTick(() => {
      updatePillIndicator(element);
    });

    if (onNavigate) {
      onNavigate(path);
    }
  };

  watch(
    () => route.path,
    (newPath) => {
      // Only update currentPill if updateRoute is true
      // This prevents route changes from affecting local pills
      if (updateRoute) {
        selectPill(newPath);
        nextTick(() => {
          const activeElement = document.querySelector(
            `[data-path="${newPath}"]`
          );
          if (activeElement) {
            updatePillIndicator(activeElement, true);
          } else {
            console.log('[usePills] Element not found for path:', newPath);
          }
        });
      }
    },
    { immediate: updateRoute }
  );

  // Watch for visibility changes
  if (watchVisibility) {
    watch(isElementVisible, async (newIsVisible) => {
      if (newIsVisible) {
        await nextTick();
        await initializePills();
      } else {
        showIndicator.value = false;
      }
    });
  }

  const indicatorStyle = computed(() => {
    const currentStyle = styleMap[position];

    if (!currentStyle) return {};

    const style = {
      [currentStyle.mainDimension]: `${indicatorPosition.value}${currentStyle.mainUnit}`,
      [currentStyle.mainSize]: `${indicatorHeight}${currentStyle.crossUnit}`,
      [currentStyle.crossSize]: `${currentStyle.crossValue}`,
      display: showIndicator.value ? '' : 'none',
    };

    if (currentStyle.crossOffset) {
      style[currentStyle.crossAlign] = `${currentStyle.crossOffset}`;
      style[currentStyle.mainDimension == 'top' ? 'left' : 'top'] = 'auto';
    }

    return style;
  });

  const initializePills = async (initialPillId = null, elementsRef = null) => {
    await nextTick();

    // Important change: prioritize initialPillId, then defaultPill, then currentPill
    const pillId = initialPillId || defaultPill || currentPill.value;
    let pillElement = null;

    // Use the provided elementsRef or fall back to containerRef from options
    const targetRef = elementsRef || containerRef;

    if (targetRef && targetRef.value) {
      // Handle array of elements (like v-for refs)
      if (Array.isArray(targetRef.value)) {
        pillElement = targetRef.value.find(
          (el) => el && el.dataset && el.dataset.path === pillId
        );
        if (!pillElement) {
          console.log(
            '[usePills] No element found in array with data-path:',
            pillId
          );
        }
      } else if (targetRef.value.querySelector) {
        // Handle single element with querySelector
        pillElement = targetRef.value.querySelector(`[data-path="${pillId}"]`);
      }
    }

    // Fallback to document query if not found
    if (!pillElement) {
      pillElement = document.querySelector(`[data-path="${pillId}"]`);
    }

    if (pillElement) {
      selectPill(pillId);
      updatePillIndicator(pillElement, true);
      return true;
    } else {
      console.warn(`[usePills] Element with data-path="${pillId}" not found`);
      return false;
    }
  };

  // Use VueUse's useResizeObserver to detect layout changes
  const resize = useDebounceFn(() => {
    if (isElementVisible.value) initializePills();
  }, 300);

  const mutation = useDebounceFn(() => {
    const activeElement = document.querySelector(
      `[data-path="${currentPill.value}"]`
    );
    if (activeElement) {
      activeElementRef.value = activeElement;
    }
  }, 300);

  if (containerRef) {
    useResizeObserver(containerRef, resize);
  }

  useMutationObserver(document.body, mutation, {
    childList: true,
    subtree: true,
    attributeFilter: ['class', 'style', 'hidden'],
  });

  // Auto-initialization
  if (autoInit) {
    onMounted(async () => {
      // First attempt - immediate
      await nextTick();
      let success = await initializePills();

      if (!success) {
        setTimeout(async () => {
          let retrySuccess = await initializePills();
          if (!retrySuccess) console.warn('[usePills] Auto-init failed.');
        }, 50);
      }
    });
  }

  return {
    currentPill,
    indicatorPosition,
    handleNavigation,
    indicatorStyle,
    initializePills,
  };
}
