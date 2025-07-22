/**
 * Utility Functions Tests
 */

import {
  isValidJSON,
  deepClone,
  debounce,
  throttle
} from '../src/utils/helpers';

describe('Utility Functions', () => {
  describe('isValidJSON()', () => {
    it('should return true for valid JSON', () => {
      expect(isValidJSON('{"name": "John"}')).toBe(true);
      expect(isValidJSON('[]')).toBe(true);
      expect(isValidJSON('null')).toBe(true);
      expect(isValidJSON('42')).toBe(true);
      expect(isValidJSON('"string"')).toBe(true);
    });

    it('should return false for invalid JSON', () => {
      expect(isValidJSON('{"name": "John"')).toBe(false);
      expect(isValidJSON('undefined')).toBe(false);
      expect(isValidJSON('')).toBe(false);
      expect(isValidJSON('{"name": undefined}')).toBe(false);
    });
  });

  describe('deepClone()', () => {
    it('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('string')).toBe('string');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
    });

    it('should clone objects deeply', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);
      
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it('should clone arrays deeply', () => {
      const arr = [1, [2, 3], { a: 4 }];
      const cloned = deepClone(arr);
      
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[1]).not.toBe(arr[1]);
      expect(cloned[2]).not.toBe(arr[2]);
    });
  });

  describe('Performance Utilities', () => {
    describe('debounce()', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should debounce function calls', () => {
        const fn = jest.fn();
        const debounced = debounce(fn, 100);

        debounced();
        debounced();
        debounced();

        expect(fn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledTimes(1);
      });

      it('should pass arguments correctly', () => {
        const fn = jest.fn();
        const debounced = debounce(fn, 100);

        debounced('arg1', 'arg2');

        jest.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
      });
    });

    describe('throttle()', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should throttle function calls', () => {
        const fn = jest.fn();
        const throttled = throttle(fn, 100);

        throttled();
        throttled();
        throttled();

        expect(fn).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(100);

        throttled();

        expect(fn).toHaveBeenCalledTimes(2);
      });
    });
  });
});
