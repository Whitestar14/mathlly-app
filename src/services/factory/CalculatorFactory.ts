import { StandardCalculator } from '@/services/logic/StandardCalculator'
import { ProgrammerCalculator } from '@/services/logic/ProgrammerCalculator'
import type { CalculatorMode } from '@/composables/useCalculatorState'

// Define interfaces for calculator settings and factory
interface CalculatorSettings {
  [key: string]: any
  precision?: number
  angleUnit?: 'degrees' | 'radians'
  defaultBase?: string
  mode?: CalculatorMode
}

// Define base calculator interface that both calculator types should implement
interface BaseCalculator {
  input: string
  currentExpression: string
  MAX_INPUT_LENGTH: number
  handleButtonClick: (button: string) => CalculatorResult
  evaluateExpression: (expression: string, base?: string) => any
  formatResult: (result: any, base?: string) => string
  states?: Record<string, any>
}

// Define calculator result interface
interface CalculatorResult {
  input: string
  error?: string
  result?: string
  expression?: string
  displayValues?: Record<string, any>
}

// Define programmer calculator specific interface
interface ProgrammerCalculatorInterface extends BaseCalculator {
  handleBaseChange: (newBase: string) => CalculatorResult
  updateDisplayValues: (input: string) => Record<string, any>
  states: Record<string, { input: string; [key: string]: any }>
}

// Union type for all calculator types
type Calculator = StandardCalculator | ProgrammerCalculator

// Type guard to check if calculator is a programmer calculator
function isProgrammerCalculator(calculator: Calculator): calculator is ProgrammerCalculator {
  return 'handleBaseChange' in calculator && 'updateDisplayValues' in calculator
}

/**
 * Calculator factory for creating calculator instances
 */
export class CalculatorFactory {
  /**
   * Create a calculator instance based on mode
   * @param mode - Calculator mode
   * @param settings - Calculator settings
   * @returns Calculator instance
   * @throws Error if unsupported calculator mode is provided
   */
  static create(mode: CalculatorMode, settings: CalculatorSettings): Calculator {
    // Validate mode parameter
    if (!mode) {
      throw new Error('Calculator mode is required')
    }

    // Validate settings parameter
    if (!settings || typeof settings !== 'object') {
      throw new Error('Calculator settings must be a valid object')
    }

    try {
      switch (mode) {
        case 'Standard':
          return new StandardCalculator(settings)
        
        case 'Programmer':
          return new ProgrammerCalculator(settings)
        
        case 'Scientific':
          // If you have a ScientificCalculator class, add it here
          // return new ScientificCalculator(settings)
          throw new Error('Scientific calculator mode not yet implemented')
        
        default:
          // TypeScript will ensure this is never reached with proper typing
          throw new Error(`Unsupported calculator mode: ${mode}`)
      }
    } catch (error) {
      // Re-throw with more context
      throw new Error(`Failed to create calculator for mode '${mode}': ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get available calculator modes
   * @returns Array of available calculator modes
   */
  static getAvailableModes(): CalculatorMode[] {
    return ['Standard', 'Programmer'] // Add 'Scientific' when implemented
  }

  /**
   * Validate if a mode is supported
   * @param mode - Mode to validate
   * @returns True if mode is supported
   */
  static isModeSupported(mode: string): mode is CalculatorMode {
    return this.getAvailableModes().includes(mode as CalculatorMode)
  }

  /**
   * Get default settings for a specific calculator mode
   * @param mode - Calculator mode
   * @returns Default settings object
   */
  static getDefaultSettings(mode: CalculatorMode): CalculatorSettings {
    const baseSettings: CalculatorSettings = {
      precision: 4,
      mode
    }

    switch (mode) {
      case 'Standard':
        return {
          ...baseSettings,
          // Add standard calculator specific defaults
        }
      
      case 'Programmer':
        return {
          ...baseSettings,
          defaultBase: 'DEC',
          // Add programmer calculator specific defaults
        }
      
      case 'Scientific':
        return {
          ...baseSettings,
          angleUnit: 'degrees' as const,
          // Add scientific calculator specific defaults
        }
      
      default:
        return baseSettings
    }
  }

  /**
   * Create a calculator with default settings
   * @param mode - Calculator mode
   * @returns Calculator instance with default settings
   */
  static createWithDefaults(mode: CalculatorMode): Calculator {
    const defaultSettings = this.getDefaultSettings(mode)
    return this.create(mode, defaultSettings)
  }
}

// Export types for external use
export type {
  CalculatorSettings,
  BaseCalculator,
  CalculatorResult,
  ProgrammerCalculatorInterface,
  Calculator
}

// Export utility functions
export { isProgrammerCalculator }
