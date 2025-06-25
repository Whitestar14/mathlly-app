import { StandardOperations } from "@/utils/operations/StandardOperations.ts"
import { ParenthesesTracker } from "@/utils/core/ParenthesesTracker.ts"
import { CalculatorUtils, FUNCTION_MAPPINGS } from "@/utils/constants/CalculatorConstants.ts"

/**
 * Handles scientific calculator operations
 * Extends StandardOperations to inherit basic functionality
 */
export class ScientificOperations extends StandardOperations {
  parenthesesTracker: ParenthesesTracker

  /**
   * Creates a new ScientificOperations instance
   * @param {Object} calculator - The calculator instance to operate on
   */
  constructor(calculator: any) {
    super(calculator)
    this.parenthesesTracker = new ParenthesesTracker()
  }

  /**
   * Handle scientific function operations as part of natural expressions
   * @param {string} func - Function name (sin, cos, tan, log, etc.)
   * @returns {Object} Updated input state and error message
   */
  handleScientificFunction(func: string): Record<string, any> {
    try {
    const currentInput = this.calculator.input;
    console.log('🔍 handleScientificFunction called with:', func);
    
    // Map display symbols to function names
    const funcName = CalculatorUtils.mapFunctionName(func);
    console.log('🗺️ Mapped function name:', funcName);
       
      // Handle special cases for functions that need different treatment
      switch (funcName) {
        case 'x²':
          return this.handleSquareOperation()
        case 'x³':
          return this.handleCubeOperation()
        case '1/x':
          return this.handleReciprocalOperation()
        case '√':
          return this.handleSquareRootOperation()
        case '∛':
          return this.handleCubeRootOperation()
        case '|x|':
          return this.handleAbsoluteOperation()
        case 'n!':
          return this.handleFactorialOperation()
        case 'x^y':
          return this.handlePowerOperation()
        case 'exp':
          return this.handleExponentialOperation()
        case '10^x':
          return this.handle10PowerOperation()
        case '2^x':
          return this.handle2PowerOperation()
        case 'e^x':
          return this.handleEPowerOperation()
        case 'mod':
          return this.handleModuloOperation()
        case 'rand':
          return this.handleRandomOperation()
        case 'dms':
          return this.handleDMSOperation()
        case 'deg':
          return this.handleDegreeOperation()
      }
      
      // For functions that need parentheses (sin, cos, log, etc.)
    if (currentInput === '0' || currentInput === 'Error') {
      this.calculator.input = `${funcName}(`;
      console.log('✅ New input (empty case):', this.calculator.input);
      this.parenthesesTracker.open(funcName.length);
    } else {
      // Check if the last character is an operator or opening parenthesis
      const lastChar = currentInput.trim().slice(-1);
      const isLastCharOperator = this.isOperator(lastChar) || lastChar === '(';
      
      if (isLastCharOperator) {
        this.calculator.input = `${currentInput}${funcName}(`;
        console.log('✅ New input (after operator):', this.calculator.input);
        this.parenthesesTracker.open(currentInput.length + funcName.length);
      } else {
        this.calculator.input = `${currentInput} × ${funcName}(`;
        console.log('✅ New input (multiply case):', this.calculator.input);
        this.parenthesesTracker.open(currentInput.length + funcName.length + 3);
      }
    }
    
    return this.createResponse();
  } catch (err: any) {
    console.error('❌ Error in handleScientificFunction:', err);
    return { input: "Error", error: err.message };
  }
}

