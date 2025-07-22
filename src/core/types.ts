/**
 * Core type definitions for JSONMan library
 */

// Basic JSON types
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type KeyPath = string | string[];
export type JSONPath = string;

// Error types
export interface JSONManError {
  code: string;
  message: string;
  suggestions?: string[] | undefined;
  position?: {
    line: number;
    column: number;
    index: number;
  } | undefined;
  context?: {
    before: string;
    at: string;
    after: string;
  } | undefined;
}

// Result types
export interface Result<T, E = JSONManError> {
  success: boolean;
  data?: T;
  error?: E;
}

export interface SuccessResult<T> extends Result<T> {
  success: true;
  data: T;
  error?: never;
}

export interface ErrorResult<E = JSONManError> extends Result<never, E> {
  success: false;
  data?: never;
  error: E;
}

// Parser types
// Parser-specific options
export interface ParseOptions {
  strict?: boolean;
  reviver?: (key: string, value: JSONValue) => JSONValue;
  maxDepth?: number;
  allowComments?: boolean;
  allowTrailingCommas?: boolean;
  allowSingleQuotes?: boolean;
  allowUnquotedKeys?: boolean;
}

// Parser-specific types
export interface DiagnosticInfo {
  isValid: boolean;
  errors: Array<{
    type: 'syntax' | 'quote' | 'comma' | 'key' | 'value' | 'brace' | 'bracket' | 'string';
    message: string;
    position?: number;
    line?: number;
    column?: number;
    suggestion: string;
  }>;
}

export interface RecoveryResult {
  success: boolean;
  data?: JSONValue;
  recovered: boolean;
  fixesApplied: string[];
  originalError?: Error;
}

export interface PartialParseResult {
  success: boolean;
  data?: JSONValue;
  isPartial: boolean;
  completedString?: string;
  error?: Error;
}

export interface MultipleParseResult {
  successful: number;
  failed: number;
  results: ParseResult<JSONValue>[];
}

export interface ParseError {
  type: string;
  message: string;
  position?: number;
  line?: number;
  column?: number;
}

export interface ParseResult<T = JSONValue> extends Result<T> {
  warnings?: string[];
}

// Fixer types
export interface FixOptions {
  quotes?: 'single' | 'double' | 'preserve';
  trailingCommas?: 'remove' | 'preserve' | 'add';
  missingCommas?: 'add' | 'ignore';
  brackets?: 'balance' | 'preserve';
  whitespace?: 'normalize' | 'preserve' | 'minify';
  comments?: 'remove' | 'preserve';
}

export interface FixResult extends Result<string> {
  fixes: FixReport[];
}

export interface FixReport {
  type: 'quote' | 'comma' | 'bracket' | 'whitespace' | 'other';
  description: string;
  position: {
    start: number;
    end: number;
  };
  original: string;
  fixed: string;
}

// Analyzer types
export interface AnalysisOptions {
  includeSchema?: boolean;
  includeStats?: boolean;
  includeStructure?: boolean;
  includePerformance?: boolean;
  maxDepth?: number;
}

export interface AnalysisResult {
  schema?: JSONSchema;
  stats?: JSONStats;
  structure?: StructureInfo;
  performance?: PerformanceInfo;
}

