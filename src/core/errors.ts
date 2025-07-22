/**
 * Custom error classes for JSONMan library
 */

import { JSONManError, ErrorCode, ERROR_CODES } from './types';

/**
 * Base error class for all JSONMan errors
 */
export class JSONManBaseError extends Error implements JSONManError {
  public readonly code: ErrorCode;
  public readonly suggestions?: string[] | undefined;
  public readonly position?: {
    line: number;
    column: number;
    index: number;
  } | undefined;
  public readonly context?: {
    before: string;
    at: string;
    after: string;
  } | undefined;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      suggestions?: string[] | undefined;
      position?: { line: number; column: number; index: number } | undefined;
      context?: { before: string; at: string; after: string } | undefined;
      cause?: Error | undefined;
    }
  ) {
    super(message);
    this.name = 'JSONManError';
    this.code = code;
    this.suggestions = options?.suggestions;
    this.position = options?.position;
    this.context = options?.context;

    if (options?.cause && 'cause' in this) {
      (this as any).cause = options.cause;
    }

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ('captureStackTrace' in Error) {
      (Error as any).captureStackTrace(this, JSONManBaseError);
    }
  }

  /**
   * Get a detailed error message with suggestions and context
   */
  getDetailedMessage(): string {
    let message = this.message;

    if (this.position) {
      message += `\n  at line ${this.position.line}, column ${this.position.column}`;
    }

    if (this.context) {
      message += `\n  Context: ${this.context.before}[${this.context.at}]${this.context.after}`;
    }

    if (this.suggestions && this.suggestions.length > 0) {
      message += '\n  Suggestions:';
      this.suggestions.forEach(suggestion => {
        message += `\n    - ${suggestion}`;
      });
    }

    return message;
  }

  /**
   * Convert error to JSON format
   */
  toJSON(): JSONManError {
    return {
      code: this.code,
      message: this.message,
      suggestions: this.suggestions,
      position: this.position,
      context: this.context,
    };
  }
}

/**
 * Error thrown when JSON parsing fails
 */
export class JSONParseError extends JSONManBaseError {
  constructor(
    message: string,
    options?: {
      suggestions?: string[];
      position?: { line: number; column: number; index: number };
      context?: { before: string; at: string; after: string };
      cause?: Error;
    }
  ) {
    super(ERROR_CODES.PARSE_ERROR, message, options);
    this.name = 'JSONParseError';
  }

  static fromNativeError(error: SyntaxError, input: string): JSONParseError {
    const position = extractPositionFromNativeError(error, input);
    const context = position ? extractContext(input, position.index) : undefined;

    return new JSONParseError(error.message, {
      ...(position && { position }),
      ...(context && { context }),
      cause: error,
      suggestions: generateParseSuggestions(error.message, input),
    });
  }
}

/**
 * Error thrown when JSON is invalid but not necessarily malformed
 */
export class JSONValidationError extends JSONManBaseError {
  public readonly path: string;
  public readonly value?: any;
  public readonly expected?: string | undefined;

  constructor(
    message: string,
    path: string,
    options?: {
      value?: any;
      expected?: string | undefined;
      suggestions?: string[] | undefined;
    }
  ) {
    super(ERROR_CODES.VALIDATION_ERROR, message, options ? { suggestions: options.suggestions } : undefined);
    this.name = 'JSONValidationError';
    this.path = path;
    this.value = options?.value;
    this.expected = options?.expected;
  }
}

/**
 * Error thrown during transformation operations
 */
export class JSONTransformError extends JSONManBaseError {
  public readonly operation: string;
  public readonly path?: string | undefined;

  constructor(
    message: string,
    operation: string,
    options?: {
      path?: string | undefined;
      suggestions?: string[] | undefined;
      cause?: Error | undefined;
    }
  ) {
    super(ERROR_CODES.TRANSFORM_ERROR, message, {
      suggestions: options?.suggestions,
      ...(options?.cause && { cause: options.cause }),
    });
    this.name = 'JSONTransformError';
    this.operation = operation;
    this.path = options?.path;
  }
}

/**
 * Error thrown during merge operations
 */
export class JSONMergeError extends JSONManBaseError {
  public readonly conflictPath: string;
  public readonly strategy?: string | undefined;

  constructor(
    message: string,
    conflictPath: string,
    options?: {
      strategy?: string | undefined;
      suggestions?: string[] | undefined;
    }
  ) {
    super(ERROR_CODES.MERGE_ERROR, message, options ? { suggestions: options.suggestions } : undefined);
    this.name = 'JSONMergeError';
    this.conflictPath = conflictPath;
    this.strategy = options?.strategy;
  }
}

/**
 * Error thrown during search operations
 */
export class JSONSearchError extends JSONManBaseError {
  public readonly query: string;
  public readonly searchType: string;

  constructor(
    message: string,
    query: string,
    searchType: string,
    options?: {
      suggestions?: string[] | undefined;
    }
  ) {
    super(ERROR_CODES.SEARCH_ERROR, message, options ? { suggestions: options.suggestions } : undefined);
    this.name = 'JSONSearchError';
    this.query = query;
    this.searchType = searchType;
  }
}

/**
 * Error thrown during conversion operations
 */
export class JSONConvertError extends JSONManBaseError {
  public readonly targetFormat: string;
  public readonly sourceFormat: string;

