import { StandardCalculator } from '@/services/logic/StandardCalculator'
import { ProgrammerCalculator } from '@/services/logic/ProgrammerCalculator'

/**
 * Calculator factory for creating calculator instances
 */
export class CalculatorFactory {
  /**
   * Create a calculator instance based on mode
   * @param {string} mode - Calculator mode
   * @param {Object} settings - Calculator settings
   * @returns {Object} Calculator instance
   */
  static create(mode, settings) {
    switch (mode) {
      case 'Standard':
        return new StandardCalculator(settings)
      case 'Programmer':
        return new ProgrammerCalculator(settings)
      default:
        throw new Error(`Unsupported calculator mode: ${mode}`)
    }
  }
}
