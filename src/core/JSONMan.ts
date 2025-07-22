/**
 * Main JSONMan class - The core of the JSON manipulation library
 */

import { JSONValue, ParseOptions, ParseResult, FixOptions, FixResult, FixReport } from './types';
import { JSONParseError, createErrorResult, createSuccessResult } from './errors';

/**
 * JSONMan - Comprehensive JSON Helper Library
 * 
 * Provides static methods for quick operations and can be instantiated
 * for chainable operations on JSON data.
 */
export class JSONMan {
  private data: JSONValue | undefined;
  private errors: Error[] = [];

  constructor(data?: JSONValue) {
    this.data = arguments.length === 0 ? null : data;
  }

  // ============================================================================
  // STATIC METHODS - Quick Operations
  // ============================================================================

  /**
   * Safely parse JSON string with detailed error information
   */
  static parse(jsonString: string, options?: ParseOptions): ParseResult {
    try {
      const data = JSON.parse(jsonString, options?.reviver);
      return createSuccessResult(data);
    } catch (error) {
      const parseError = JSONParseError.fromNativeError(error as SyntaxError, jsonString);
      return createErrorResult(parseError);
    }
  }

  /**
   * Fix common JSON issues automatically
   */
  static fix(malformedJson: string, _options?: FixOptions): FixResult {
    try {
      const fixes: FixReport[] = [];
      let original = malformedJson;
      let fixed = malformedJson;

      // Step 1: Remove BOM if present
      if (fixed.charCodeAt(0) === 0xFEFF) {
        fixed = fixed.slice(1);
        fixes.push({
          type: 'other',
          description: 'Removed Unicode BOM',
          position: { start: 0, end: 1 },
          original: original.slice(0, 1),
          fixed: ''
        });
      }

      // Step 2: Handle comments first - comprehensive removal
      fixed = this.removeComments(fixed, fixes);

      // Step 3: Handle special literals (None, undefined, etc.)
      fixed = this.convertLiterals(fixed, fixes);

      // Step 4: Handle JavaScript hex numbers (0x...)
      fixed = this.convertHexNumbers(fixed, fixes);

      // Step 5: Handle duplicate opening delimiters early
      fixed = this.fixDuplicateDelimiters(fixed, fixes);

      // Step 6: Handle single quotes to double quotes - Enhanced
      fixed = this.fixSingleQuotes(fixed, fixes);

      // Step 7: Handle unescaped quotes in strings - Enhanced
      fixed = this.fixUnescapedQuotes(fixed, fixes);

      // Step 8: Fix escape sequences - Enhanced
      fixed = this.fixEscapeSequences(fixed, fixes);

      // Step 9: Quote unquoted keys - Enhanced
      fixed = this.quoteUnquotedKeys(fixed, fixes);

      // Step 10: Fix missing commas between properties - Enhanced
      fixed = this.fixMissingCommas(fixed, fixes);

      // Step 11: Handle double commas and empty slots
      fixed = this.fixDoubleCommas(fixed, fixes);

      // Step 12: Fix trailing commas
      fixed = this.fixTrailingCommas(fixed, fixes);

      // Step 13: Balance brackets and braces - Enhanced
      fixed = this.balanceBrackets(fixed, fixes);

      // Step 14: Handle multiple root objects - Enhanced
      fixed = this.handleMultipleRoots(fixed, fixes);

      // Step 15: Remove dangling artifacts
      fixed = this.removeDanglingArtifacts(fixed, fixes);

      // Step 16: Handle stringified JSON (recursive parsing) - Enhanced
      fixed = this.unescapeStringifiedJSON(fixed, fixes);

      // Step 17: Final cleanup
      fixed = fixed.trim();

      // Try to parse the result
      const parseResult = this.parse(fixed);
      if (parseResult.success) {
        return {
          success: true,
          data: fixed,
          fixes
        };
      } else {
        // If still can't parse, try some last-ditch efforts
        const finalAttempt = this.finalFixAttempt(fixed);
        const finalParseResult = this.parse(finalAttempt);
        
        if (finalParseResult.success) {
          fixes.push({
            type: 'other',
            description: 'Applied final recovery fixes',
            position: { start: 0, end: finalAttempt.length },
            original: fixed,
            fixed: finalAttempt
          });
          return {
            success: true,
            data: finalAttempt,
            fixes
          };
        }

        return {
          success: false,
          error: new JSONParseError('Unable to fix JSON after all attempts'),
          fixes
        };
      }
    } catch (error) {
      return {
        success: false,
        error: new JSONParseError('Failed to fix JSON', { cause: error as Error }),
        fixes: []
      };
    }
  }

