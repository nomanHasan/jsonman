/**
 * Utility functions for JSONMan library
 */

import { JSONValue, JSONObject, JSONArray } from '../core/types';

/**
 * Type guards for JSON values
 */
export const isString = (value: JSONValue): value is string => typeof value === 'string';
export const isNumber = (value: JSONValue): value is number => typeof value === 'number';
export const isBoolean = (value: JSONValue): value is boolean => typeof value === 'boolean';
export const isNull = (value: JSONValue): value is null => value === null;
export const isObject = (value: JSONValue): value is JSONObject => 
  typeof value === 'object' && value !== null && !Array.isArray(value);
export const isArray = (value: JSONValue): value is JSONArray => Array.isArray(value);
export const isPrimitive = (value: JSONValue): value is string | number | boolean | null =>
  typeof value !== 'object' || value === null;

/**
 * Safe JSON parsing utilities
 */
export function safeParseJSON(json: string): { success: true; data: JSONValue } | { success: false; error: Error } {
  try {
    const data = JSON.parse(json);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

/**
 * Deep clone a JSON value
 */
export function deepClone<T extends JSONValue>(value: T): T {
  if (isPrimitive(value)) {
    return value;
  }
  
  if (isArray(value)) {
    return value.map(item => deepClone(item)) as T;
  }
  
  if (isObject(value)) {
    const cloned: JSONObject = {};
    for (const [key, val] of Object.entries(value)) {
      cloned[key] = deepClone(val);
    }
    return cloned as T;
  }
  
  return value;
}

/**
 * Get the type of a JSON value
 */
export function getJSONType(value: JSONValue): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Get a value from an object using a path (dot notation)
 */
export function getByPath(obj: JSONValue, path: string): JSONValue | undefined {
  if (!path) return obj;
  
  const keys = path.split('.');
  let current: JSONValue = obj;
  
  for (const key of keys) {
    if (!isObject(current) && !isArray(current)) {
      return undefined;
    }
    
    if (isArray(current)) {
      const index = parseInt(key, 10);
      if (isNaN(index) || index < 0 || index >= current.length) {
        return undefined;
      }
      const next = current[index];
      if (next === undefined) {
        return undefined;
      }
      current = next;
    } else if (isObject(current)) {
      const next = current[key];
      if (next === undefined) {
        return undefined;
      }
      current = next;
    }
  }
  
  return current;
}

/**
 * Set a value in an object using a path (dot notation)
 */
export function setByPath(obj: JSONObject, path: string, value: JSONValue): void {
  if (!path) return;
  
  const keys = path.split('.');
  let current: any = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!;
    const nextKey = keys[i + 1]!;
    
    if (!(key in current) || (!isObject(current[key]) && !isArray(current[key]))) {
      // Determine if next level should be array or object
      const nextIndex = parseInt(nextKey, 10);
      current[key] = isNaN(nextIndex) ? {} : [];
    }
    
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1]!;
  current[lastKey] = value;
}

/**
 * Delete a value from an object using a path (dot notation)
 */
export function deleteByPath(obj: JSONObject, path: string): boolean {
  if (!path) return false;
  
  const keys = path.split('.');
  let current: any = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!;
    if (!isObject(current) || !(key in current)) {
      return false;
    }
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1]!;
  if (isObject(current) && lastKey in current) {
    delete current[lastKey];
    return true;
  } else if (isArray(current)) {
    const index = parseInt(lastKey, 10);
    if (!isNaN(index) && index >= 0 && index < current.length) {
      current.splice(index, 1);
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a path exists in an object
 */
export function hasPath(obj: JSONValue, path: string): boolean {
  return getByPath(obj, path) !== undefined;
}

/**
 * Get all paths in an object
 */
export function getAllPaths(obj: JSONValue, prefix: string = ''): string[] {
  const paths: string[] = [];
  
  if (isObject(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      paths.push(currentPath);
      paths.push(...getAllPaths(value, currentPath));
    }
  } else if (isArray(obj)) {
    obj.forEach((value, index) => {
      const currentPath = prefix ? `${prefix}.${index}` : index.toString();
      paths.push(currentPath);
      paths.push(...getAllPaths(value, currentPath));
    });
  }
  
  return paths;
}

/**
 * Flatten an object to dot notation
 */
export function flatten(obj: JSONValue, separator: string = '.', prefix: string = ''): Record<string, JSONValue> {
  const result: Record<string, JSONValue> = {};
  
  if (isPrimitive(obj)) {
    result[prefix || 'value'] = obj;
    return result;
  }
  
  if (isArray(obj)) {
    obj.forEach((value, index) => {
      const key = prefix ? `${prefix}${separator}${index}` : index.toString();
      if (isPrimitive(value)) {
        result[key] = value;
      } else {
        Object.assign(result, flatten(value, separator, key));
      }
    });
  } else if (isObject(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key;
      if (isPrimitive(value)) {
        result[newKey] = value;
      } else {
        Object.assign(result, flatten(value, separator, newKey));
      }
    }
  }
  
  return result;
}

/**
 * Unflatten a dot notation object
 */
export function unflatten(obj: Record<string, JSONValue>, separator: string = '.'): JSONValue {
  const result: JSONObject = {};
  
  for (const [key, value] of Object.entries(obj)) {
    setByPath(result, key.replace(new RegExp(`\\${separator}`, 'g'), '.'), value);
  }
  
  // If result has only numeric keys, convert to array
  const keys = Object.keys(result);
  const isArrayLike = keys.every(key => /^\d+$/.test(key));
  
  if (isArrayLike && keys.length > 0) {
    const maxIndex = Math.max(...keys.map(k => parseInt(k, 10)));
    const arr: JSONValue[] = new Array(maxIndex + 1);
    
    for (const [key, value] of Object.entries(result)) {
      arr[parseInt(key, 10)] = value;
    }
    
    return arr;
  }
  
  return result;
}

/**
 * Calculate the depth of a JSON structure
 */
export function getDepth(obj: JSONValue): number {
  if (isPrimitive(obj)) {
    return 0;
  }
  
  if (isArray(obj)) {
    return obj.length === 0 ? 1 : 1 + Math.max(...obj.map(getDepth));
  }
  
  if (isObject(obj)) {
    const values = Object.values(obj);
    return values.length === 0 ? 1 : 1 + Math.max(...values.map(getDepth));
  }
  
  return 0;
}

/**
 * Calculate the size (number of nodes) in a JSON structure
 */
export function getSize(obj: JSONValue): number {
  if (isPrimitive(obj)) {
    return 1;
  }
  
  if (isArray(obj)) {
    return 1 + obj.reduce((sum: number, item) => sum + getSize(item), 0);
  }
  
  if (isObject(obj)) {
    return 1 + Object.values(obj).reduce((sum: number, item) => sum + getSize(item), 0);
  }
  
  return 1;
}

/**
 * Get type distribution of a JSON structure
 */
export function getTypeDistribution(obj: JSONValue): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  function count(value: JSONValue) {
    const type = getJSONType(value);
    distribution[type] = (distribution[type] || 0) + 1;
    
    if (isArray(value)) {
      value.forEach(count);
    } else if (isObject(value)) {
      Object.values(value).forEach(count);
    }
  }
  
  count(obj);
  return distribution;
}

/**
 * Escape a string for use in JSON
 */
export function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\b/g, '\\b')
    .replace(/\f/g, '\\f');
}

/**
 * Unescape a JSON string
 */
export function unescapeString(str: string): string {
  return str
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f');
}

/**
 * Generate a unique key for a JSON structure (for caching)
 */
export function generateKey(obj: JSONValue): string {
  return JSON.stringify(obj, Object.keys(obj as any).sort());
}

/**
 * Measure execution time of a function
 */
export function measureTime<T>(fn: () => T): { result: T; time: number } {
  const start = performance.now();
  const result = fn();
  const time = performance.now() - start;
  return { result, time };
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;
  
  return (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay) as any;
  };
}

/**
 * Create a throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      fn(...args);
      lastExecTime = currentTime;
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        fn(...args);
        lastExecTime = Date.now();
        timeoutId = null;
      }, delay - (currentTime - lastExecTime)) as any;
    }
  };
}

/**
 * Validate that a string is valid JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format JSON with custom indentation
 */
export function formatJSON(obj: JSONValue, indent: number | string = 2): string {
  return JSON.stringify(obj, null, indent);
}

/**
 * Minify JSON (remove all whitespace)
 */
export function minifyJSON(obj: JSONValue): string {
  return JSON.stringify(obj);
}