  constructor(
    message: string,
    sourceFormat: string,
    targetFormat: string,
    options?: {
      suggestions?: string[] | undefined;
      cause?: Error | undefined;
    }
  ) {
    super(ERROR_CODES.CONVERT_ERROR, message, {
      suggestions: options?.suggestions,
      ...(options?.cause && { cause: options.cause }),
    });
    this.name = 'JSONConvertError';
    this.sourceFormat = sourceFormat;
    this.targetFormat = targetFormat;
  }
}

/**
 * Error thrown during analysis operations
 */
export class JSONAnalyzeError extends JSONManBaseError {
  public readonly analysisType: string;

  constructor(
    message: string,
    analysisType: string,
    options?: {
      suggestions?: string[] | undefined;
      cause?: Error | undefined;
    }
  ) {
    super(ERROR_CODES.ANALYZE_ERROR, message, {
      suggestions: options?.suggestions,
      ...(options?.cause && { cause: options.cause }),
    });
    this.name = 'JSONAnalyzeError';
    this.analysisType = analysisType;
  }
}

/**
 * Error thrown during fix operations
 */
export class JSONFixError extends JSONManBaseError {
  public readonly fixType: string;

  constructor(
    message: string,
    fixType: string,
    options?: {
      suggestions?: string[] | undefined;
      cause?: Error | undefined;
    }
  ) {
    super(ERROR_CODES.FIX_ERROR, message, {
      suggestions: options?.suggestions,
      ...(options?.cause && { cause: options.cause }),
    });
    this.name = 'JSONFixError';
    this.fixType = fixType;
  }
}

/**
 * Error thrown during comparison operations
 */
export class JSONCompareError extends JSONManBaseError {
  public readonly compareType: string;

  constructor(
    message: string,
    compareType: string,
    options?: {
      suggestions?: string[] | undefined;
      cause?: Error | undefined;
    }
  ) {
    super(ERROR_CODES.COMPARE_ERROR, message, {
      suggestions: options?.suggestions,
      ...(options?.cause && { cause: options.cause }),
    });
    this.name = 'JSONCompareError';
    this.compareType = compareType;
  }
}

// Utility functions

/**
 * Extract position information from native JSON.parse error
 */
function extractPositionFromNativeError(
  error: SyntaxError,
  input: string
): { line: number; column: number; index: number } | undefined {
  const message = error.message;
  
  // Try to extract position from error message
  const positionMatch = message.match(/position (\d+)/i);
  if (positionMatch && positionMatch[1]) {
    const index = parseInt(positionMatch[1], 10);
    const { line, column } = getLineColumnFromIndex(input, index);
    return { line, column, index };
  }

  // Try alternative patterns
  const lineColumnMatch = message.match(/line (\d+) column (\d+)/i);
  if (lineColumnMatch && lineColumnMatch[1] && lineColumnMatch[2]) {
    const line = parseInt(lineColumnMatch[1], 10);
    const column = parseInt(lineColumnMatch[2], 10);
    const index = getIndexFromLineColumn(input, line, column);
    return { line, column, index };
  }

  return undefined;
}

/**
 * Extract context around error position
 */
function extractContext(
  input: string,
  index: number,
  contextLength: number = 20
): { before: string; at: string; after: string } {
  const start = Math.max(0, index - contextLength);
  const end = Math.min(input.length, index + contextLength);
  
  const before = input.slice(start, index);
  const at = input.charAt(index) || 'EOF';
  const after = input.slice(index + 1, end);

  return { before, at, after };
}

/**
 * Convert index to line/column position
 */
function getLineColumnFromIndex(input: string, index: number): { line: number; column: number } {
  const lines = input.slice(0, index).split('\n');
  const line = lines.length;
  const column = (lines[lines.length - 1]?.length ?? 0) + 1;
  return { line, column };
}

/**
 * Convert line/column to index position
 */
function getIndexFromLineColumn(input: string, line: number, column: number): number {
  const lines = input.split('\n');
  let index = 0;
  
  for (let i = 0; i < line - 1 && i < lines.length; i++) {
    index += lines[i]!.length + 1; // +1 for newline
  }
  
  return index + column - 1;
}

/**
 * Generate helpful suggestions for parse errors
 */
function generateParseSuggestions(errorMessage: string, input: string): string[] {
  const suggestions: string[] = [];
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes('unexpected token')) {
    suggestions.push('Check for missing or extra commas, quotes, or brackets');
    suggestions.push('Ensure all strings are properly quoted with double quotes');
  }

  if (lowerMessage.includes('unexpected end')) {
    suggestions.push('Check for missing closing brackets or braces');
    suggestions.push('Ensure the JSON is complete and not truncated');
  }

  if (lowerMessage.includes('quote') || lowerMessage.includes('string')) {
    suggestions.push('Use double quotes for strings, not single quotes');
    suggestions.push('Escape special characters in strings with backslashes');
  }

  if (input.includes("'")) {
    suggestions.push('Replace single quotes with double quotes');
  }

  if (input.includes(',}') || input.includes(',]')) {
    suggestions.push('Remove trailing commas before closing brackets');
  }

  if (suggestions.length === 0) {
    suggestions.push('Validate your JSON syntax using a JSON validator');
    suggestions.push('Check the JSON specification at https://json.org');
  }

  return suggestions;
}

/**
 * Create a safe error result
 */
export function createErrorResult(error: JSONManBaseError): { success: false; error: JSONManBaseError; data?: never } {
  return {
    success: false,
    error,
  };
}

/**
 * Create a successful result
 */
export function createSuccessResult<T>(data: T): { success: true; data: T; error?: never } {
  return {
    success: true,
    data,
  };
}
