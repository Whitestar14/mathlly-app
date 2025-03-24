import { ref, watch, nextTick, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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
  } = options;

  const currentPill = ref(defaultPill);
  const indicatorPosition = ref(0);
  const showIndicator = ref(false);

  const route = useRoute();
  const router = useRouter();

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
      selectPill(newPath);
      nextTick(() => {
        const activeElement = document.querySelector(
          `[data-path="${newPath}"]`
        );
        if (activeElement) {
          updatePillIndicator(activeElement, true);
        }
      });
    },
    { immediate: true }
  );

  const indicatorStyle = computed(() => {
    const currentStyle = styleMap[position];

    if (!currentStyle) return {};

    const style = {
      [currentStyle.mainDimension]: `${indicatorPosition.value}${currentStyle.mainUnit}`,
      [currentStyle.mainSize]: `${indicatorHeight}${currentStyle.crossUnit}`,
      [currentStyle.crossSize]: `${currentStyle.crossValue}`,
    };

    if (currentStyle.crossOffset) {
      style[currentStyle.crossAlign] = `${currentStyle.crossOffset}`;
      style[currentStyle.mainDimension == 'top' ? 'left' : 'top'] = 'auto';
    }

    return style;
  });

  const initializePills = async (initialPillId = null, elementsRef = null) => {
    await nextTick();
    
    const pillId = initialPillId || currentPill.value || defaultPill;
    let pillElement = null;
    
    // Use the provided elementsRef or fall back to containerRef from options
    const targetRef = elementsRef || containerRef;
    
    if (targetRef && targetRef.value) {
      // Handle array of elements (like v-for refs)
      if (Array.isArray(targetRef.value)) {
        pillElement = targetRef.value.find(
          (el) => el && el.dataset && el.dataset.path === pillId
        );
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

  // Improved auto-initialization with retry logic
  if (autoInit) {
    onMounted(async () => {
      // First attempt - immediate
      let success = await initializePills();
      
      // If first attempt fails, try again after a short delay
      // This helps when components render children asynchronously
      if (!success) {
        setTimeout(async () => {
          await initializePills();
        }, 50);
      }
    });
  }


  return {
    currentPill,
    indicatorPosition,
    showIndicator,
    updatePillIndicator,
    selectPill,
    handleNavigation,
    indicatorStyle,
    initializePills,
  };
}
