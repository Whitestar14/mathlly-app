import { ref, watch, nextTick, computed, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  useElementVisibility,
  useResizeObserver,
  useMutationObserver,
  useDebounceFn,
} from '@vueuse/core';

/**
 * Style configuration for different indicator positions
 * @type {Object}
 */
const STYLE_MAP = markRaw({
  left: { dimension: 'top', offset: 'verticalOffset', align: 'left' },
  right: { dimension: 'top', offset: 'verticalOffset', align: 'right' },
  top: { dimension: 'left', offset: 'horizontalOffset', align: 'top' },
  bottom: { dimension: 'left', offset: 'horizontalOffset', align: 'bottom' },
});

/**
 * A composable for creating a navigation pill system with animated indicators
 *
 * @param {Object} options - Configuration options
 * @param {Function} [options.onNavigate=null] - Callback when navigation occurs
 * @param {number} [options.verticalOffset=7] - Vertical offset for the indicator
 * @param {number} [options.horizontalOffset=7] - Horizontal offset for the indicator
 * @param {string} [options.position="left"] - Position of the indicator ('left', 'right', 'top', 'bottom')
 * @param {string} [options.defaultPill=""] - Default pill to select
 * @param {boolean} [options.updateRoute=true] - Whether to update the route on navigation
 * @param {string[]} [options.hideIndicatorPaths=[]] - Paths where the indicator should be hidden
 * @param {import('vue').Ref} [options.containerRef=null] - Reference to the container element
 *
 * @returns {Object} Pills composable API
 */
