import { shallowRef } from 'vue';
import { TransitionPresets } from '@vueuse/core';

// Separate utility for anime.js operations
import { createAnimeUtils } from '@/utils/animation/animeUtils';

/**
 * Composable for managing reusable animations
 *
 * @returns {Object} Animation utilities and handlers
 */
export function useAnimation() {
  const isInitialAnimation = shallowRef(true);
  
  // Get anime.js utilities
  const { getAnime, animateElements } = createAnimeUtils();

  /**
   * Sets the initial animation state
   */
  const setInitialAnimation = (value = true) => {
    isInitialAnimation.value = value;
  };

  /**
   * Creates animation handlers for Vue transitions
   * @param {Object} options - Base animation options
   * @returns {Object} Common animation handlers
   */
  const createAnimationHandlers = (options = {}) => {
    const {
      enterDuration = 300,
      enterEasing = 'easeOutCubic',
      leaveDuration = 300,
      leaveEasing = 'easeOutCubic',
    } = options;

    return {
      // Common animation properties
      durations: { enter: enterDuration, leave: leaveDuration },
      easings: { enter: enterEasing, leave: leaveEasing },
    };
  };

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
      enterTransform = [-20, 0],
      enterAxis = 'y',
      leaveTransform = [0, 80],
      leaveAxis = 'x',
    } = options;

    const baseHandlers = createAnimationHandlers(options);

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
    const onEnter = async (el, done) => {
      const anime = await getAnime();
      
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
        const animProps = {
          targets: el,
          opacity: [0, 1],
          duration: baseHandlers.durations.enter,
          easing: baseHandlers.easings.enter,
          complete: () => {
            done();
            el.style.opacity = '';
            el.style.transform = '';
          },
        };

        animProps[`translate${enterAxis.toUpperCase()}`] = enterTransform;

        anime(animProps);
      }
    };

    /**
     * Handles animation when an element leaves
     */
    const onLeave = async (el, done) => {
      const anime = await getAnime();
      
      const animProps = {
        targets: el,
        opacity: [1, 0],
        duration: baseHandlers.durations.leave,
        easing: baseHandlers.easings.leave,
        complete: done,
      };

      animProps[`translate${leaveAxis.toUpperCase()}`] = leaveTransform;

      anime(animProps);
    };

    return {onBeforeEnter, onEnter, onLeave};
  };

  /**
   * Creates a list animation with smooth item removal
   *
   * @param {Object} options - Animation options
   * @returns {Object} Animation handlers
   */
  const createListAnimation = (options = {}) => {
    const {
      moveEasing = 'easeInOutQuad',
      moveDuration = 300,
      moveDelay = 150,
    } = options;

    // Basic animations
    const { onBeforeEnter, onEnter } = createStaggeredAnimation(options);

    /**
     * Handles animation when an element leaves
     * This special version handles the "slide up" effect for remaining items
     */
    const onLeave = async (el, done) => {
      const anime = await getAnime();
      const { leaveAxis = 'x', leaveTransform = [0, 80], leaveDuration = 300, leaveEasing = 'easeOutCubic' } = options;
      
      // Get element dimensions
      const height = el.offsetHeight;
      const marginBottom = parseInt(window.getComputedStyle(el).marginBottom, 10) || 0;
      const totalHeight = height + marginBottom;

      // Find elements below
      const parent = el.parentNode;
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(el);
      const elementsBelow = siblings.slice(index + 1);

      // Animate the element being removed
      animateElements(el, {
        opacity: [1, 0],
        [`translate${leaveAxis.toUpperCase()}`]: leaveTransform,
        duration: leaveDuration,
        easing: leaveEasing
      });

      // Animate elements below with delay
      if (elementsBelow.length > 0) {
        anime({
          targets: elementsBelow,
          translateY: [`0px`, `-${totalHeight}px`],
          duration: moveDuration,
          easing: moveEasing,
          delay: moveDelay,
          complete: () => {
            elementsBelow.forEach(el => { el.style.transform = ''; });
            done();
          },
        });
      } else {
        setTimeout(done, leaveDuration);
      }
    };

    return {onBeforeEnter, onEnter, onLeave};
  };

  /**
   * Creates a simple fade animation using VueUse
   */
  const createFadeAnimation = (options = {}) => {
    const { duration = 300 } = options;
    
    const onBeforeEnter = (el) => {
      el.style.opacity = '0';
    };

    const onEnter = async (el, done) => {
      const anime = await getAnime();
      
      anime({
        targets: el,
        opacity: [0, 1],
        duration,
        easing: TransitionPresets.easeOutCubic.toString(),
        complete: () => {
          done();
          el.style.opacity = '';
        },
      });
    };

    const onLeave = async (el, done) => {
      const anime = await getAnime();
      
      anime({
        targets: el,
        opacity: [1, 0],
        duration,
        easing: TransitionPresets.easeOutCubic.toString(),
        complete: done,
      });
    };

    return {onBeforeEnter, onEnter, onLeave};
  };

  /**
   * Creates a logo animation specifically for the mathlly logo
   *
   * @param {Object} options - Animation options
   * @returns {Object} Animation control functions
   */
