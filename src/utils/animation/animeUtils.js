/**
 * Utility functions for anime.js animations
 * @returns {Object} Anime.js utility functions
 */
export function createAnimeUtils() {
  // Lazy-loaded anime.js instance
  let animeInstance = null;

  /**
   * Get or load the anime.js instance
   * @returns {Promise<Object>} The anime.js instance
   */
  const getAnime = async () => {
    if (!animeInstance) {
      animeInstance = (await import('animejs/lib/anime.min.js')).default;
    }
    return animeInstance;
  };

  /**
   * Create an anime.js timeline
   * @param {Object} options - Timeline options
   * @returns {Promise<Object>} Promise resolving to anime.js timeline
   */
  const createTimeline = async (options = {}) => {
    const anime = await getAnime();
    return anime.timeline(options);
  };

  /**
   * Animate elements with anime.js
   * @param {Element|Element[]} elements - Elements to animate
   * @param {Object} properties - Animation properties
   * @returns {Promise<Object>} Promise resolving to anime.js animation instance
   */
  const animateElements = async (elements, properties) => {
    const anime = await getAnime();
    return anime({
      targets: elements,
      ...properties
    });
  };

  return {
    getAnime,
    createTimeline,
    animateElements
  };
}