export interface JSONSchema {
  type: string;
  properties?: { [key: string]: JSONSchema };
  items?: JSONSchema;
  required?: string[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  enum?: JSONValue[];
}

export interface JSONStats {
  totalSize: number;
  depth: number;
  nodeCount: number;
  typeDistribution: {
    [type: string]: number;
  };
  complexity: 'low' | 'medium' | 'high';
}

export interface StructureInfo {
  type: 'object' | 'array' | 'primitive';
  children?: { [key: string]: StructureInfo };
  items?: StructureInfo;
  metadata: {
    keys?: string[];
    length?: number;
    nullable?: boolean;
  };
}

export interface PerformanceInfo {
  parseTime?: number;
  memoryUsage?: number;
  warnings: string[];
  recommendations: string[];
}

// Searcher types
export interface SearchOptions {
  caseSensitive?: boolean;
  regex?: boolean;
  path?: JSONPath;
  maxResults?: number;
  includeMetadata?: boolean;
}

export interface SearchResult {
  matches: SearchMatch[];
  totalFound: number;
  searchTime: number;
}

export interface SearchMatch {
  path: string;
  value: JSONValue;
  key?: string;
  parent?: JSONValue;
  metadata?: {
    type: string;
    depth: number;
    index?: number;
  };
}

// Comparer types
export interface CompareOptions {
  ignoreOrder?: boolean;
  ignoreCase?: boolean;
  ignoreExtraProperties?: boolean;
  customComparators?: {
    [key: string]: (a: JSONValue, b: JSONValue) => boolean;
  };
  pathIgnore?: string[];
}

export interface CompareResult {
  equal: boolean;
  differences: Difference[];
  summary: {
    added: number;
    removed: number;
    modified: number;
  };
}

export interface Difference {
  type: 'added' | 'removed' | 'modified';
  path: string;
  oldValue?: JSONValue;
  newValue?: JSONValue;
  message: string;
}

// Merger types
export interface MergeOptions {
  strategy?: 'deep' | 'shallow' | 'custom';
  arrays?: 'concat' | 'replace' | 'union' | 'merge';
  conflicts?: 'newer' | 'older' | 'larger' | 'custom';
  immutable?: boolean;
  resolver?: ConflictResolver;
  filter?: (key: string, value: JSONValue, path: string) => boolean;
}

export type ConflictResolver = (
  key: string,
  oldValue: JSONValue,
  newValue: JSONValue,
  path: string
) => JSONValue;

export interface MergeResult extends Result<JSONValue> {
  conflicts: ConflictReport[];
}

export interface ConflictReport {
  path: string;
  oldValue: JSONValue;
  newValue: JSONValue;
  resolution: JSONValue;
  strategy: string;
}

// Converter types
export interface ConvertOptions {
  format: 'yaml' | 'xml' | 'csv' | 'html' | 'custom';
  indent?: number | string;
  headers?: boolean;
  rootElement?: string;
  customSerializer?: Serializer;
}

export type Serializer = (value: JSONValue, key?: string, path?: string) => string;

export interface ConvertResult extends Result<string> {
  format: string;
  size: number;
}

// Validator types
export interface ValidationOptions {
  schema?: JSONSchema;
  rules?: ValidationRules;
  allowExtraProperties?: boolean;
  coerceTypes?: boolean;
}

export interface ValidationRules {
  required?: string[];
  types?: { [key: string]: string };
  patterns?: { [key: string]: RegExp | string };
  ranges?: { [key: string]: { min?: number; max?: number } };
  custom?: { [key: string]: ValidationFunction };
}

export type ValidationFunction = (value: JSONValue, path: string) => boolean | string;

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
  value?: JSONValue;
  expected?: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  code: string;
  suggestion?: string;
}

// Transformer types
export interface TransformOptions {
  mapping?: { [key: string]: string | TransformFunction };
  filters?: FilterFunction[];
  sort?: string | SortFunction;
  immutable?: boolean;
}

export type TransformFunction = (value: JSONValue, key: string, path: string) => JSONValue;
export type FilterFunction = (value: JSONValue, key: string, path: string) => boolean;
export type SortFunction = (a: JSONValue, b: JSONValue) => number;

export interface TransformResult extends Result<JSONValue> {
  transformations: TransformationReport[];
}

export interface TransformationReport {
  type: 'mapping' | 'filter' | 'sort' | 'custom';
  description: string;
  affectedPaths: string[];
}

// Configuration types
export interface JSONManOptions {
  strict?: boolean;
  performance?: boolean;
  warnings?: boolean;
  maxDepth?: number;
  maxSize?: number;
}

// Plugin types
export interface Plugin {
  name: string;
  version: string;
  install: (instance: any) => void;
  uninstall?: (instance: any) => void;
}

// Event types
export type EventType = 'parse' | 'fix' | 'analyze' | 'search' | 'compare' | 'merge' | 'convert' | 'validate' | 'transform';

export interface EventData {
  type: EventType;
  timestamp: number;
  duration?: number;
  input?: any;
  output?: any;
  error?: JSONManError;
}

export type EventListener = (event: EventData) => void;

// Utility type guards
export const isJSONObject = (value: JSONValue): value is JSONObject => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isJSONArray = (value: JSONValue): value is JSONArray => {
  return Array.isArray(value);
};

export const isJSONPrimitive = (value: JSONValue): value is string | number | boolean | null => {
  return typeof value !== 'object' || value === null;
};

// Constants
export const JSON_TYPES = ['string', 'number', 'boolean', 'null', 'object', 'array'] as const;
export type JSONType = typeof JSON_TYPES[number];

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

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
