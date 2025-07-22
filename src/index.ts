/**
 * JSONMan - Comprehensive JSON Helper Library
 * 
 * Main entry point for the library
 */

// Core exports
export { JSONMan as default } from './core/JSONMan';
export { JSONMan } from './core/JSONMan';
export * from './core/types';
export * from './core/errors';

// Module exports
export { Parser } from './modules/parser/Parser';

// Utility exports
export * from './utils/helpers';
export { 
  VERSION as LIB_VERSION,
  LIBRARY_NAME,
  DEFAULT_OPTIONS,
  PERFORMANCE_LIMITS,
  MERGE_STRATEGIES,
  ARRAY_MERGE_OPTIONS,
  CONFLICT_STRATEGIES,
  CONVERT_FORMATS,
  QUOTE_STYLES,
  WHITESPACE_OPTIONS,
  JSON_SCHEMA_FORMATS,
  REGEX_PATTERNS,
  EVENT_TYPES,
  FILE_EXTENSIONS,
  MIME_TYPES,
  ENCODINGS,
  HTTP_STATUS,
  JSON_RPC,
  COMPLEXITY_LEVELS,
  PRIORITY_LEVELS,
  CACHE_KEYS,
  FEATURES,
} from './utils/constants';

// Convenience exports
export {
  parse,
  fix,
  validate,
  compare,
  analyze,
  search,
  transform,
  merge,
  convert,
} from './core/JSONMan';

// Version
export const VERSION = '1.0.0';
