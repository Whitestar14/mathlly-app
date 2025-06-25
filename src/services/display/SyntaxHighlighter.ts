import { CacheManager } from '@/services/cache/CacheManager'
import { CalculatorConstants } from '@/utils/constants/CalculatorConstants'
import type { ParenthesesTracker } from '@/utils/core/ParenthesesTracker'

interface Token {
  type: string
  content: string
  parentLevel?: number
}

interface FormattedPart {
  type: string
  content: string
  level: number
}

interface FormatOptions {
  base?: string
  mode?: string
}

export class SyntaxHighlighter {
  static readonly CACHE_NAMES = {
    FORMAT: 'expression-format',
    PARENTHESES: 'expression-parentheses',
    TOKENS: 'expression-tokens'
  } as const
  
  /**
   * Format an expression with both parentheses and syntax highlighting
   * @param expr - The expression to format
   * @param parenthesesTracker - Tracker for parentheses state
   * @param syntaxHighlightingEnabled - Whether syntax highlighting is enabled
   * @param options - Additional formatting options (mode, base)
   * @returns Formatted tokens for rendering
   */
  static format(
    expr: string, 
    parenthesesTracker: ParenthesesTracker | null, 
    syntaxHighlightingEnabled: boolean = true,
    options: FormatOptions = {}
  ): Token[] {
    if (!expr) {
      return [{ type: 'text', content: '0' }]
    }
    
    const cacheKey = `${expr}-${parenthesesTracker?.getOpenCount() || 0}-${syntaxHighlightingEnabled}-${options.mode || 'Standard'}-${options.base || 'DEC'}`
    
    const formatCache = CacheManager.getCache<Token[]>(this.CACHE_NAMES.FORMAT, 100)

    if (formatCache.has(cacheKey)) {
      return formatCache.get(cacheKey)!
    }

    const parts = this.formatParentheses(expr, options)

    const result = syntaxHighlightingEnabled 
      ? this.applySyntaxHighlighting(parts, options)
      : parts
    
    formatCache.set(cacheKey, result)
    
    return result
  }
  
  /**
   * Apply syntax highlighting to formatted parts
   * @param parts - Formatted parts from parentheses formatting
   * @param options - Additional formatting options
   * @returns Parts with syntax highlighting applied to text parts
   */
  static applySyntaxHighlighting(parts: FormattedPart[], options: FormatOptions = {}): Token[] {
    const tokensCache = CacheManager.getCache<Token[]>(this.CACHE_NAMES.TOKENS, 50)
    
    const result: Token[] = []
    
    for (const part of parts) {
      if (part.type === 'text') {
        const cacheKey = `${part.content}-${options.mode || 'Standard'}`
        
        let tokens: Token[]
        if (tokensCache.has(cacheKey)) {
          tokens = tokensCache.get(cacheKey)!
        } else {
          tokens = this.tokenize(part.content, options)
          tokensCache.set(cacheKey, tokens)
        }
        
        for (const token of tokens) {
          result.push({
            ...token,
            parentLevel: part.level
          })
        }
      } else {
        result.push(part as Token)
      }
    }
    
    return result
  }
  
  /**
   * Format an expression with parentheses
   * @param expr - The expression to format
   * @param options - Additional formatting options
   * @returns Formatted parts
   */
  static formatParentheses(expr: string, options: FormatOptions = {}): FormattedPart[] {
    const parenthesesCache = CacheManager.getCache<FormattedPart[]>(this.CACHE_NAMES.PARENTHESES, 50)
    
    const cacheKey = `${expr}-${options.mode || 'Standard'}`
    if (parenthesesCache.has(cacheKey)) {
      return parenthesesCache.get(cacheKey)!
    }
    
    const parts: FormattedPart[] = []
    let currentIndex = 0
    let nestLevel = 0
    
    const { REGEX } = CalculatorConstants
    
    const isOperator = (char: string, nextChar?: string): boolean => {
      if (REGEX.OPERATOR.test(char)) return true
      if ((char === '<' && nextChar === '<') || (char === '>' && nextChar === '>')) return true
      // Scientific mode: handle power operator
      if (options.mode === 'Scientific' && char === '^') return true
      return false
    }
    
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i]
      const nextChar = expr[i + 1]

