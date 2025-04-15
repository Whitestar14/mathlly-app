import { ref } from 'vue';
import anime from 'animejs';

/**
 * Composable for managing history item animations
 *
 * @returns {Object} Animation handlers
 */
export function useHistoryAnimation() {
  const isInitialLoad = ref(true);

  /**
   * Handles animation before an element enters
   */
  const onBeforeEnter = (el) => {
    el.style.opacity = '0';

    // For new items (not initial load), prepare for slide-in
    if (!isInitialLoad.value) {
      el.style.transform = 'translateY(-20px)';
    }
  };

  /**
   * Handles animation when an element enters
   */
  const onEnter = (el, done) => {
    // For initial load, use staggered fade-in
    if (isInitialLoad.value) {
      anime({
        targets: el,
        opacity: [0, 1],
        duration: 400,
        delay: el.dataset.index * 50, // Stagger based on index
        easing: 'easeOutCubic',
        complete: () => {
          done();
          el.style.opacity = '';
        },
      });
    } else {
      // For new items, slide in from top
      anime({
        targets: el,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 300,
        easing: 'easeOutCubic',
        complete: () => {
          done();
          el.style.opacity = '';
          el.style.transform = '';
        },
      });
    }
  };

  /**
   * Handles animation when an element leaves
   */
  const onLeave = (el, done) => {
    // Slide out to the right when removing
    anime({
      targets: el,
      opacity: [1, 0],
      translateX: [0, 80],
      duration: 300,
      easing: 'easeOutCubic',
      complete: done,
    });
  };

  /**
   * Resets the initial load state
   */
  const resetInitialLoad = () => {
    isInitialLoad.value = false;
  };

  /**
   * Sets the initial load state
   */
  const setInitialLoad = (value = true) => {
    isInitialLoad.value = value;
  };

  return {
    isInitialLoad,
    onBeforeEnter,
    onEnter,
    onLeave,
    resetInitialLoad,
    setInitialLoad,
  };
}