export function usePills(options = {}) {
  // Destructure options with defaults
  const {
    onNavigate = null,
    verticalOffset = 7,
    horizontalOffset = 7,
    position = 'left',
    defaultPill = '',
    updateRoute = true,
    hideIndicatorPaths = [],
    containerRef = null,
  } = options;

  // State
  const currentPill = ref(defaultPill);
  const indicatorPosition = ref(0);
  const showIndicator = ref(false);
  const isInitialized = ref(false);
  const activeElementRef = ref(null);

  // Vue Router
  const route = useRoute();
  const router = useRouter();

  // Element visibility tracking
  const isElementVisible = useElementVisibility(activeElementRef);

  const elementCache = new WeakMap();
  /**
   * Calculates the offset position for the indicator
   * @param {HTMLElement} element - The element to calculate offset for
   * @returns {number} The calculated offset
   */
  const getOffset = (element) => {
    if (!element) return 0;

    // Check cache first
    if (elementCache.has(element)) {
      const cached = elementCache.get(element);
      // Only recalculate if element might have moved
      if (Date.now() - cached.timestamp < 100) {
        return cached.offset;
      }
    }

    // Calculate offset
    const isVertical = position === 'left' || position === 'right';
    const size = isVertical ? element.offsetHeight : element.offsetWidth;
    const offset = isVertical ? element.offsetTop : element.offsetLeft;
    const result =
      offset + size / 2 - (isVertical ? verticalOffset : horizontalOffset);

    // Cache result
    elementCache.set(element, {
      offset: result,
      timestamp: Date.now(),
    });

    return result;
  };

  /**
   * Updates the current pill selection
   * @param {string} path - The path to select
   */
  const selectPill = (path) => {
    currentPill.value = path;
  };

  /**
   * Handles navigation to a new pill
   * @param {string} path - The path to navigate to
   * @param {HTMLElement} element - The element that triggered navigation
   */
  const handleNavigation = async (path, element) => {
    selectPill(path);

    if (updateRoute) {
      await router.push(path);
    }

    nextTick(() => updateIndicator(element));

    if (onNavigate) {
      onNavigate(path);
    }
  };

  /**
   * Updates the indicator position based on the active element
   * @param {HTMLElement} element - The element to position the indicator against
   * @param {boolean} [force=false] - Force update even if element is not visible
   */
  const updateIndicator = (element, force = false) => {
    // Early return if no element and not forced
    if (!element && !force) {
      showIndicator.value = false;
      return;
    }

    // Hide indicator if no element or path is in hideIndicatorPaths
    if (!element || hideIndicatorPaths.includes(currentPill.value)) {
      showIndicator.value = false;
      return;
    }

    // Update the activeElementRef to track this element's visibility
    activeElementRef.value = element;

    // Only show indicator if element is visible
    showIndicator.value = isElementVisible.value;
    if (showIndicator.value) {
        indicatorPosition.value = getOffset(element);
    }
  };

  /**
   * Initializes the pills system
   * @param {string} [initialPillId=null] - Initial pill ID to select
   * @param {import('vue').Ref} [elementsRef=null] - Reference to elements container
   * @returns {boolean} Success status
   */
  const initializePills = async (initialPillId = null, elementsRef = null) => {
    await nextTick();

    // Determine which pill ID to use
    const pillId =
      initialPillId ||
      (isInitialized.value
        ? currentPill.value
        : defaultPill || currentPill.value);

    let pillElement = null;
    const targetRef = elementsRef || containerRef;

    // Try to find the element in the provided ref
    if (targetRef?.value) {
      if (Array.isArray(targetRef.value)) {
        pillElement = targetRef.value.find(
          (el) => el?.dataset?.path === pillId
        );
      } else if (targetRef.value.querySelector) {
        pillElement = targetRef.value.querySelector(`[data-path="${pillId}"]`);
      }
    }

    // Fallback to document query if not found
    if (!pillElement) {
      pillElement = document.querySelector(`[data-path="${pillId}"]`);
    }

    if (pillElement) {
      selectPill(pillId);
      updateIndicator(pillElement, true);
      isInitialized.value = true;
      return true;
    }

    console.warn(`[usePills] Element with data-path="${pillId}" not found`);
    return false;
  };

  // Computed styles for the indicator
  const indicatorStyle = computed(() => {
    const style = STYLE_MAP[position];
    if (!style) return {};

    // Base style with position
    const result = {
      [style.dimension]: `${indicatorPosition.value}px`,
      display: showIndicator.value ? '' : 'none',
    };

    // Add alignment if not left/top (which are default)
    if (style.align === 'right' || style.align === 'bottom') {
      result[style.align] = '0px';
      // Set the opposite property to auto
      result[style.dimension === 'top' ? 'left' : 'top'] = 'auto';
    }

    return result;
  });

  // Watch for route changes to update the selected pill
  watch(
    () => route.path,
    (newPath) => {
      if (updateRoute) {
        selectPill(newPath);
        nextTick(() => {
          const activeElement = document.querySelector(
            `[data-path="${newPath}"]`
          );
          if (activeElement) {
            updateIndicator(activeElement);
          } else {
            console.log('[usePills] Element not found for path:', newPath);
          }
        });
      }
    },
    { immediate: updateRoute }
  );

  // Watch for visibility changes of the active element
  watch(isElementVisible, async (newIsVisible) => {
    if (newIsVisible) {
      await nextTick();
      await initializePills();
    } else {
      showIndicator.value = false;
    }
  });

  // Debounced function for handling resize and DOM mutations
  const optimize = useDebounceFn(() => {
    if (isElementVisible.value) {
      initializePills();
    }

    const activeElement = document.querySelector(
      `[data-path="${currentPill.value}"]`
    );
    if (activeElement) {
      activeElementRef.value = activeElement;
    }
  }, 50);

  // Set up resize observer if container ref is provided
  if (containerRef) {
    useResizeObserver(containerRef, optimize);
  }

  // Set up mutation observer to handle DOM changes
  useMutationObserver(
    document.body,
    optimize,
    {
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'style', 'hidden'],
    },
    { passive: true }
  );

  // Return the public API
  return {
    currentPill,
    indicatorPosition,
    handleNavigation,
    indicatorStyle,
    initializePills,
  };
}