  /**
   * Handle modulo operation
   */
  handleModuloOperation(): Record<string, any> {
    try {
      const currentInput = this.calculator.input
      
      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = "0 mod "
      } else {
        // Check if the last character is already an operator
        const lastChar = currentInput.trim().slice(-1)
        if (this.isOperator(lastChar) || lastChar === '(') {
          return this.createResponse() // Don't allow operator after operator
        }
        
        this.calculator.input += ' mod '
      }
      
      return this.createResponse()
    } catch (err: any) {
      return { input: "Error", error: err.message }
    }
  }

  /**
   * Handle random number generation
   */
  handleRandomOperation(): Record<string, any> {
    try {
      const currentInput = this.calculator.input
      const randomValue = Math.random().toString()
      
      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = randomValue
      } else {
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = this.isOperator(lastChar) || lastChar === '('
        
        if (isLastCharOperator) {
          this.calculator.input += randomValue
        } else {
          this.calculator.input += ` × ${randomValue}`
        }
      }
      
      return this.createResponse()
    } catch (err: any) {
      return { input: "Error", error: err.message }
    }
  }

  /**
   * Handle DMS (Degrees, Minutes, Seconds) conversion
   */
  handleDMSOperation(): Record<string, any> {
    try {
      const currentInput = this.calculator.input
      
      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = "dms("
        this.parenthesesTracker.open(4)
      } else {
        // Check if we need to wrap the current expression in parentheses
        const needsParentheses = ParenthesesTracker.needsParentheses(currentInput)
        
        if (needsParentheses) {
          this.calculator.input = `dms(${currentInput})`
        } else {
          // If the last part is a number or closing parenthesis, convert that
          const lastPart = ParenthesesTracker.getLastExpressionPart(currentInput)
          if (lastPart) {
            const lastPartIndex = currentInput.lastIndexOf(lastPart)
            this.calculator.input = 
              currentInput.substring(0, lastPartIndex) + 
              `dms(${lastPart})`
          } else {
            this.calculator.input = `dms(${currentInput})`
          }
        }
      }
      
      return this.createResponse()
    } catch (err: any) {
      return { input: "Error", error: err.message }
    }
  }

  /**
   * Handle degree conversion
   */
  handleDegreeOperation(): Record<string, any> {
    try {
      const currentInput = this.calculator.input
      
      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = "deg("
        this.parenthesesTracker.open(4)
      } else {
        // Check if we need to wrap the current expression in parentheses
        const needsParentheses = ParenthesesTracker.needsParentheses(currentInput)
        
        if (needsParentheses) {
          this.calculator.input = `deg(${currentInput})`
        } else {
          // If the last part is a number or closing parenthesis, convert that
          const lastPart = ParenthesesTracker.getLastExpressionPart(currentInput)
          if (lastPart) {
            const lastPartIndex = currentInput.lastIndexOf(lastPart)
            this.calculator.input = 
              currentInput.substring(0, lastPartIndex) + 
              `deg(${lastPart})`
          } else {
            this.calculator.input = `deg(${currentInput})`
          }
        }
      }
      
      return this.createResponse()
    } catch (err: any) {
      return { input: "Error", error: err.message }
    }
  }

  /**
   * Handle square operation (x²) as part of an expression
   */
  handleSquareOperation(): Record<string, any> {
    try {
      const currentInput = this.calculator.input;
      
      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = "sqr(";
        this.parenthesesTracker.open(4);
      } else {
        // Check if the last character is an operator or opening parenthesis
        const lastChar = currentInput.trim().slice(-1);
        const isLastCharOperator = this.isOperator(lastChar) || lastChar === '(';
        
        if (isLastCharOperator) {
          // If after an operator or opening parenthesis, just start a new sqr
          this.calculator.input = `${currentInput}sqr(`;
          this.parenthesesTracker.open(currentInput.length + 4);
        } else {
          // Check if we have unclosed parentheses (we're inside a function)
          const openParenCount = ParenthesesTracker.getOpenParenthesesCount(currentInput);
          
          if (openParenCount > 0) {
            // We're inside a function - check if we can nest directly or need multiplication
            const lastOpenParen = currentInput.lastIndexOf('(');
            const contentAfterLastParen = currentInput.slice(lastOpenParen + 1).trim();
            
            if (!contentAfterLastParen || this.isOperator(contentAfterLastParen.slice(-1))) {
              // Empty after paren or ends with operator - direct nesting
              this.calculator.input = `${currentInput}sqr(`;
              this.parenthesesTracker.open(currentInput.length + 4);
            } else {
              // Has content - multiply
              this.calculator.input = `${currentInput} × sqr(`;
              this.parenthesesTracker.open(currentInput.length + 6);
            }
          } else {
            // No open parentheses - multiply with existing content
            this.calculator.input = `${currentInput} × sqr(`;
            this.parenthesesTracker.open(currentInput.length + 6);
          }
        }
      }
      
      return this.createResponse();
    } catch (err: any) {
      return { input: "Error", error: err.message };
    }
  }

  /**
   * Handle cube operation (x³) as part of an expression
   */
  handleCubeOperation(): Record<string, any> {
  try {
    const currentInput = this.calculator.input;
    
    if (currentInput === '0' || currentInput === 'Error') {
      this.calculator.input = "cube(";
      this.parenthesesTracker.open(5);
    } else {
      // Check if the last character is an operator or opening parenthesis
      const lastChar = currentInput.trim().slice(-1);
      const isLastCharOperator = this.isOperator(lastChar) || lastChar === '(';
      
      if (isLastCharOperator) {
        // If after an operator or opening parenthesis, just start a new cube
        this.calculator.input = `${currentInput}cube(`;
        this.parenthesesTracker.open(currentInput.length + 5);
      } else {
        // Check if we have unclosed parentheses (we're inside a function)
        const openParenCount = ParenthesesTracker.getOpenParenthesesCount(currentInput);
        
        if (openParenCount > 0) {
          // We're inside a function - check if we can nest directly or need multiplication
          const lastOpenParen = currentInput.lastIndexOf('(');
          const contentAfterLastParen = currentInput.slice(lastOpenParen + 1).trim();
          
          if (!contentAfterLastParen || this.isOperator(contentAfterLastParen.slice(-1))) {
            // Empty after paren or ends with operator - direct nesting
            this.calculator.input = `${currentInput}cube(`;
            this.parenthesesTracker.open(currentInput.length + 5);
          } else {
            // Has content - multiply
            this.calculator.input = `${currentInput} × cube(`;
            this.parenthesesTracker.open(currentInput.length + 7);
          }
        } else {
          // No open parentheses - multiply with existing content
          this.calculator.input = `${currentInput} × cube(`;
          this.parenthesesTracker.open(currentInput.length + 7);
        }
      }
    }
    
    return this.createResponse();
  } catch (err: any) {
    return { input: "Error", error: err.message };
  }
}

  /**
   * Handle reciprocal operation (1/x) as part of an expression
   */
  handleReciprocalOperation(): Record<string, any> {
    try {
      const currentInput = this.calculator.input
      
      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = "1/("
        this.parenthesesTracker.open(1)
      } else {
        // Check if we're in the middle of an operation
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = this.isOperator(lastChar) || lastChar === '('
        
        if (isLastCharOperator) {
          // If we're after an operator, just start a new reciprocal
          this.calculator.input += "1/("
          this.parenthesesTracker.open(currentInput.length + 1)
        } else {
          // Otherwise check if we need to wrap the current part in parentheses
          const lastPart = ParenthesesTracker.getLastExpressionPart(currentInput)
          if (lastPart) {
            const lastPartIndex = currentInput.lastIndexOf(lastPart)
            // Don't wrap if the part is already a reciprocal expression
            if (lastPart.startsWith('1/(') && lastPart.endsWith(')')) {
              return this.createResponse()
            }
            this.calculator.input = 
              currentInput.substring(0, lastPartIndex) + 
              `1/(${lastPart})`
          } else {
            this.calculator.input = `1/(${currentInput})`
          }
        }
      }
      
      return this.createResponse()
    } catch (err: any) {
      return { input: "Error", error: err.message }
    }
  }

