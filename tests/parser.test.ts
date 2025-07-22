/**
 * Parser Module Tests
 */

import { Parser } from '../src/modules/parser/Parser';
import { JSONParseError } from '../src/core/errors';

describe('Parser Module', () => {
  describe('safe()', () => {
    it('should parse valid JSON successfully', () => {
      const result = Parser.safe('{"name": "John", "age": 30}');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John', age: 30 });
      expect(result.error).toBeUndefined();
    });

    it('should handle invalid JSON with detailed errors', () => {
      const result = Parser.safe('{"name": "John", "age":}');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(JSONParseError);
      expect(result.error?.code).toBe('PARSE_ERROR');
    });

    it('should parse with strict mode enabled', () => {
      const jsonWithComments = `{
        "name": "John", // This is a comment
        "age": 30
      }`;
      
      const result = Parser.safe(jsonWithComments, { strict: true });
      expect(result.success).toBe(false);
    });

    it('should parse with non-strict mode and comments allowed', () => {
      const jsonWithComments = `{
        "name": "John", // This is a comment
        "age": 30
      }`;
      
      const result = Parser.safe(jsonWithComments, {
        strict: false,
        allowComments: true
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John', age: 30 });
    });

    it('should handle trailing commas when allowed', () => {
      const jsonWithTrailingCommas = `{
        "name": "John",
        "age": 30,
      }`;
      
      const result = Parser.safe(jsonWithTrailingCommas, {
        strict: false,
        allowTrailingCommas: true
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John', age: 30 });
    });

    it('should work with custom reviver', () => {
      const json = '{"count": "5"}';
      const result = Parser.safe(json, {
        reviver: (key, value) => key === 'count' ? parseInt(value as string, 10) : value
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ count: 5 });
    });

    it('should handle empty objects and arrays', () => {
      expect(Parser.safe('{}').success).toBe(true);
      expect(Parser.safe('[]').success).toBe(true);
      expect(Parser.safe('{}').data).toEqual({});
      expect(Parser.safe('[]').data).toEqual([]);
    });

    it('should handle primitive values', () => {
      expect(Parser.safe('true').data).toBe(true);
      expect(Parser.safe('false').data).toBe(false);
      expect(Parser.safe('null').data).toBe(null);
      expect(Parser.safe('42').data).toBe(42);
      expect(Parser.safe('"string"').data).toBe('string');
    });
  });

  describe('typed()', () => {
    interface User {
      name: string;
      age: number;
      [key: string]: any;
    }

    const isUser = (data: any): data is User => {
      return typeof data === 'object' &&
             data !== null &&
             typeof data.name === 'string' &&
             typeof data.age === 'number';
    };

    it('should parse and validate typed data successfully', () => {
      const result = Parser.typed('{"name": "John", "age": 30}', isUser);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John', age: 30 });
    });

    it('should fail validation for incorrect type', () => {
      const result = Parser.typed('{"name": "John", "age": "thirty"}', isUser);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(JSONParseError);
      expect(result.error?.message).toContain('does not match expected type');
    });

    it('should work without validator', () => {
      const result = Parser.typed('{"name": "John"}');
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John' });
    });

    it('should propagate parse errors', () => {
      const result = Parser.typed('{"invalid": json}', isUser);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(JSONParseError);
    });
  });

  describe('multiple()', () => {
    it('should parse multiple valid JSON lines', () => {
      const input = `{"name": "John"}
{"name": "Jane"}
{"name": "Bob"}`;
      
      const result = Parser.multiple(input);
      
      expect(result.successful).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(3);
      expect(result.results[0]?.success).toBe(true);
      expect(result.results[0]?.data).toEqual({ name: 'John' });
    });

    it('should handle mix of valid and invalid JSON', () => {
      const input = `{"name": "John"}
{"invalid": json}
{"name": "Jane"}`;
      
      const result = Parser.multiple(input);
      
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.results).toHaveLength(3);
      expect(result.results[1]?.success).toBe(false);
    });

    it('should handle empty lines', () => {
      const input = `{"name": "John"}

{"name": "Jane"}`;
      
      const result = Parser.multiple(input);
      
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(2);
    });

    it('should handle empty input', () => {
      const result = Parser.multiple('');
      
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(0);
    });
  });

  describe('partial()', () => {
    it('should parse complete JSON normally', () => {
      const result = Parser.partial('{"name": "John"}');
      
      expect(result.success).toBe(true);
      expect(result.isPartial).toBe(false);
      expect(result.completedString).toBeUndefined();
    });

    it('should complete incomplete object', () => {
      const result = Parser.partial('{"name": "John"');
      
      expect(result.success).toBe(true);
      expect(result.isPartial).toBe(true);
      expect(result.completedString).toBe('{"name": "John"}');
    });

    it('should complete incomplete array', () => {
      const result = Parser.partial('[1, 2, 3');
      
      expect(result.success).toBe(true);
      expect(result.isPartial).toBe(true);
      expect(result.completedString).toBe('[1, 2, 3]');
    });

    it('should complete incomplete string', () => {
      const result = Parser.partial('{"name": "John');
      
      expect(result.success).toBe(true);
      expect(result.isPartial).toBe(true);
      expect(result.completedString).toBe('{"name": "John"}');
    });

    it('should fail for unfixable partial JSON', () => {
      const result = Parser.partial('{"name":');
      
      expect(result.success).toBe(false);
      expect(result.isPartial).toBe(false);
    });
  });

  describe('withRecovery()', () => {
    it('should parse valid JSON without recovery', () => {
      const result = Parser.withRecovery('{"name": "John"}');
      
      expect(result.success).toBe(true);
      expect(result.recovered).toBe(false);
      expect(result.fixesApplied).toHaveLength(0);
    });

    it('should fix single quotes', () => {
      const result = Parser.withRecovery("{'name': 'John'}");
      
      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);
      expect(result.fixesApplied).toContain('Fix single quotes');
    });

    it('should remove trailing commas', () => {
      const result = Parser.withRecovery('{"name": "John",}');
      
      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);
      expect(result.fixesApplied).toContain('Remove trailing commas');
    });

    it('should quote unquoted keys', () => {
      const result = Parser.withRecovery('{name: "John"}');
      
      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);
      expect(result.fixesApplied).toContain('Quote unquoted keys');
    });

    it('should fix undefined values', () => {
      const result = Parser.withRecovery('{"name": "John", "value": undefined}');
      
      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);
      expect(result.fixesApplied).toContain('Fix undefined values');
    });

    it('should remove comments', () => {
      const result = Parser.withRecovery(`{
        "name": "John", // This is a comment
        "age": 30 /* Another comment */
      }`);
      
      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);
      expect(result.fixesApplied).toContain('Remove comments');
    });

    it('should apply multiple fixes', () => {
      const result = Parser.withRecovery("{name: 'John', age: 30,}");
      
      expect(result.success).toBe(true);
      expect(result.recovered).toBe(true);
      expect(result.fixesApplied.length).toBeGreaterThan(1);
    });

    it('should return best effort for unfixable JSON', () => {
      const result = Parser.withRecovery('{"name": "John" "age": 30}');
      
      expect(result.success).toBe(false);
      expect(result.fixesApplied.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('diagnose()', () => {
    it('should return valid for correct JSON', () => {
      const result = Parser.diagnose('{"name": "John"}');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect single quote issues', () => {
      const result = Parser.diagnose("{'name': 'John'}");
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'quote')).toBe(true);
      expect(result.errors.some(e => e.suggestion.includes('double quotes'))).toBe(true);
    });

    it('should detect trailing comma issues', () => {
      const result = Parser.diagnose('{"name": "John",}');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'comma')).toBe(true);
      expect(result.errors.some(e => e.suggestion.includes('trailing'))).toBe(true);
    });

    it('should detect unquoted key issues', () => {
      const result = Parser.diagnose('{name: "John"}');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'key')).toBe(true);
      expect(result.errors.some(e => e.suggestion.includes('Quote all'))).toBe(true);
    });

    it('should detect undefined value issues', () => {
      const result = Parser.diagnose('{"name": "John", "value": undefined}');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'value')).toBe(true);
      expect(result.errors.some(e => e.suggestion.includes('null'))).toBe(true);
    });

    it('should detect multiple issues', () => {
      const result = Parser.diagnose("{name: 'John', value: undefined,}");
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      
      const errorTypes = result.errors.map(e => e.type);
      expect(errorTypes).toContain('quote');
      expect(errorTypes).toContain('key');
      expect(errorTypes).toContain('value');
      expect(errorTypes).toContain('comma');
    });

    it('should handle empty string', () => {
      const result = Parser.diagnose('');
      
      expect(result.isValid).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large JSON', () => {
      const largeObject: any = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`key${i}`] = `value${i}`;
      }
      const largeJson = JSON.stringify(largeObject);
      
      const result = Parser.safe(largeJson);
      expect(result.success).toBe(true);
      expect(Object.keys(result.data as any)).toHaveLength(1000);
    });

    it('should handle deeply nested objects', () => {
      let nested: any = {};
      let current = nested;
      for (let i = 0; i < 50; i++) {
        current.next = {};
        current = current.next;
      }
      current.value = 'deep';
      
      const json = JSON.stringify(nested);
      const result = Parser.safe(json);
      
      expect(result.success).toBe(true);
    });

    it('should handle unicode characters', () => {
      const json = '{"emoji": "🎉", "chinese": "你好", "math": "∑"}';
      const result = Parser.safe(json);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        emoji: '🎉',
        chinese: '你好',
        math: '∑'
      });
    });

    it('should handle escaped characters', () => {
      const json = '{"newline": "line1\\nline2", "quote": "He said \\"hello\\""}';
      const result = Parser.safe(json);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        newline: 'line1\nline2',
        quote: 'He said "hello"'
      });
    });

    it('should handle numbers in various formats', () => {
      const json = '{"int": 42, "float": 3.14, "exp": 1e10, "negative": -123}';
      const result = Parser.safe(json);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        int: 42,
        float: 3.14,
        exp: 1e10,
        negative: -123
      });
    });
  });
});