  private static removeComments(text: string, fixes: FixReport[]): string {
    let result = text;
    const originalText = text;
    let hasChanges = false;

    // More robust comment removal that handles edge cases
    // Remove multi-line comments first
    const multiLinePattern = /\/\*[\s\S]*?\*\//g;
    if (multiLinePattern.test(result)) {
      result = result.replace(multiLinePattern, ' ');
      hasChanges = true;
    }

    // Remove single-line comments - but be more careful about strings
    const lines = result.split('\n');
    const newLines = lines.map(line => {
      let inString = false;
      let escaped = false;
      
      for (let i = 0; i < line.length - 1; i++) {
        if (escaped) {
          escaped = false;
          continue;
        }
        
        if (line[i] === '\\') {
          escaped = true;
          continue;
        }
        
        if (line[i] === '"' && !escaped) {
          inString = !inString;
        }
        
        if (!inString && line[i] === '/' && line[i + 1] === '/') {
          return line.substring(0, i).trim();
        }
      }
      
      return line;
    });
    
    const cleanedResult = newLines.join('\n');
    if (cleanedResult !== result) {
      result = cleanedResult;
      hasChanges = true;
    }

    if (hasChanges) {
      fixes.push({
        type: 'other',
        description: 'Removed comments',
        position: { start: 0, end: result.length },
        original: originalText,
        fixed: result
      });
    }

    return result;
  }

