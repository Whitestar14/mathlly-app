import { shallowRef } from 'vue';
import anime from 'animejs';

/**
 * Composable for managing reusable animations
 *
 * @returns {Object} Animation utilities and handlers
 */
export function useAnimation() {
  const isInitialAnimation = shallowRef(true);

  /**
   * Creates a staggered fade-in animation
   *
   * @param {Object} options - Animation options
   * @returns {Object} Animation handlers
   */
  const createStaggeredAnimation = (options = {}) => {
    const {
      initialDelay = 50,
      initialDuration = 400,
      initialEasing = 'easeOutCubic',
      enterDuration = 300,
      enterEasing = 'easeOutCubic',
      leaveDuration = 300,
      leaveEasing = 'easeOutCubic',
      leaveTransform = [0, 80],
      leaveAxis = 'x',
      enterTransform = [-20, 0],
      enterAxis = 'y',
    } = options;

    /**
     * Handles animation before an element enters
     */
    const onBeforeEnter = (el) => {
      el.style.opacity = '0';

      // For new items (not initial load), prepare for animation
      if (!isInitialAnimation.value) {
        el.style.transform = `translate${enterAxis.toUpperCase()}(${
          enterTransform[0]
        }px)`;
      }
    };

    /**
     * Handles animation when an element enters
     */
    const onEnter = (el, done) => {
      // For initial load, use staggered fade-in
      if (isInitialAnimation.value) {
        anime({
          targets: el,
          opacity: [0, 1],
          duration: initialDuration,
          delay: el.dataset.index * initialDelay, // Stagger based on index
          easing: initialEasing,
          complete: () => {
            done();
            el.style.opacity = '';
          },
        });
      } else {
        // For new items, slide in
        const animProps = {
          targets: el,
          opacity: [0, 1],
          duration: enterDuration,
          easing: enterEasing,
          complete: () => {
            done();
            el.style.opacity = '';
            el.style.transform = '';
          },
        };

        // Add transform property dynamically
        animProps[`translate${enterAxis.toUpperCase()}`] = enterTransform;

        anime(animProps);
      }
    };

    /**
     * Handles animation when an element leaves
     */
    const onLeave = (el, done) => {
      const animProps = {
        targets: el,
        opacity: [1, 0],
        duration: leaveDuration,
        easing: leaveEasing,
        complete: done,
      };

      // Add transform property dynamically
      animProps[`translate${leaveAxis.toUpperCase()}`] = leaveTransform;

      anime(animProps);
    };

    return {
      onBeforeEnter,
      onEnter,
      onLeave,
    };
  };

  /**
   * Creates a list animation with smooth item removal
   *
   * @param {Object} options - Animation options
   * @returns {Object} Animation handlers
   */
  const createListAnimation = (options = {}) => {
    const {
      initialDelay = 50,
      initialDuration = 400,
      initialEasing = 'easeOutCubic',
      enterDuration = 300,
      enterEasing = 'easeOutCubic',
      leaveDuration = 300,
      leaveEasing = 'easeOutCubic',
      enterTransform = [-20, 0],
      leaveTransform = [0, 80],
      leaveAxis = 'x',
      moveEasing = 'easeInOutQuad',
      moveDuration = 300,
    } = options;

    // Basic animations
    const { onBeforeEnter, onEnter } = createStaggeredAnimation({
      initialDelay,
      initialDuration,
      initialEasing,
      enterDuration,
      enterEasing,
      enterTransform,
    });

    /**
     * Handles animation when an element leaves
     * This special version handles the "slide up" effect for remaining items
     */
    const onLeave = (el, done) => {
      // First, get the height of the element being removed
      const height = el.offsetHeight;
      const marginBottom =
        parseInt(window.getComputedStyle(el).marginBottom, 10) || 0;
      const totalHeight = height + marginBottom;

      // Find all elements that come after this one
      const parent = el.parentNode;
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(el);
      const elementsBelow = siblings.slice(index + 1);

      // Animate the element being removed
      const leaveProps = {
        targets: el,
        opacity: [1, 0],
        duration: leaveDuration,
        easing: leaveEasing,
      };

      // Add transform property dynamically
      leaveProps[`translate${leaveAxis.toUpperCase()}`] = leaveTransform;

      // Start the leave animation
      anime(leaveProps);

      // Animate all elements below to move up
      if (elementsBelow.length > 0) {
        anime({
          targets: elementsBelow,
          translateY: [`0px`, `-${totalHeight}px`],
          duration: moveDuration,
          easing: moveEasing,
          complete: () => {
            // Reset the transform after animation completes
            elementsBelow.forEach((el) => {
              el.style.transform = '';
            });
            done();
          },
        });
      } else {
        // If no elements below, just call done when leave animation completes
        setTimeout(done, leaveDuration);
      }
    };

    return {
      onBeforeEnter,
      onEnter,
      onLeave,
    };
  };

  /**
   * Sets the initial animation state
   */
  const setInitialAnimation = (value = true) => {
    isInitialAnimation.value = value;
  };

  /**
   * Creates a simple fade animation
   */
  const createFadeAnimation = (options = {}) => {
    const { duration = 300, easing = 'easeOutCubic' } = options;

    const onBeforeEnter = (el) => {
      el.style.opacity = '0';
    };

    const onEnter = (el, done) => {
      anime({
        targets: el,
        opacity: [0, 1],
        duration,
        easing,
        complete: () => {
          done();
          el.style.opacity = '';
        },
      });
    };

    const onLeave = (el, done) => {
      anime({
        targets: el,
        opacity: [1, 0],
        duration,
        easing,
        complete: done,
      });
    };

    return {
      onBeforeEnter,
      onEnter,
      onLeave,
    };
  };

  /**
   * Creates a logo animation specifically for the mathlly logo
   *
   * @param {Object} options - Animation options
   * @returns {Object} Animation control functions
   */
  const createLogoAnimation = (options = {}) => {
    const { elements, prefersReducedMotion, isVisible } = options;

    // Animation timeline references
    let firstTimeline = null;
    let secondTimeline = null;

    // Dynamically import anime.js
    const animeInstance = shallowRef(null);

    // Import anime.js asynchronously
    const importAnime = async () => {
      if (!animeInstance.value) {
        animeInstance.value = (await import('animejs')).default;
      }
      return animeInstance.value;
    };

    /**
     * Initialize and play the animation
     */
    const playAnimation = async () => {
    if (isVisible && isVisible.value === false) {
      return;
    }
      // Make sure anime.js is loaded
      const anime = await importAnime();

      // Make sure all elements are available
      const {
        slashTop,
        slashBottom,
        bracketLeft,
        bracketRight,
        letterM,
        letterA,
        letterT,
        letterH,
        letterY,
      } = elements;

      if (!anime || !slashTop.value || !slashBottom.value) return;

      // Use simplified animations if reduced motion is preferred
      if (prefersReducedMotion?.value) {
        // Simple fade-in for reduced motion
        anime({
          targets: [
            slashTop.value,
            slashBottom.value,
            letterM.value,
            letterA.value,
            letterT.value,
            letterH.value,
            letterY.value,
            bracketLeft.value,
            bracketRight.value,
          ],
          opacity: [0, 1],
          duration: 600,
          easing: 'easeOutQuad',
        });
        return;
      }

      // Continuous animations
      secondTimeline = anime({
        targets: [bracketLeft.value, bracketRight.value],
        opacity: [0.5, 1],
        duration: 1000,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine',
        autoplay: false,
      });

      firstTimeline = anime.timeline({
        easing: 'easeOutExpo',
        autoplay: false,
      });

      // Slashes animation with better timing
      firstTimeline
        .add({
          targets: slashTop.value,
          translateY: ['-100%', '0%'],
          opacity: [0, 1],
          duration: 600,
        })
        .add(
          {
            targets: slashBottom.value,
            translateY: ['100%', '0%'],
            opacity: [0, 1],
            duration: 600,
          },
          '-=400'
        )

        // Individual letters stagger animation
        .add(
          {
            targets: [
              letterM.value,
              letterA.value,
              letterT.value,
              letterH.value,
              letterY.value,
            ],
            opacity: [0, 1],
            translateY: [10, 0],
            delay: anime.stagger(100),
            duration: 400,
          },
          '-=200'
        )

        // Brackets animation
        .add(
          {
            targets: [bracketLeft.value, bracketRight.value],
            opacity: [0, 0.5],
            translateX: (el, i) => [i === 0 ? -20 : 20, 0],
            duration: 400,
            complete: () => secondTimeline.play(),
          },
          '-=200'
        );

      // Play the animation
      firstTimeline.play();
    };

    /**
     * Stop and clean up the animation
     */
    const stopAnimation = () => {
      if (firstTimeline) {
        firstTimeline.pause();
        firstTimeline = null;
      }
      if (secondTimeline) {
        secondTimeline.pause();
        secondTimeline = null;
      }
    };

    return {
      playAnimation,
      stopAnimation,
    };
  };

  return {
    isInitialAnimation,
    setInitialAnimation,
    createStaggeredAnimation,
    createFadeAnimation,
    createListAnimation,
    createLogoAnimation,
  };
}