const createLogoAnimation = (options = {}) => {
  const { elements, prefersReducedMotion, isVisible } = options;
  let firstTimeline = null;
  let secondTimeline = null;

  const playAnimation = async () => {
    if (isVisible && isVisible.value === false) return;
    
    const anime = await getAnime();
    const { 
      slashTop, slashBottom, bracketLeft, bracketRight,
      letterM, letterA, letterT, letterH, letterY 
    } = elements;

    if (!anime || !slashTop.value || !slashBottom.value) return;

    // Use simplified animations if reduced motion is preferred
    if (prefersReducedMotion?.value) {
      await animateElements([
        slashTop.value, slashBottom.value, letterM.value, letterA.value,
        letterT.value, letterH.value, letterY.value, bracketLeft.value, bracketRight.value
      ], {
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad'
      });
      return;
    }

    // Create and play animations
    secondTimeline = anime({
      targets: [bracketLeft.value, bracketRight.value],
      opacity: [0.5, 1],
      duration: 1000,
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutSine',
      autoplay: false,
    });

    // Create timeline directly with anime
    firstTimeline = anime.timeline({
      easing: 'easeOutExpo',
      autoplay: false
    });

    // Add animations to timeline
    firstTimeline
      .add({
        targets: slashTop.value,
        translateY: ['-100%', '0%'],
        opacity: [0, 1],
        duration: 600,
      })
      .add({
        targets: slashBottom.value,
        translateY: ['100%', '0%'],
        opacity: [0, 1],
        duration: 600,
      }, '-=400')
      .add({
        targets: [letterM.value, letterA.value, letterT.value, letterH.value, letterY.value],
        opacity: [0, 1],
        translateY: [10, 0],
        delay: anime.stagger(100),
        duration: 400,
      }, '-=200')
      .add({
        targets: [bracketLeft.value, bracketRight.value],
        opacity: [0, 0.5],
        translateX: (el, i) => [i === 0 ? -20 : 20, 0],
        duration: 400,
        complete: () => secondTimeline.play(),
      }, '-=200');

    firstTimeline.play();
  };

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

  return { playAnimation, stopAnimation };
};


  /**
   * Creates a slide animation for transitioning between elements
   */
const createSlideAnimation = (options = {}) => {
  const {
    duration = 300,
    easing = 'cubicBezier(0.25, 0.1, 0.25, 1)',
    inputOpacityRange = [1, 0],
    resultOpacityRange = [0, 1],
    inputTranslateY = [0, '-100%'],
    resultTranslateY = ['100%', 0],
  } = options;

  const animateSlide = async (resultContainer, inputContainer) => {
    if (!resultContainer || !inputContainer) return;
    
    const anime = await getAnime();

    // Set initial positions
    anime.set(resultContainer, { 
      translateY: resultTranslateY[0], 
      opacity: resultOpacityRange[0] 
    });
    
    anime.set(inputContainer, { 
      translateY: inputTranslateY[0], 
      opacity: inputOpacityRange[0] 
    });

    // Create animation timeline directly with anime
    const timeline = anime.timeline({
      easing,
      duration
    });
    
    timeline
      .add({
        targets: inputContainer,
        translateY: inputTranslateY[1],
        opacity: inputOpacityRange[1],
        easing: 'cubicBezier(0.4, 0.0, 0.2, 1)'
      })
      .add({
        targets: resultContainer,
        translateY: resultTranslateY[1],
        opacity: resultOpacityRange[1],
        easing: 'cubicBezier(0.4, 0.0, 0.2, 1)'
      }, `-=${duration - 50}`);
  };

  const resetPositions = async (resultContainer, inputContainer) => {
    if (!resultContainer || !inputContainer) return;
    
    const anime = await getAnime();

    anime.set(resultContainer, {
      translateY: resultTranslateY[0],
      opacity: resultOpacityRange[0]
    });

    anime.set(inputContainer, {
      translateY: inputTranslateY[0],
      opacity: inputOpacityRange[0]
    });
  };

  return { animateSlide, resetPositions };
};

  return {
    isInitialAnimation,
    setInitialAnimation,
    createStaggeredAnimation,
    createFadeAnimation,
    createListAnimation,
    createLogoAnimation,
    createSlideAnimation
  };
}
