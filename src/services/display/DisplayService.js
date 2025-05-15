import { DisplayFormatter } from './DisplayFormatter'
import { ParenthesesHighlighter } from '@/utils/display/ParenthesesHighlighter'
import { SyntaxHighlighter } from '@/utils/display/SyntaxHighlighter'
import { useAnimation } from '@/composables/useAnimation'

// Create a singleton instance of the animation service
let animationService = null;

export class DisplayService {
  static getFontSizeClass(value, mode, activeBase) {
    if (!value) return 'text-3xl'

    const length = value.toString().length

    if (mode === 'Standard') {
      if (length > 70) return 'text-xl'
      if (length > 50) return 'text-2xl'
      return 'text-3xl'
    }
    return activeBase === 'BIN' ? 'text-2xl' : 'text-3xl'
  }

  static formatParts(input, activeBase, mode, parenthesesTracker) {
    const formatted = DisplayFormatter.format(input, { base: activeBase, mode })
    return ParenthesesHighlighter.formatWithParentheses(formatted, parenthesesTracker)
  }

  static highlightSyntax(content) {
    return SyntaxHighlighter.tokenize(content)
  }

  // Get or create the animation service singleton
  static getAnimationService() {
    if (!animationService) {
      const { createSlideAnimation } = useAnimation();
      animationService = createSlideAnimation();
    }
    return animationService;
  }

  static animateSlide(resultContainer, inputContainer) {
    const service = this.getAnimationService();
    service.animateSlide(resultContainer, inputContainer);
  }

  static resetPositions(resultContainer, inputContainer) {
    const service = this.getAnimationService();
    service.resetPositions(resultContainer, inputContainer);
  }
}
