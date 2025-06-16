import { StandardCalculator } from '@/services/logic/StandardCalculator.ts'
import { ProgrammerCalculator } from '@/services/logic/ProgrammerCalculator.ts'
import type { CalculatorMode } from '@/composables/useCalculatorState'

// Define interfaces for calculator settings and factory
interface CalculatorSettings {
  [key: string]: any
  precision?: number
  angleUnit?: 'degrees' | 'radians'
  defaultBase?: string
  mode?: CalculatorMode
}

// Define calculator result interface - must match what actual calculators return
interface CalculatorResult {
  input: string
  error?: string
  result?: string
  expression?: string
  displayValues?: Record<string, any>
}

// Define base calculator interface that both calculator types should implement
interface BaseCalculator {
  input: string
  currentExpression: string
  MAX_INPUT_LENGTH: number
  handleButtonClick: (button: string) => CalculatorResult
  evaluateExpression: (expression: string, base?: string) => any
  formatResult: (result: any, base?: string) => string
  // Add convertToBase method to base interface since memory operations need it
  convertToBase?: (value: string, fromBase: string, toBase: string) => string
}

// Define standard calculator interface
interface StandardCalculatorInterface extends BaseCalculator {
  // Add convertToBase method for memory operations compatibility
  convertToBase: (value: string, fromBase: string, toBase: string) => string
}

// Define programmer calculator specific interface
interface ProgrammerCalculatorInterface extends BaseCalculator {
  handleBaseChange: (newBase: string) => CalculatorResult
  updateDisplayValues: (input: string) => Record<string, any>
  states: Record<string, { input: string; display: string }>
  convertToBase: (value: string, fromBase: string, toBase: string) => string
}

// Union type for all calculator types - this is the main Calculator type
export type Calculator = StandardCalculatorInterface | ProgrammerCalculatorInterface

// Type guard to check if calculator is a programmer calculator
export function isProgrammerCalculator(calculator: Calculator): calculator is ProgrammerCalculatorInterface {
  return 'handleBaseChange' in calculator && 'updateDisplayValues' in calculator && 'states' in calculator
}

/**
 * Wrapper class to add missing methods to StandardCalculator
 */
class StandardCalculatorWrapper implements StandardCalculatorInterface {
  private calculator: StandardCalculator

  constructor(calculator: StandardCalculator) {
    this.calculator = calculator
  }

  get input(): string {
    return this.calculator.input
  }

  set input(value: string) {
    this.calculator.input = value
  }

  get currentExpression(): string {
    return this.calculator.currentExpression
  }

  set currentExpression(value: string) {
    this.calculator.currentExpression = value
  }

  get MAX_INPUT_LENGTH(): number {
    return this.calculator.MAX_INPUT_LENGTH
  }

  handleButtonClick(button: string): CalculatorResult {
    const result = this.calculator.handleButtonClick(button)
    // Ensure 'input' property is present in the result
    return {
      input: this.input,
      ...result
    }
  }

  evaluateExpression(expression: string, base?: string): any {
    return this.calculator.evaluateExpression(expression, base)
  }

  formatResult(result: any): string {
    return this.calculator.formatResult(result)
  }

  // Add convertToBase method for memory operations
  convertToBase(value: string, fromBase: string, toBase: string): string {
    // For standard calculator, we'll implement basic base conversion
    // This is mainly used for memory operations
    try {
      let decimalValue: number

      // Convert from source base to decimal
      switch (fromBase.toUpperCase()) {
        case 'DEC':
          decimalValue = parseFloat(value)
          break
        case 'HEX':
          decimalValue = parseInt(value, 16)
          break
        case 'OCT':
          decimalValue = parseInt(value, 8)
          break
        case 'BIN':
          decimalValue = parseInt(value, 2)
          break
        default:
          decimalValue = parseFloat(value)
      }

      // Convert from decimal to target base
      switch (toBase.toUpperCase()) {
        case 'DEC':
          return decimalValue.toString()
        case 'HEX':
          return decimalValue.toString(16).toUpperCase()
        case 'OCT':
          return decimalValue.toString(8)
        case 'BIN':
          return decimalValue.toString(2)
        default:
          return decimalValue.toString()
      }
    } catch (error) {
      console.error('Error converting base:', error)
      return '0'
    }
  }
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
          // Wrap StandardCalculator to add missing methods
          const standardCalc = new StandardCalculator(settings)
          return new StandardCalculatorWrapper(standardCalc)
        
        case 'Programmer':
          return new ProgrammerCalculator(settings) as unknown as ProgrammerCalculatorInterface
        
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
  StandardCalculatorInterface,
  ProgrammerCalculatorInterface
}
