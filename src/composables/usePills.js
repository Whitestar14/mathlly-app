import { ref, watch, nextTick, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

export function usePills(options = {}) {
  const {
    onNavigate = null,
    indicatorHeight = 15,
    verticalOffset = 7,
    horizontalOffset = 7,
    position = "left",
    indicatorWidth = 2,
    updateRoute = true,
    defaultPill = "",
    hideIndicatorPaths = [],
  } = options;

  const currentPill = ref(defaultPill);

  const indicatorPosition = ref(0);
  const showIndicator = ref(false);

  const route = useRoute();
  const router = useRouter();

  const styleMap = {
    left: {
      mainDimension: "top",
      mainSize: "height",
      crossSize: "width",
      mainOffset: verticalOffset,
      crossValue: indicatorWidth + "px",
      mainUnit: "px",
      crossUnit: "px",
    },
    right: {
      mainDimension: "top",
      mainSize: "height",
      crossSize: "width",
      mainOffset: verticalOffset,
      crossValue: indicatorWidth + "px",
      mainUnit: "px",
      crossUnit: "px",
      crossOffset: "0px",
      crossAlign: "right",
    },
    top: {
      mainDimension: "left",
      mainSize: "width",
      crossSize: "height",
      mainOffset: horizontalOffset,
      crossValue: indicatorWidth + "px",
      mainUnit: "px",
      crossUnit: "px",
      crossOffset: "0px",
      crossAlign: "top",
    },
    bottom: {
      mainDimension: "left",
      mainSize: "width",
      crossSize: "height",
      mainOffset: horizontalOffset,
      crossValue: indicatorWidth + "px",
      mainUnit: "px",
      crossUnit: "px",
      crossOffset: "0px",
      crossAlign: "bottom",
    },
  };

  const getOffset = (element) => {
    const currentStyle = styleMap[position];
    if (!currentStyle || !element) return 0;

    const mainSize =
      element[
        currentStyle.mainSize == "width" ? "offsetWidth" : "offsetHeight"
      ];
    const mainOffset =
      element[currentStyle.mainDimension == "top" ? "offsetTop" : "offsetLeft"];

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
      style[currentStyle.mainDimension == "top" ? "left" : "top"] = "auto";
    }

    return style;
  });

  return {
    currentPill,
    indicatorPosition,
    showIndicator,
    updatePillIndicator,
    selectPill,
    handleNavigation,
    indicatorStyle,
  };
}