/**
 * Handle square root operation (√) as part of an expression
 */
handleSquareRootOperation(): Record<string, any> {
  try {
    const currentInput = this.calculator.input
    console.log('🔍 handleSquareRootOperation - START')
    console.log('📝 Current input:', currentInput)
    
    if (currentInput === '0' || currentInput === 'Error') {
      console.log('🎯 Case: Empty/Error state')
      this.calculator.input = "√("
      this.parenthesesTracker.open(1)
      console.log('✅ New input:', this.calculator.input)
      console.log('📊 Parentheses count:', this.parenthesesTracker.getOpenCount())
    } else {
      const lastChar = currentInput.trim().slice(-1)
      const isLastCharOperator = this.isOperator(lastChar) || lastChar === '('
      
      console.log('🔤 Last character:', `"${lastChar}"`)
      console.log('⚡ Is last char operator/paren:', isLastCharOperator)
      
      if (isLastCharOperator) {
        console.log('🎯 Case: After operator or opening parenthesis')
        const newInput = `${currentInput}√(`
        this.calculator.input = newInput
        const parenPosition = currentInput.length + 1
        this.parenthesesTracker.open(parenPosition)
        console.log('✅ New input:', this.calculator.input)
        console.log('📍 Paren position:', parenPosition)
        console.log('📊 Parentheses count:', this.parenthesesTracker.getOpenCount())
      } else {
        // Check if we're inside an unclosed parenthesis
        const openParenCount = ParenthesesTracker.getOpenParenthesesCount(currentInput)
        console.log('🔢 Open parentheses count:', openParenCount)
        
        if (openParenCount > 0) {
          console.log('🎯 Case: Inside unclosed parentheses')
          const lastOpenParen = currentInput.lastIndexOf('(')
          const contentAfterLastParen = currentInput.slice(lastOpenParen + 1).trim()
          
          console.log('📍 Last open paren at index:', lastOpenParen)
          console.log('📝 Content after last paren:', `"${contentAfterLastParen}"`)
          
          if (!contentAfterLastParen || this.isOperator(contentAfterLastParen.slice(-1))) {
            console.log('🎯 Sub-case: Empty after paren or ends with operator - direct nesting')
            const newInput = `${currentInput}√(`
            this.calculator.input = newInput
            const parenPosition = currentInput.length + 1
            this.parenthesesTracker.open(parenPosition)
            console.log('✅ New input:', this.calculator.input)
            console.log('📍 Paren position:', parenPosition)
          } else {
            console.log('🎯 Sub-case: Has content - multiply')
            const newInput = `${currentInput} × √(`
            this.calculator.input = newInput
            const parenPosition = currentInput.length + 3
            this.parenthesesTracker.open(parenPosition)
            console.log('✅ New input:', this.calculator.input)
            console.log('📍 Paren position:', parenPosition)
          }
        } else {
          console.log('🎯 Case: No open parentheses - multiply')
          const newInput = `${currentInput} × √(`
          this.calculator.input = newInput
          const parenPosition = currentInput.length + 3
          this.parenthesesTracker.open(parenPosition)
          console.log('✅ New input:', this.calculator.input)
          console.log('📍 Paren position:', parenPosition)
        }
        
        console.log('📊 Final parentheses count:', this.parenthesesTracker.getOpenCount())
      }
    }
    
    console.log('🏁 handleSquareRootOperation - END')
    console.log('📤 Final input:', this.calculator.input)
    console.log('---')
    
    return this.createResponse()
  } catch (err: any) {
    console.error('❌ Error in handleSquareRootOperation:', err)
    return { input: "Error", error: err.message }
  }
}

  /**
   * Handle cube root operation (∛) as part of an expression
   */
  handleCubeRootOperation(): Record<string, any> {
    try {
      const currentInput = this.calculator.input
      
      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = "∛("
        this.parenthesesTracker.open(2)
      } else {
        // Check if the last character is an operator or opening parenthesis
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = this.isOperator(lastChar) || lastChar === '('
        
        if (isLastCharOperator) {
          this.calculator.input = `${currentInput}∛(`
          this.parenthesesTracker.open(currentInput.length + 2)
        } else {
          this.calculator.input = `${currentInput} × ∛(`
          this.parenthesesTracker.open(currentInput.length + 4)
        }
      }
      
      return this.createResponse()
    } catch (err: any) {
      return { input: "Error", error: err.message }
    }
  }

  /**
   * Handle absolute value operation (|x|) as part of an expression
   */
  handleAbsoluteOperation(): Record<string, any> {
    try {
      const currentInput = this.calculator.input

      // Case 1: Empty or error state
      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = "|"
        this.parenthesesTracker.open(0)
        return this.createResponse()
      }

      // Case 2: Check if there's an open pipe that needs to be closed
      const pipes = [...currentInput.matchAll(/\|/g)]
      const openPipes = pipes.length
      
      if (openPipes % 2 !== 0) {
        // There's an unclosed pipe, add the closing pipe
        // Check if we have content after the last pipe
        const lastPipeIndex = pipes[pipes.length - 1].index!
        const contentAfterPipe = currentInput.slice(lastPipeIndex + 1).trim()
        
        if (contentAfterPipe) {
          this.calculator.input = `${currentInput}|`
          this.parenthesesTracker.close(currentInput.length)
          return this.createResponse()
        } else {
          // No content after pipe, replace it
          this.calculator.input = currentInput.slice(0, lastPipeIndex)
          this.parenthesesTracker.close(lastPipeIndex)
          return this.createResponse()
        }
      }

      // Case 3: Starting a new absolute value operation
      const lastChar = currentInput.trim().slice(-1)
      const isLastCharOperator = this.isOperator(lastChar) || lastChar === '('
      
      if (isLastCharOperator) {
        this.calculator.input = `${currentInput}|`
        this.parenthesesTracker.open(currentInput.length)
      } else {
        // If we have a number or closing parenthesis, add multiplication
        this.calculator.input = `${currentInput} × |`
        this.parenthesesTracker.open(currentInput.length + 3)
      }
      
      return this.createResponse()
    } catch (err: any) {
      return { input: "Error", error: err.message }
    }
  }

  /**
   * Handle factorial operation (n!) as part of an expression
   */
  handleFactorialOperation(): Record<string, any> {
    try {
      const currentInput = this.calculator.input
      
      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = "0!"
      } else {
        // Find the last number or expression in the input
        const lastNumberMatch = currentInput.match(/(\d+|\))(?!.*[\d\)])$/)
        
        if (lastNumberMatch) {
          const lastNumber = lastNumberMatch[0]
          const lastNumberIndex = currentInput.lastIndexOf(lastNumber)
          
          // Replace the last number with number!
          this.calculator.input = 
            currentInput.substring(0, lastNumberIndex) + 
            lastNumber + '!' + 
            currentInput.substring(lastNumberIndex + lastNumber.length)
        } else {
          // If no number found, just append !
          this.calculator.input += '!'
        }
      }
      
      return this.createResponse()
    } catch (err: any) {
      return { input: "Error", error: err.message }
    }
  }

  /**
   * Handle power operation (x^y) as part of an expression
   */
  handlePowerOperation(): Record<string, any> {
    try {
      const currentInput = this.calculator.input
      
      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = "0^("
        this.parenthesesTracker.open(2)
      } else {
        // Check if we're in the middle of an operation
        const lastChar = currentInput.trim().slice(-1)
        if (this.isOperator(lastChar) || lastChar === '(' || lastChar === '^') {
          return this.createResponse() // Don't allow operator after operator or power
        }
        
        // Get the last expression part to check if it's already part of a power expression
        const lastPart = ParenthesesTracker.getLastExpressionPart(currentInput)
        if (!lastPart || (lastPart.includes('^(') && !lastPart.endsWith(')'))) {
          return this.createResponse() // Invalid state for power
        }
        
        // Add power operator and opening parenthesis
        this.calculator.input += '^('
        this.parenthesesTracker.open(currentInput.length + 2)
      }
      
      return this.createResponse()
    } catch (err: any) {
      return { input: "Error", error: err.message }
    }
  }

  /**
   * Handle exponential operation (e^x or exp) as part of an expression
   */
  handleExponentialOperation(): Record<string, any> {
    try {
      const currentInput = this.calculator.input
      
      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = "exp("
        this.parenthesesTracker.open(4)
      } else {
        // Check if we're in the middle of an operation
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = this.isOperator(lastChar) || lastChar === '('
        
        if (isLastCharOperator) {
          this.calculator.input = `${currentInput}exp(`
          this.parenthesesTracker.open(currentInput.length + 4)
        } else {
          this.calculator.input = `${currentInput} × exp(`
          this.parenthesesTracker.open(currentInput.length + 6)
        }
      }
      
      return this.createResponse()
    } catch (err: any) {
      return { input: "Error", error: err.message }
    }
  }

  /**
   * Handle common base power operations (10^, 2^, e^)
   * @param base The base number ('10', '2', or 'e')
   */
  private handleBasePowerOperation(base: string): Record<string, any> {
    try {
      const currentInput = this.calculator.input
      const baseLength = base.length
      
      if (currentInput === '0' || currentInput === 'Error') {
        this.calculator.input = `${base}^(`
        this.parenthesesTracker.open(baseLength + 2)
      } else {
        // Check if we're in the middle of an operation
        const lastChar = currentInput.trim().slice(-1)
        const isLastCharOperator = this.isOperator(lastChar) || lastChar === '('
        
        if (isLastCharOperator) {
          this.calculator.input = `${currentInput}${base}^(`
          this.parenthesesTracker.open(currentInput.length + baseLength + 2)
        } else {
          this.calculator.input = `${currentInput} × ${base}^(`
          this.parenthesesTracker.open(currentInput.length + baseLength + 4)
        }
      }
      
      return this.createResponse()
    } catch (err: any) {
      return { input: "Error", error: err.message }
    }
  }

  /**
   * Handle 10^ operation (10^x) as part of an expression
   */
  handle10PowerOperation(): Record<string, any> {
    return this.handleBasePowerOperation('10')
  }

  /**
   * Handle 2^ operation (2^x) as part of an expression
   */
  handle2PowerOperation(): Record<string, any> {
    return this.handleBasePowerOperation('2')
  }

  /**
   * Handle e^ operation (e^x) as part of an expression
   */
  handleEPowerOperation(): Record<string, any> {
    return this.handleBasePowerOperation('e')
  }

    /**
   * Handle constant input (π, e)
   */
  handleConstant(constant: string): Record<string, any> {
    try {
      if (this.calculator.input === '0' || this.calculator.input === 'Error') {
        this.calculator.input = constant
      } else {
        const lastChar = this.calculator.input.trim().slice(-1)
        const isLastCharOperator = this.isOperator(lastChar) || lastChar === '('
        
        if (isLastCharOperator) {
          this.calculator.input += constant
        } else {
          this.calculator.input += ` × ${constant}`
        }
      }
      return this.createResponse()
    } catch (err: any) {
      return { input: "Error", error: err.message }
    }
  }

  /**
   * Handle parenthesis operations
   */