  private static convertLiterals(text: string, fixes: FixReport[]): string {
    let result = text;
    const originalText = text;
    let hasChanges = false;

    const literalReplacements = [
      { pattern: /\bNone\b/g, replacement: 'null' },
      { pattern: /\bundefined\b/g, replacement: 'null' },
      { pattern: /\bNULL\b/g, replacement: 'null' },
      { pattern: /\bTrue\b/g, replacement: 'true' },
      { pattern: /\bFalse\b/g, replacement: 'false' }
    ];

    for (const { pattern, replacement } of literalReplacements) {
      if (pattern.test(result)) {
        result = result.replace(pattern, replacement);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      fixes.push({
        type: 'other',
        description: 'Converted literals to JSON format',
        position: { start: 0, end: result.length },
        original: originalText,
        fixed: result
      });
    }

    return result;
  }

  private static convertHexNumbers(text: string, fixes: FixReport[]): string {
    let result = text;
    const hexPattern = /\b0x([0-9A-Fa-f]+)\b/g;
    let hasChanges = false;

    result = result.replace(hexPattern, (_match, hex) => {
      const decimal = parseInt(hex, 16);
      hasChanges = true;
      return decimal.toString();
    });

    if (hasChanges) {
      fixes.push({
        type: 'other',
        description: 'Converted hex numbers to decimal',
        position: { start: 0, end: result.length },
        original: text,
        fixed: result
      });
    }

    return result;
  }

  private static fixSingleQuotes(text: string, fixes: FixReport[]): string {
    let result = text;
    const originalText = text;
    let hasChanges = false;
    
    // More comprehensive single quote to double quote conversion
    // Handle escaped single quotes properly
    let newResult = '';
    let i = 0;
    
    while (i < result.length) {
      if (result[i] === "'") {
        // Found a single quote - find the matching closing quote
        let j = i + 1;
        let content = '';
        
        while (j < result.length) {
          if (result[j] === "'") {
            // Found closing quote
            break;
          } else if (result[j] === '\\' && j + 1 < result.length) {
            // Handle escape sequences
            content += result[j]! + result[j + 1]!;
            j += 2;
          } else {
            content += result[j];
            j++;
          }
        }
        
        if (j < result.length && result[j] === "'") {
          // Valid single-quoted string found
          newResult += '"' + content + '"';
          hasChanges = true;
          i = j + 1;
        } else {
          // Incomplete string, just copy the quote
          newResult += result[i];
          i++;
        }
      } else {
        newResult += result[i];
        i++;
      }
    }
    
    if (hasChanges) {
      result = newResult;
      fixes.push({
        type: 'quote',
        description: 'Converted single quotes to double quotes',
        position: { start: 0, end: result.length },
        original: originalText,
        fixed: result
      });
    }

    return result;
  }

  private static fixUnescapedQuotes(text: string, fixes: FixReport[]): string {
    let result = text;
    const originalText = text;
    let hasChanges = false;
    
    // More targeted approach: only fix quotes that are clearly malformed
    // Pattern: Look for strings with internal quotes that aren't followed by proper JSON delimiters
    
    // Handle cases like: "text "quotes" text" where there are multiple quote pairs in a value
    // But NOT cases like: "hello" where it's a single valid string
    
    // First, try to identify strings that have internal unescaped quotes
    const problematicQuotePattern = /"([^"\\]*)"(\s*)([^"\\]+)"(\s*)([^"\\]*)"(?=\s*[,}\]])/g;
    
    result = result.replace(problematicQuotePattern, (match, part1, space1, middle, space2, part2) => {
      // This pattern matches: "part1"middle"part2" 
      // Only fix if the middle part looks like it should be escaped quotes
      if (middle.trim().length > 0 && !middle.includes(':') && !middle.includes('{') && !middle.includes('[')) {
        hasChanges = true;
        return `"${part1}${space1}\\"${middle}\\"${space2}${part2}"`;
      }
      return match;
    });

    if (hasChanges) {
      fixes.push({
        type: 'quote',
        description: 'Fixed unescaped quotes in string values',
        position: { start: 0, end: result.length },
        original: originalText,
        fixed: result
      });
    }

    return result;
  }

  private static fixEscapeSequences(text: string, fixes: FixReport[]): string {
    let result = text;
    const originalText = text;
    let hasChanges = false;
    
    // Remove invalid escape sequences but preserve valid ones
    result = result.replace(/\\x[0-9A-Fa-f]{2}/g, '');
    if (result !== text) hasChanges = true;
    
    // Handle unicode escape sequences
    result = result.replace(/\\u[0-9A-Fa-f]{4}/g, (match) => {
      try {
        return JSON.parse(`"${match}"`);
      } catch {
        return '';
      }
    });

    if (hasChanges) {
      fixes.push({
        type: 'other',
        description: 'Fixed invalid escape sequences',
        position: { start: 0, end: result.length },
        original: originalText,
        fixed: result
      });
    }

    return result;
  }

  private static unescapeStringifiedJSON(text: string, fixes: FixReport[]): string {
    // Enhanced nested stringified JSON handling - more aggressive approach
    const originalText = text;
    let result = text;
    let hasChanges = false;
    let maxIterations = 10; // Prevent infinite loops
    
    while (maxIterations > 0) {
      let iterationChanges = false;
      maxIterations--;
      
      // Pattern to match strings that might contain stringified JSON
      const stringPattern = /"([^"\\]*(\\.[^"\\]*)*)"/g;
      
      result = result.replace(stringPattern, (match, content) => {
        try {
          // Check if the content looks like stringified JSON
          if (content.includes('\\"') && (content.includes('{') || content.includes('['))) {
            // Try to unescape the content
            let unescaped = content.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            
            // Try to parse the unescaped content
            try {
              const parseAttempt = this.parse(unescaped);
              if (parseAttempt.success) {
                iterationChanges = true;
                hasChanges = true;
                return unescaped;
              }
            } catch {
              // Try a recursive fix on the unescaped content
              try {
                const fixAttempt = this.fix(unescaped);
                if (fixAttempt.success) {
                  const parseAttempt = this.parse(fixAttempt.data!);
                  if (parseAttempt.success) {
                    iterationChanges = true;
                    hasChanges = true;
                    return fixAttempt.data!;
                  }
                }
              } catch {
                // Continue with original
              }
            }
          }
        } catch {
          // If unescaping fails, return original
        }
        return match;
      });
      
      if (!iterationChanges) {
        break; // No more changes, exit loop
      }
    }

    if (hasChanges) {
      fixes.push({
        type: 'other',
        description: 'Unescaped stringified JSON',
        position: { start: 0, end: result.length },
        original: originalText,
        fixed: result
      });
    }

    return result;
  }

  private static fixMissingCommas(text: string, fixes: FixReport[]): string {
    let result = text;
    const originalText = text;
    
    // Enhanced missing comma detection - more comprehensive patterns
    // Handle missing commas between object properties (most common case)
    result = result.replace(/"([^"]*)"(\s+)"([^"]+)"(\s*):/g, '"$1",$2"$3"$4:');
    
    // Handle missing commas after closing braces/brackets followed by new property
    result = result.replace(/}(\s*)"([^"]+)"(\s*):/g, '},$1"$2"$3:');
    result = result.replace(/](\s*)"([^"]+)"(\s*):/g, '],$1"$2"$3:');
    
    // Handle unquoted keys with missing commas
    result = result.replace(/(\w+)(\s+)(\w+)(\s*):/g, '$1,$2$3$4:');
    
    // Handle missing commas between values (numbers, booleans, etc) and next property
    result = result.replace(/(\d+|true|false|null)(\s+)("?\w+"?\s*:)/g, '$1,$2$3');
    
    // Handle missing commas between array/object elements
    result = result.replace(/}(\s*){/g, '},$1{');
    result = result.replace(/](\s*)\[/g, '],$1[');
    result = result.replace(/}(\s*)\[/g, '},$1[');
    result = result.replace(/](\s*){/g, '],$1{');
    
    // Handle values followed by properties without comma
    result = result.replace(/("(?:[^"\\]|\\.)*")(\s+)("?\w+"?\s*:)/g, '$1,$2$3');

    if (result !== originalText) {
      fixes.push({
        type: 'comma',
        description: 'Added missing commas',
        position: { start: 0, end: result.length },
        original: originalText,
        fixed: result
      });
    }

    return result;
  }

  private static fixTrailingCommas(text: string, fixes: FixReport[]): string {
    let result = text;
    
    // Remove trailing commas before closing braces/brackets
    result = result.replace(/,(\s*[}\]])/g, '$1');
    
    // Handle trailing commas with newlines
    result = result.replace(/,(\s*\n\s*[}\]])/g, '$1');

    if (result !== text) {
      fixes.push({
        type: 'comma',
        description: 'Removed trailing commas',
        position: { start: 0, end: result.length },
        original: text,
        fixed: result
      });
    }

    return result;
  }

  private static fixDoubleCommas(text: string, fixes: FixReport[]): string {
    let result = text;
    
    // Remove double commas and empty array slots
    result = result.replace(/,(\s*),/g, ',');
    result = result.replace(/\[(\s*),/g, '[');
    result = result.replace(/,(\s*)\]/g, ']');

    if (result !== text) {
      fixes.push({
        type: 'comma',
        description: 'Fixed double commas and empty slots',
        position: { start: 0, end: result.length },
        original: text,
        fixed: result
      });
    }

    return result;
  }

  private static quoteUnquotedKeys(text: string, fixes: FixReport[]): string {
    let result = text;
    const originalText = text;
    
    // Enhanced unquoted key detection
    // Quote unquoted object keys - be more careful about what constitutes a valid unquoted key
    result = result.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');

    if (result !== originalText) {
      fixes.push({
        type: 'quote',
        description: 'Quoted unquoted keys',
        position: { start: 0, end: result.length },
        original: originalText,
        fixed: result
      });
    }

    return result;
  }

  private static balanceBrackets(text: string, fixes: FixReport[]): string {
    let result = text;
    const originalText = text;
    let hasChanges = false;
    
    // Handle incomplete objects/arrays at the end first
    if (result.endsWith(':')) {
      result += 'null';
      hasChanges = true;
    }
    
    // Handle incomplete property assignments like {c: -> {c:null}
    if (result.match(/[{,]\s*\w+\s*:\s*$/)) {
      result += 'null';
      hasChanges = true;
    }
    
    // Fix bracket/brace mismatches
    if (result.includes('[') && result.includes('}')) {
      // More sophisticated mismatch detection
      // Build a stack to track expected closing delimiters
      let stack: Array<{ type: string; pos: number }> = [];
      let inString = false;
      let escaped = false;
      let corrections: Array<{ pos: number; from: string; to: string }> = [];
      
      for (let i = 0; i < result.length; i++) {
        const char = result[i];
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === '\\') {
          escaped = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === '{') {
            stack.push({ type: '}', pos: i });
          } else if (char === '[') {
            stack.push({ type: ']', pos: i });
          } else if (char === '}' || char === ']') {
            if (stack.length > 0) {
              const expected = stack.pop();
              if (expected && expected.type !== char) {
                // Mismatch detected - record it for correction
                corrections.push({ pos: i, from: char, to: expected.type });
              }
            }
          }
        }
      }
      
      // Apply corrections from right to left to preserve positions
      corrections.reverse().forEach(correction => {
        result = result.substring(0, correction.pos) + correction.to + result.substring(correction.pos + 1);
        hasChanges = true;
      });
    }
    
    // Handle incomplete objects/arrays more intelligently
    // If we have unmatched opening brackets, we might need to complete structures
    if (result.endsWith(',') || result.match(/,\s*$/)) {
      // Remove trailing commas before adding closing brackets
      result = result.replace(/,\s*$/, '');
      hasChanges = true;
    }
    
    // Better approach: track the opening stack and add closers in correct order
    const openStack = [];
    let stringMode = false;
    let escapeNext = false;
    
    // Build a stack of unclosed opening delimiters
    for (let i = 0; i < result.length; i++) {
      const char = result[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"') {
        stringMode = !stringMode;
        continue;
      }
      
      if (!stringMode) {
        if (char === '{') {
          openStack.push('}');
        } else if (char === '[') {
          openStack.push(']');
        } else if (char === '}' || char === ']') {
          // Remove the corresponding opener from the stack
          if (openStack.length > 0) {
            openStack.pop();
          }
        }
      }
    }
    
    // Add missing closing delimiters in reverse order (LIFO)
    while (openStack.length > 0) {
      result += openStack.pop();
      hasChanges = true;
    }

    if (hasChanges) {
      fixes.push({
        type: 'bracket',
        description: 'Balanced brackets and completed incomplete structures',
        position: { start: 0, end: result.length },
        original: originalText,
        fixed: result
      });
    }

    return result;
  }

  private static handleMultipleRoots(text: string, fixes: FixReport[]): string {
    // Enhanced multiple root object detection
    const trimmed = text.trim();
    
    // More comprehensive detection of multiple objects
    const objectSections = [];
    let braceCount = 0;
    let start = 0;
    let inString = false;
    let escaped = false;
    
    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];
      
      if (escaped) {
        escaped = false;
        continue;
      }
      
      if (char === '\\') {
        escaped = true;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') {
          if (braceCount === 0) {
            start = i;
          }
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            objectSections.push({
              text: trimmed.slice(start, i + 1),
              start,
              end: i + 1
            });
          }
        }
      }
    }

    // If we found multiple complete objects, combine them into an array
    if (objectSections.length > 1) {
      const validObjects = [];
      
      for (const section of objectSections) {
        try {
          const parseResult = this.parse(section.text.trim());
          if (parseResult.success) {
            validObjects.push(section.text.trim());
          }
        } catch {
          // Skip invalid objects
        }
      }
      
      if (validObjects.length > 1) {
        const arrayResult = '[' + validObjects.join(',') + ']';
        fixes.push({
          type: 'other',
          description: 'Converted multiple root objects to array',
          position: { start: 0, end: arrayResult.length },
          original: text,
          fixed: arrayResult
        });
        return arrayResult;
      }
    }
    
    // Handle CSV-style object rows (comma separated)
    if (trimmed.includes('}\n{') || trimmed.includes('},\n{')) {
      const lines = trimmed.split('\n');
      const objectLines = [];
      
      for (const line of lines) {
        const cleanLine = line.trim().replace(/,$/, ''); // Remove trailing comma
        if (cleanLine.startsWith('{') && cleanLine.endsWith('}')) {
          try {
            const parseResult = this.parse(cleanLine);
            if (parseResult.success) {
              objectLines.push(cleanLine);
            }
          } catch {
            // Skip invalid lines
          }
        }
      }
      
      if (objectLines.length > 1) {
        const arrayResult = '[' + objectLines.join(',') + ']';
        fixes.push({
          type: 'other',
          description: 'Converted CSV-style object rows to array',
          position: { start: 0, end: arrayResult.length },
          original: text,
          fixed: arrayResult
        });
        return arrayResult;
      }
    }

    return text;
  }

  private static removeDanglingArtifacts(text: string, fixes: FixReport[]): string {
    let result = text;
    
    // Remove dangling colons and other artifacts at the end
    result = result.replace(/:\s*["']?\s*$/, '');
    result = result.replace(/[,:;]\s*$/, '');
    
    if (result !== text) {
      fixes.push({
        type: 'other',
        description: 'Removed dangling artifacts',
        position: { start: 0, end: result.length },
        original: text,
        fixed: result
      });
    }

    return result;
  }

  private static fixDuplicateDelimiters(text: string, fixes: FixReport[]): string {
    let result = text;
    
    // Remove duplicate opening braces/brackets
    result = result.replace(/{{/g, '{');
    result = result.replace(/\[\[/g, '[');
    result = result.replace(/}}/g, '}');
    result = result.replace(/\]\]/g, ']');

    if (result !== text) {
      fixes.push({
        type: 'bracket',
        description: 'Fixed duplicate delimiters',
        position: { start: 0, end: result.length },
        original: text,
        fixed: result
      });
    }

    return result;
  }

  private static finalFixAttempt(text: string): string {
    // Enhanced last resort fixes
    let result = text.trim();
    
    // If it's empty (after comment removal), return null
    if (result === '' || result === '""') {
      return 'null';
    }
    
    // If it's just comments, return null
    if (result.startsWith('//') && !result.includes('{') && !result.includes('[')) {
      return 'null';
    }
    
    // Check for completely invalid input that shouldn't be fixed
    const hasJsonStructure = result.includes('{') || result.includes('[') || result.includes(':') || result.includes('"');
    if (!hasJsonStructure && result.split(' ').length > 3) {
      // This looks like plain text with multiple words, not JSON
      throw new Error('Input appears to be plain text, not malformed JSON');
    }
    
    // If it's a bare string without quotes but is already valid JSON, preserve it
    if (!result.includes('{') && !result.includes('[') && !result.includes('"')) {
      const trimmed = result.trim();
      
      // Handle primitive values
      if (trimmed === 'true' || trimmed === 'false' || trimmed === 'null') {
        return trimmed;
      }
      
      // Handle numbers
      if (!isNaN(Number(trimmed)) && trimmed !== '') {
        return trimmed;
      }
      
      // Handle single word strings - wrap in quotes
      if (trimmed && trimmed !== '' && !trimmed.includes(' ')) {
        return `"${trimmed}"`;
      }
    }
    
    // If it looks like object properties without wrapper, wrap it
    if (result.includes(':') && !result.trim().startsWith('{') && !result.trim().startsWith('[')) {
      return `{${result}}`;
    }
    
    // Handle case where we have objects but they're malformed at the end
    if (result.includes('{') && !result.includes('}')) {
      return result + '}';
    }
    
    // Handle case where we have arrays but they're malformed at the end
    if (result.includes('[') && !result.includes(']')) {
      return result + ']';
    }
    
    return result;
  }

  /**
   * Validate JSON data against a schema or basic validation
   */
  static validate(data: JSONValue, _schema?: any): { valid: boolean; errors: string[] } {
    // Basic validation - will be enhanced by Validator module
    const errors: string[] = [];

    if (data === undefined) {
      errors.push('Data is undefined');
    }

    if (data !== null && data !== undefined) {
      try {
        JSON.stringify(data);
      } catch (error) {
        errors.push('Data is not serializable to JSON');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Compare two JSON objects
   */
  static compare(obj1: JSONValue, obj2: JSONValue, _options?: any): { equal: boolean; differences?: any[] } {
    // Handle null and undefined cases
    if (obj1 === obj2) return { equal: true };
    if (obj1 === null && obj2 === null) return { equal: true };
    if (obj1 === undefined && obj2 === undefined) return { equal: true };
    if (obj1 === null || obj2 === null || obj1 === undefined || obj2 === undefined) {
      return { equal: false };
    }
    
    // Basic comparison - will be enhanced by Comparer module
    try {
      // Handle arrays and objects differently
      if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) return { equal: false };
        for (let i = 0; i < obj1.length; i++) {
          const val1 = obj1[i];
          const val2 = obj2[i];
          if (val1 === undefined && val2 === undefined) continue;
          if (val1 === undefined || val2 === undefined) return { equal: false };
          const result = this.compare(val1, val2);
          if (!result.equal) return { equal: false };
        }
        return { equal: true };
      }
      
      if (typeof obj1 === 'object' && typeof obj2 === 'object') {
        const keys1 = Object.keys(obj1 as any).sort();
        const keys2 = Object.keys(obj2 as any).sort();
        if (keys1.length !== keys2.length) return { equal: false };
        if (keys1.some((key, i) => key !== keys2[i])) return { equal: false };
        
        for (const key of keys1) {
          const result = this.compare((obj1 as any)[key], (obj2 as any)[key]);
          if (!result.equal) return { equal: false };
        }
        return { equal: true };
      }
      
      // For primitives
      return { equal: obj1 === obj2 };
    } catch {
      return { equal: false };
    }
  }

  /**
   * Analyze JSON structure and provide insights
   */
  static analyze(data: JSONValue, _options?: any): any {
    // Basic analysis - will be enhanced by Analyzer module
    const getType = (value: JSONValue): string => {
      if (value === null) return 'null';
      if (Array.isArray(value)) return 'array';
      return typeof value;
    };

    const getDepth = (obj: JSONValue): number => {
      if (typeof obj !== 'object' || obj === null) return 0;
      if (Array.isArray(obj)) {
        return obj.length === 0 ? 1 : 1 + Math.max(...obj.map(getDepth));
      }
      const values = Object.values(obj);
      return values.length === 0 ? 1 : 1 + Math.max(...values.map(getDepth));
    };

    return {
      type: getType(data),
      depth: getDepth(data),
      size: JSON.stringify(data).length,
    };
  }

  /**
   * Search within JSON data
   */
  static search(data: JSONValue, query: string, _options?: any): any {
    // Basic search - will be enhanced by Searcher module
    const results: any[] = [];
    const search = (obj: JSONValue, path: string = ''): void => {
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => search(item, `${path}[${index}]`));
        } else {
          Object.entries(obj).forEach(([key, value]) => {
            const newPath = path ? `${path}.${key}` : key;
            if (key.includes(query) || (typeof value === 'string' && value.includes(query))) {
              results.push({ path: newPath, key, value });
            }
            search(value, newPath);
          });
        }
      }
    };

    search(data);
    return { matches: results, totalFound: results.length };
  }

  /**
   * Transform JSON data using mapping rules
   */
  static transform(data: JSONValue, transformer: any, _options?: any): JSONValue {
    // Basic transformation - will be enhanced by Transformer module
    if (typeof transformer === 'function') {
      return transformer(data);
    }
    return data;
  }

  /**
   * Merge two JSON objects
   */
  static merge(obj1: JSONValue, obj2: JSONValue, strategy?: string): JSONValue {
    // Basic merge - will be enhanced by Merger module
    if (typeof obj1 !== 'object' || obj1 === null) {
      return typeof obj2 === 'object' && obj2 !== null ? obj2 : obj1;
    }
    if (typeof obj2 !== 'object' || obj2 === null) {
      return obj1;
    }

    // If either is an array, preserve the first one's type
    if (Array.isArray(obj1)) {
      return obj1;
    }
    if (Array.isArray(obj2)) {
      return obj1; // Preserve obj1 when obj2 is array but obj1 is object
    }

    const result = { ...obj1 };
    for (const [key, value] of Object.entries(obj2)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value) &&
          typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
        result[key] = this.merge(result[key]!, value, strategy);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Convert JSON to different formats
   */
  static convert(data: JSONValue, format: string, options?: any): string {
    // Basic conversion - will be enhanced by Converter module
    switch (format.toLowerCase()) {
      case 'yaml':
        return this.toYaml(data, options?.indent || 2);
      case 'xml':
        return this.toXml(data, options?.rootElement || 'root');
      case 'csv':
        return this.toCsv(data, options?.headers !== false);
      default:
        return JSON.stringify(data, null, options?.indent || 2);
    }
  }

  // ============================================================================
  // INSTANCE METHODS - Chainable Operations
  // ============================================================================

  /**
   * Set data for the instance
   */
  setData(data: JSONValue): this {
    this.data = data;
    return this;
  }

  /**
   * Get the current data
   */
  getData(): JSONValue | undefined {
    return this.data;
  }

  /**
   * Get the final result and reset the instance
   */
  get(): JSONValue | undefined {
    const result = this.data;
    this.data = null;
    this.errors = [];
    return result;
  }

  /**
   * Chain: Parse JSON string
   */
  parse(jsonString: string, options?: ParseOptions): this {
    const result = JSONMan.parse(jsonString, options);
    if (result.success) {
      this.data = result.data!;
    } else {
      this.errors.push(result.error! as unknown as Error);
    }
    return this;
  }

  /**
   * Chain: Validate current data
   */
  validate(schema?: any): this {
    const result = JSONMan.validate(this.data as JSONValue, schema);
    if (!result.valid) {
      this.errors.push(new Error(`Validation failed: ${result.errors.join(', ')}`));
    }
    return this;
  }

  /**
   * Chain: Transform current data
   */
  transform(transformer: any, options?: any): this {
    try {
      this.data = JSONMan.transform(this.data as JSONValue, transformer, options);
    } catch (error) {
      this.errors.push(error as Error);
    }
    return this;
  }

  /**
   * Chain: Merge with other data
   */
  merge(otherData: JSONValue, strategy?: string): this {
    try {
      this.data = JSONMan.merge(this.data as JSONValue, otherData, strategy);
    } catch (error) {
      this.errors.push(error as Error);
    }
    return this;
  }

  /**
   * Chain: Search within current data
   */
  search(query: string, options?: any): this {
    // For chaining, we might want to filter the data based on search results
    // This is a simplified implementation
    const results = JSONMan.search(this.data as JSONValue, query, options);
    if (results.matches.length > 0) {
      // Keep only matching data or metadata about matches
      this.data = { searchResults: results };
    }
    return this;
  }

  /**
   * Get any errors that occurred during chaining
   */
  getErrors(): Error[] {
    return [...this.errors];
  }

  /**
   * Check if there are any errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Clear all errors
   */
  clearErrors(): this {
    this.errors = [];
    return this;
  }

  // ============================================================================
  // UTILITY METHODS - Basic Converters
  // ============================================================================

  private static toYaml(data: JSONValue, indent: number): string {
    // Basic YAML conversion - will be enhanced by Converter module
    const spaces = ' '.repeat(indent);
    
    const convert = (obj: JSONValue, level: number = 0): string => {
      const prefix = spaces.repeat(level);
      
      if (obj === null) return 'null';
      if (typeof obj === 'string') return `"${obj}"`;
      if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
      
      if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        return obj.map(item => `${prefix}- ${convert(item, level + 1)}`).join('\n');
      }
      
      if (typeof obj === 'object') {
        const entries = Object.entries(obj);
        if (entries.length === 0) return '{}';
        return entries.map(([key, value]) => 
          `${prefix}${key}: ${convert(value, level + 1)}`
        ).join('\n');
      }
      
      return String(obj);
    };
    
    return convert(data);
  }

  private static toXml(data: JSONValue, rootElement: string): string {
    // Basic XML conversion - will be enhanced by Converter module
    const convert = (obj: JSONValue, tagName: string): string => {
      if (obj === null) return `<${tagName}></${tagName}>`;
      if (typeof obj === 'string') return `<${tagName}>${obj}</${tagName}>`;
      if (typeof obj === 'number' || typeof obj === 'boolean') {
        return `<${tagName}>${obj}</${tagName}>`;
      }
      
      if (Array.isArray(obj)) {
        return obj.map((item, index) => convert(item, `${tagName}_${index}`)).join('');
      }
      
      if (typeof obj === 'object') {
        const content = Object.entries(obj)
          .map(([key, value]) => convert(value, key))
          .join('');
        return `<${tagName}>${content}</${tagName}>`;
      }
      
      return `<${tagName}>${obj}</${tagName}>`;
    };
    
    return `<?xml version="1.0" encoding="UTF-8"?>\n${convert(data, rootElement)}`;
  }

  private static toCsv(data: JSONValue, includeHeaders: boolean): string {
    // Basic CSV conversion - will be enhanced by Converter module
    if (!Array.isArray(data)) {
      throw new Error('CSV conversion requires array data');
    }
    
    if (data.length === 0) return '';
    
    const firstItem = data[0];
    if (typeof firstItem !== 'object' || firstItem === null) {
      // Simple array
      return data.map(item => String(item)).join('\n');
    }
    
    // Array of objects
    const headers = Object.keys(firstItem);
    const rows = data.map(item => 
      headers.map(header => {
        const value = (item as any)[header];
        return typeof value === 'string' ? `"${value}"` : String(value);
      }).join(',')
    );
    
    if (includeHeaders) {
      return [headers.join(','), ...rows].join('\n');
    }
    
    return rows.join('\n');
  }

  // ============================================================================
  // STATIC SHORTCUTS TO SPECIALIZED CLASSES
  // ============================================================================

  // These will be populated when the modules are created
  static Parser: any;
  static Fixer: any;
  static Analyzer: any;
  static Searcher: any;
  static Comparer: any;
  static Merger: any;
  static Converter: any;
  static Validator: any;
  static Transformer: any;
}

// Export convenience functions
export const parse = JSONMan.parse.bind(JSONMan);
export const fix = JSONMan.fix.bind(JSONMan);
export const validate = JSONMan.validate.bind(JSONMan);
export const compare = JSONMan.compare.bind(JSONMan);
export const analyze = JSONMan.analyze.bind(JSONMan);
export const search = JSONMan.search.bind(JSONMan);
export const transform = JSONMan.transform.bind(JSONMan);
export const merge = JSONMan.merge.bind(JSONMan);
export const convert = JSONMan.convert.bind(JSONMan);

export default JSONMan;