      if (char === '(' || char === '|') {
        if (i > currentIndex) {
          const beforeText = expr.slice(currentIndex, i).trim()
          if (beforeText) parts.push({ type: 'text', content: beforeText, level: nestLevel })
        }
        
        parts.push({ type: 'open', content: char, level: nestLevel })
        currentIndex = i + 1
        nestLevel++
      } else if (char === ')' || (char === '|' && nestLevel > 0)) {
        if (i > currentIndex) {
          const content = expr.slice(currentIndex, i).trim()
          if (content) parts.push({ type: 'text', content: content, level: nestLevel })
        }
        
        parts.push({ type: 'close', content: char, level: --nestLevel })
        currentIndex = i + 1
      } else if (isOperator(char, nextChar)) {
        if (i > currentIndex) {
          const beforeOp = expr.slice(currentIndex, i).trim()
          if (beforeOp) parts.push({ type: 'text', content: beforeOp, level: nestLevel })
        }
        
        if ((char === '<' && nextChar === '<') || (char === '>' && nextChar === '>')) {
          parts.push({ type: 'text', content: ` ${expr.slice(i, i + 2)} `, level: nestLevel })
          i++
        } else {
          parts.push({ type: 'text', content: ` ${char} `, level: nestLevel })
        }
        currentIndex = i + 1
      }
    }
  
    if (currentIndex < expr.length) {
      const remaining = expr.slice(currentIndex).trim()
      if (remaining) parts.push({ type: 'text', content: remaining, level: nestLevel })
    }
  
    while (nestLevel > 0) {
      parts.push({ type: 'ghost', content: ')', level: --nestLevel })
    }
  
    const result = this.cleanupParts(parts, options)
    
    parenthesesCache.set(cacheKey, result)
    
    return result
  }
  
  /**
   * Clean up formatted parts
   * @param parts - The parts to clean up
   * @param options - Additional formatting options
   * @returns Cleaned up parts
   */
  static cleanupParts(parts: FormattedPart[], options: FormatOptions = {}): FormattedPart[] {
    const result: FormattedPart[] = []
    const { REGEX } = CalculatorConstants
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const nextPart = parts[i + 1]
      const prevPart = result[result.length - 1]
      
      if (part.type === 'text' && !part.content.trim()) {
        if ((prevPart?.type === 'open') || (nextPart?.type === 'close')) {
          result.push(part)
        }
        continue
      }
      
      if (part.type === 'text') {
        const trimmedContent = part.content.trim()
        const firstChar = trimmedContent[0]
        
        // Handle various operators based on mode
        if (REGEX.OPERATOR.test(firstChar) || 
            /^<<|^>>/.test(trimmedContent) ||
            (options.mode === 'Scientific' && firstChar === '^')) {
          if (prevPart?.type === 'text') {
            prevPart.content = prevPart.content.trimEnd()
          }
        }
      }
      
      result.push(part)
    }
    
    return result
  }
  
  /**
   * Tokenize a text string for syntax highlighting
   * @param text - The text to tokenize
   * @param options - Additional formatting options
   * @returns Array of token objects
   */
  static tokenize(text: string, options: FormatOptions = {}): Token[] {
    if (!text) return []
    
    const tokens: Token[] = []
    let currentToken = ''
    const { REGEX, BUTTON_TYPES } = CalculatorConstants
    const isScientificMode = options.mode === 'Scientific'

    const pushToken = (): void => {
      if (currentToken) {
        tokens.push(this.classifyToken(currentToken, options))
        currentToken = ''
      }
    }

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const nextChar = text[i + 1]

      // Handle decimal points
      if (char === '.') {
        pushToken()
        tokens.push({ type: 'decimal', content: '.' })
        continue
      }

      // Handle shift operators (programmer mode)
      if ((char === '<' && nextChar === '<') || (char === '>' && nextChar === '>')) {
        pushToken()
        tokens.push({ type: 'programmer-operator', content: char + nextChar })
        i++
        continue
      }

      // Handle power operator (scientific mode)
      if (isScientificMode && char === '^') {
        pushToken()
        tokens.push({ type: 'power-operator', content: '^' })
        continue
      }

      // Handle factorial (scientific mode)
      if (isScientificMode && char === '!') {
        pushToken()
        tokens.push({ type: 'factorial', content: '!' })
        continue
      }

      // Handle standard operators
      if (BUTTON_TYPES.OPERATORS.includes(char as any) ||
          BUTTON_TYPES.PROGRAMMER_OPERATORS.includes(char as any)) {
        pushToken()
        tokens.push(this.classifyToken(char, options))
        continue
      }

      // Handle parentheses and absolute value bars
      if (REGEX.PARENTHESIS.test(char) || char === '|') {
        pushToken()
        tokens.push({ type: 'parenthesis', content: char })
        continue
      }

      // Handle scientific constants
      if (isScientificMode && (char === 'π' || char === 'e')) {
        pushToken()
        tokens.push({ type: 'constant', content: char })
        continue
      }

      // Handle scientific symbols
      if (isScientificMode && (char === '√' || char === '∛')) {
        pushToken()
        tokens.push({ type: 'root-function', content: char })
        continue
      }

      currentToken += char
    }
    pushToken()
    
    return tokens
  }
  
  /**
   * Classify a token based on its content
   * @param token - The token to classify
   * @param options - Additional formatting options
   * @returns Classified token object
   */
  static classifyToken(token: string, options: FormatOptions = {}): Token {
    const { REGEX, BUTTON_TYPES } = CalculatorConstants
    const isScientificMode = options.mode === 'Scientific'
    
    if (token === ' ') return { type: 'space', content: token }
    if (token === '.') return { type: 'decimal', content: token }
    if (REGEX.NUMBER.test(token)) return { type: 'number', content: token }
    
    // Scientific mode specific classifications
    if (isScientificMode) {
      // Check for scientific functions
      if (BUTTON_TYPES.SCIENTIFIC_FUNCTIONS.includes(token as any)) {
        if (REGEX.TRIG_FUNCTION.test(token + '(')) return { type: 'trig-function', content: token }
        if (REGEX.HYPERBOLIC_FUNCTION.test(token + '(')) return { type: 'hyperbolic-function', content: token }
        if (REGEX.LOG_FUNCTION.test(token + '(')) return { type: 'log-function', content: token }
        return { type: 'scientific-function', content: token }
      }
      
      // Check for constants
      if (token === 'π' || token === 'e') return { type: 'constant', content: token }
      
      // Check for special scientific operators
      if (token === '^') return { type: 'power-operator', content: token }
      if (token === '!') return { type: 'factorial', content: token }
      if (token === '√' || token === '∛') return { type: 'root-function', content: token }
      
      // Check for modulo
      if (token === 'mod') return { type: 'modulo-operator', content: token }
    }
    
    // Standard classifications
    if (BUTTON_TYPES.OPERATORS.includes(token as any)) return { type: 'operator', content: token }
    if (BUTTON_TYPES.PROGRAMMER_OPERATORS.includes(token as any)) return { type: 'programmer-operator', content: token }
    
    return { type: 'text', content: token }
  }
  
  /**
   * Clear all expression formatter caches
   */
  static clearCache(): void {
    CacheManager?.clearAllCaches?.()
  }
}
