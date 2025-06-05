/**
 * Interface for parentheses group tracking
 */
interface ParenthesesGroup {
  start: number
  end?: number
  content: string
}

/**
 * Tracks parentheses in mathematical expressions
 * Provides functionality to track opening and closing parentheses
 * and maintain groups for syntax highlighting and validation
 */
export class ParenthesesTracker {
  private count: number
  private groups: ParenthesesGroup[]

  /**
   * Create a new ParenthesesTracker instance
   */
  constructor() {
    this.count = 0
    this.groups = []
  }

  /**
   * Register an opening parenthesis at the given position
   * @param position - Position of the opening parenthesis
   */
  open(position: number): void {
    this.count++
    this.groups.push({
      start: position,
      content: ""
    })
  }

  /**
   * Register a closing parenthesis at the given position
   * @param position - Position of the closing parenthesis
   * @returns True if successfully closed, false if no matching opening parenthesis
   */
  close(position: number): boolean {
    if (this.count > 0) {
      this.count--
      const group = this.groups[this.groups.length - 1]
      if (group) {
        group.end = position
      }
      return true
    }
    return false
  }

  /**
   * Get the current count of unclosed parentheses
   * @returns Number of unclosed opening parentheses
   */
  getOpenCount(): number {
    return this.count
  }

  /**
   * Get all tracked parentheses groups
   * @returns Array of parentheses groups
   */
  getGroups(): readonly ParenthesesGroup[] {
    return Object.freeze([...this.groups])
  }

  /**
   * Reset the tracker to initial state
   */
  reset(): void {
    this.count = 0
    this.groups = []
  }

  /**
   * Check if all parentheses are balanced
   * @returns True if all parentheses are properly closed
   */
  isBalanced(): boolean {
    return this.count === 0
  }

  /**
   * Get the last unclosed group
   * @returns The most recent unclosed parentheses group, or undefined if none
   */
  getLastOpenGroup(): ParenthesesGroup | undefined {
    return this.groups.find(group => group.end === undefined)
  }
}

// Export types for external use
export type { ParenthesesGroup }