handleParenthesis(parenthesis: string): Record<string, any> {
  console.log('🎯 handleParenthesis called with:', parenthesis)
  console.log('📍 Call stack:', new Error().stack)
  
  const result = this.parenthesesTracker.handleParenthesisInput(this.calculator.input, parenthesis)
  console.log('currentResult:', result);
  this.calculator.input = result.input
  return this.createResponse()
}

  /**
   * Handle backspace operation
   */
  handleBackspace(): Record<string, any> {
    try {
      const currentInput = this.calculator.input
      
      if (currentInput === "0" || currentInput === "Error") {
        return this.createResponse(currentInput)
      }
      
      // Check if parentheses tracker can handle the backspace
      const parenthesesResult = this.parenthesesTracker.handleParenthesesBackspace(currentInput)
      if (parenthesesResult.handled) {
        this.calculator.input = parenthesesResult.input
        return this.createResponse()
      }
      
      // Handle special backspace cases using CalculatorUtils
      const specialResult = CalculatorUtils.handleSpecialBackspace(currentInput)
      if (specialResult.handled) {
        this.calculator.input = specialResult.input
        return this.createResponse()
      }
      
      // Default backspace behavior
      if (currentInput.length === 1) {
        this.calculator.input = "0"
      } else {
        this.calculator.input = currentInput.slice(0, -1)
      }
      
      return this.createResponse()
    } catch (err: any) {
      return { input: "Error", error: err.message }
    }
  }

  /**
   * Handle clear entry operation
   */
  handleClearEntry(): Record<string, any> {
    const input = this.calculator.input
    
    if (input !== "0" && input !== "Error") {
      // Try to clear just the current entry (e.g., inside parentheses)
      const lastOpenIndex = input.lastIndexOf("(")
      const lastCloseIndex = input.lastIndexOf(")")
      
      if (lastOpenIndex > lastCloseIndex) {
        // We're inside parentheses, clear just that part
        this.calculator.input = input.substring(0, lastOpenIndex + 1)
      } else {
        // Clear the last part of the expression
        const parts = input.split(/([+\-×÷])/)
        if (parts.length > 1) {
          this.calculator.input = parts.slice(0, -1).join("")
        } else {
          this.calculator.input = "0"
        }
      }
    } else {
      this.calculator.input = "0"
      this.resetParentheses()
    }
    
    return this.createResponse()
  }

  /**
   * Get the current count of unclosed parentheses
   */
  getParenthesesCount(): number {
    return this.parenthesesTracker.getOpenCount()
  }

  /**
   * Reset parentheses tracker
   */
  resetParentheses(): void {
    this.parenthesesTracker = new ParenthesesTracker()
  }

  /**
   * Create a standardized response
   */
  createResponse(input?: string): Record<string, any> {
    return {
      input: input || this.calculator.input,
      error: ""
    }
  }
}
