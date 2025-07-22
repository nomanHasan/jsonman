/**
 * Advanced JSON Parser with error recovery and diagnostics
 */

import {
  JSONValue,
  ParseOptions,
  ParseResult
} from '../../core/types';

import { JSONParseError } from '../../core/errors';

export class Parser {
  /**
   * Safe JSON parsing with detailed error information
   */
  static safe(input: string, options: ParseOptions = {}): ParseResult<JSONValue> {
    try {
      const data = JSON.parse(input, options.reviver);
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: new JSONParseError(
          `JSON Parse Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          { cause: error as Error }
        )
      };
    }
  }

  /**
   * Type-safe JSON parsing with validation
   */
  static typed<T extends JSONValue>(
    input: string,
    validator?: (data: JSONValue) => data is T,
    options?: ParseOptions
  ): ParseResult<T> {
    const result = Parser.safe(input, options);
    
    if (!result.success) {
      return result as ParseResult<T>;
    }

    if (validator && result.data !== undefined && !validator(result.data)) {
      return {
        success: false,
        error: new JSONParseError(
          'Parsed data does not match expected type',
          { suggestions: ['Check your type validator function'] }
        )
      };
    }

    return result as ParseResult<T>;
  }

  /**
   * Parse multiple JSON lines
   */
  static multiple(input: string, options?: ParseOptions): { successful: number; failed: number; results: ParseResult<JSONValue>[] } {
    const lines = input.split('\n').filter(line => line.trim());
    const results: ParseResult<JSONValue>[] = [];
    let successful = 0;
    let failed = 0;

    for (const line of lines) {
      const result = Parser.safe(line, options);
      results.push(result);
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    }

    return { successful, failed, results };
  }

  /**
   * Parse partial/incomplete JSON with completion
   */
  static partial(input: string, options?: ParseOptions): { success: boolean; data?: JSONValue; isPartial: boolean; completedString?: string; error?: Error } {
    // First try normal parsing
    const normalResult = Parser.safe(input, options);
    if (normalResult.success) {
      return {
        success: true,
        data: normalResult.data,
        isPartial: false
      };
    }

    // Try to complete the JSON
    let completed = input.trim();
    
    // Simple completion strategies
    if (!completed.endsWith('}') && completed.includes('{')) {
      completed += '}';
    } else if (!completed.endsWith(']') && completed.includes('[')) {
      completed += ']';
    } else if (!completed.endsWith('"') && completed.includes('"') && completed.split('"').length % 2 === 0) {
      completed += '"';
    }

    const completedResult = Parser.safe(completed, options);
    if (completedResult.success) {
      return {
        success: true,
        data: completedResult.data,
        isPartial: true,
        completedString: completed
      };
    }

    return {
      success: false,
      isPartial: false,
      error: normalResult.error as Error
    };
  }

  /**
   * Parse with error recovery
   */
  static withRecovery(jsonString: string, options?: ParseOptions): ParseResult<JSONValue> & { recovered: boolean; fixesApplied: string[] } {
    // First try normal parsing
    const normalResult = Parser.safe(jsonString, options);
    if (normalResult.success) {
      return {
        ...normalResult,
        recovered: false,
        fixesApplied: []
      };
    }

    const fixesApplied: string[] = [];
    let text = jsonString;

    // Apply common fixes
    if (text.includes("'")) {
      text = text.replace(/'/g, '"');
      fixesApplied.push('Fix single quotes');
    }

    if (text.includes(',}') || text.includes(',]')) {
      text = text.replace(/,(\s*[}\]])/g, '$1');
      fixesApplied.push('Remove trailing commas');
    }

    // Quote unquoted keys
    if (/{\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/.test(text)) {
      text = text.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
      fixesApplied.push('Quote unquoted keys');
    }

    // Fix undefined values
    if (text.includes('undefined')) {
      text = text.replace(/:\s*undefined/g, ': null');
      fixesApplied.push('Fix undefined values');
    }

    // Remove comments
    if (text.includes('//') || text.includes('/*')) {
      text = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      fixesApplied.push('Remove comments');
    }

    const recoveredResult = Parser.safe(text, options);
    return {
      ...recoveredResult,
      recovered: recoveredResult.success,
      fixesApplied
    };
  }

  /**
   * Diagnose JSON syntax issues
   */
  static diagnose(jsonString: string): { isValid: boolean; errors: Array<{ type: string; message: string; suggestion: string }> } {
    const result = Parser.safe(jsonString);
    if (result.success) {
      return { isValid: true, errors: [] };
    }

    const errors: Array<{ type: string; message: string; suggestion: string }> = [];

    // Check for common issues
    const issues = [
      {
        pattern: /'/g,
        type: 'quote',
        message: 'Single quotes found',
        suggestion: 'Use double quotes instead',
      },
      {
        pattern: /,(\s*[}\]])/g,
        type: 'comma',
        message: 'Trailing comma found',
        suggestion: 'Remove trailing commas',
      },
      {
        pattern: /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
        type: 'key',
        message: 'Unquoted key found',
        suggestion: 'Quote all object keys',
      },
      {
        pattern: /:\s*undefined/g,
        type: 'value',
        message: 'undefined value found',
        suggestion: 'Use null instead of undefined',
      },
    ];

    for (const issue of issues) {
      const matches = Array.from(jsonString.matchAll(issue.pattern));
      for (const _match of matches) {
        errors.push({
          type: issue.type,
          message: issue.message,
          suggestion: issue.suggestion,
        });
      }
    }

    return { isValid: false, errors };
  }
}

export default Parser;
