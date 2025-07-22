/**
 * Constants for JSONMan library
 */

// Version
export const VERSION = '1.0.0';

// Library name
export const LIBRARY_NAME = 'JSONMan';

// JSON Types
export const JSON_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  NULL: 'null',
  OBJECT: 'object',
  ARRAY: 'array',
} as const;

// Error codes
export const ERROR_CODES = {
  PARSE_ERROR: 'PARSE_ERROR',
  INVALID_JSON: 'INVALID_JSON',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TRANSFORM_ERROR: 'TRANSFORM_ERROR',
  MERGE_ERROR: 'MERGE_ERROR',
  SEARCH_ERROR: 'SEARCH_ERROR',
  CONVERT_ERROR: 'CONVERT_ERROR',
  ANALYZE_ERROR: 'ANALYZE_ERROR',
  FIX_ERROR: 'FIX_ERROR',
  COMPARE_ERROR: 'COMPARE_ERROR',
} as const;

// Default options
export const DEFAULT_OPTIONS = {
  PARSE: {
    strict: true,
    allowTrailingCommas: false,
    allowComments: false,
  },
  FIX: {
    quotes: 'double' as const,
    trailingCommas: 'remove' as const,
    missingCommas: 'add' as const,
    brackets: 'balance' as const,
    whitespace: 'normalize' as const,
    comments: 'remove' as const,
  },
  MERGE: {
    strategy: 'deep' as const,
    arrays: 'concat' as const,
    conflicts: 'newer' as const,
    immutable: false,
  },
  SEARCH: {
    caseSensitive: false,
    regex: false,
    maxResults: 100,
    includeMetadata: true,
  },
  COMPARE: {
    ignoreOrder: false,
    ignoreCase: false,
    ignoreExtraProperties: false,
  },
  CONVERT: {
    indent: 2,
    headers: true,
    rootElement: 'root',
  },
  VALIDATE: {
    allowExtraProperties: true,
    coerceTypes: false,
  },
  TRANSFORM: {
    immutable: false,
  },
  ANALYZE: {
    includeSchema: true,
    includeStats: true,
    includeStructure: true,
    includePerformance: false,
    maxDepth: 50,
  },
} as const;

// Performance limits
export const PERFORMANCE_LIMITS = {
  MAX_DEPTH: 100,
  MAX_SIZE: 10_000_000, // 10MB
  MAX_NODES: 1_000_000,
  WARNING_DEPTH: 20,
  WARNING_SIZE: 1_000_000, // 1MB
  WARNING_NODES: 100_000,
} as const;

// Merge strategies
export const MERGE_STRATEGIES = {
  DEEP: 'deep',
  SHALLOW: 'shallow',
  CUSTOM: 'custom',
} as const;

// Array merge options
export const ARRAY_MERGE_OPTIONS = {
  CONCAT: 'concat',
  REPLACE: 'replace',
  UNION: 'union',
  MERGE: 'merge',
} as const;

// Conflict resolution strategies
export const CONFLICT_STRATEGIES = {
  NEWER: 'newer',
  OLDER: 'older',
  LARGER: 'larger',
  CUSTOM: 'custom',
} as const;

// Conversion formats
export const CONVERT_FORMATS = {
  YAML: 'yaml',
  XML: 'xml',
  CSV: 'csv',
  HTML: 'html',
  CUSTOM: 'custom',
} as const;

// Quote styles
export const QUOTE_STYLES = {
  SINGLE: 'single',
  DOUBLE: 'double',
  PRESERVE: 'preserve',
} as const;

// Whitespace options
export const WHITESPACE_OPTIONS = {
  NORMALIZE: 'normalize',
  PRESERVE: 'preserve',
  MINIFY: 'minify',
} as const;

// Common JSON Schema formats
export const JSON_SCHEMA_FORMATS = {
  DATE_TIME: 'date-time',
  DATE: 'date',
  TIME: 'time',
  EMAIL: 'email',
  HOSTNAME: 'hostname',
  IPV4: 'ipv4',
  IPV6: 'ipv6',
  URI: 'uri',
  UUID: 'uuid',
} as const;

// Regular expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  IPV6: /^(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i,
  URL: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/,
  JSON_PATH: /^\$(?:\.[a-zA-Z_][a-zA-Z0-9_]*|\[\d+\]|\[["'].*?["']\])*$/,
  ISO_DATE: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/,
} as const;

// Event types
export const EVENT_TYPES = {
  PARSE: 'parse',
  FIX: 'fix',
  ANALYZE: 'analyze',
  SEARCH: 'search',
  COMPARE: 'compare',
  MERGE: 'merge',
  CONVERT: 'convert',
  VALIDATE: 'validate',
  TRANSFORM: 'transform',
} as const;

// File extensions
export const FILE_EXTENSIONS = {
  JSON: '.json',
  YAML: '.yaml',
  YML: '.yml',
  XML: '.xml',
  CSV: '.csv',
  HTML: '.html',
} as const;

// MIME types
export const MIME_TYPES = {
  JSON: 'application/json',
  YAML: 'application/x-yaml',
  XML: 'application/xml',
  CSV: 'text/csv',
  HTML: 'text/html',
} as const;

// Character encodings
export const ENCODINGS = {
  UTF8: 'utf8',
  UTF16: 'utf16',
  ASCII: 'ascii',
  BASE64: 'base64',
} as const;

// Common HTTP status codes for JSON APIs
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// JSON-RPC constants
export const JSON_RPC = {
  VERSION: '2.0',
  ERROR_CODES: {
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603,
  },
} as const;

// Complexity levels
export const COMPLEXITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  EXTREME: 'extreme',
} as const;

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Cache keys
export const CACHE_KEYS = {
  PARSED_JSON: 'parsed_json',
  VALIDATION_RESULT: 'validation_result',
  ANALYSIS_RESULT: 'analysis_result',
  SEARCH_RESULT: 'search_result',
  TRANSFORM_RESULT: 'transform_result',
} as const;

// Feature flags
export const FEATURES = {
  STREAMING_PARSER: true,
  ASYNC_VALIDATION: true,
  PERFORMANCE_MONITORING: true,
  CACHING: true,
  COMPRESSION: false,
} as const;
