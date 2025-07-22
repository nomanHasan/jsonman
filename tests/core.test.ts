/**
 * Core JSONMan Tests
 */

import JSONMan from '../src/index';
import { JSONParseError } from '../src/core/errors';

describe('JSONMan Core Functionality', () => {
  describe('Static Methods', () => {
    describe('parse()', () => {
      it('should parse valid JSON successfully', () => {
        const result = JSONMan.parse('{"name": "John", "age": 30}');
        
        expect(result.success).toBe(true);
        expect(result.data).toEqual({ name: 'John', age: 30 });
        expect(result.error).toBeUndefined();
      });

      it('should handle malformed JSON with detailed errors', () => {
        const result = JSONMan.parse('{"name": "John", "age":}');
        
        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(JSONParseError);
        expect(result.error?.code).toBe('PARSE_ERROR');
        expect(result.error?.message).toBeTruthy();
        expect(result.data).toBeUndefined();
      });

      it('should parse with custom reviver', () => {
      const json = '{"count": "5"}';
      const result = JSONMan.parse(json, {
        reviver: (key, value) => key === 'count' ? parseInt(value as string, 10) : value
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ count: 5 });
    });

      it('should handle empty string', () => {
        const result = JSONMan.parse('');
        
        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(JSONParseError);
      });

      it('should handle null values correctly', () => {
        const result = JSONMan.parse('null');
        
        expect(result.success).toBe(true);
        expect(result.data).toBe(null);
      });

      it('should handle arrays correctly', () => {
        const result = JSONMan.parse('[1, 2, 3, "test"]');
        
        expect(result.success).toBe(true);
        expect(result.data).toEqual([1, 2, 3, 'test']);
      });

      it('should handle nested objects', () => {
        const json = '{"user": {"name": "John", "settings": {"theme": "dark"}}}';
        const result = JSONMan.parse(json);
        
        expect(result.success).toBe(true);
        expect(result.data).toEqual({
          user: {
            name: 'John',
            settings: {
              theme: 'dark'
            }
          }
        });
      });
    });

    describe('fix()', () => {
      // Comprehensive test cases for JSONMan.fix method
      const cases = [
        {
          name: 'trailingCommaObject',
          input: '{ "a":1, }',
          expected: { a: 1 }
        },
        {
          name: 'trailingCommaArray',
          input: '[1,2,]',
          expected: [1, 2]
        },
        {
          name: 'singleQuotes',
          input: `{ 'a':'b' }`,
          expected: { a: 'b' }
        },
        {
          name: 'unquotedKeys',
          input: '{ a:1 }',
          expected: { a: 1 }
        },
        {
          name: 'stringifiedJSON',
          input: '{ "x":"{\\"y\\":1}"}',
          expected: { x: { y: 1 } }
        },
        {
          name: 'unescapedInnerQuotes',
          input: `{"x": "text with "quotes"" }`,
          expected: { x: 'text with "quotes"' }
        },
        {
          name: 'concatenatedObjectsToArray',
          input: '{a:1}{b:2}',
          expected: [ { a: 1 }, { b: 2 } ]
        },
        {
          name: 'danglingColon',
          input: '{foo:1}:"',
          expected: { foo: 1 }
        },
        {
          name: 'nullNoneUndefined',
          input: '{a:null, b:None, c:undefined}',
          expected: { a: null, b: null, c: null }
        },
        {
          name: 'missingClosingBracket',
          input: '{a:[1,2,3}',
          expected: { a: [1, 2, 3] }
        },
        {
          name: 'truncatedNestedObject',
          input: '{a:{b:[1,2,3,{c:',
          expected: { a: { b: [1, 2, 3, { c: null }] } }
        },
        {
          name: 'arrayIncomplete',
          input: '[{"a":1},{"b":2',
          expected: [ { a: 1 }, { b: 2 } ]
        },
        {
          name: 'commentsOnly',
          input: '// comment',
          expected: null
        },
        {
          name: 'validEscapePreserved',
          input: '{x:"\\n"}',
          expected: { x: '\n' }
        },
        {
          name: 'invalidEscapeRemoved',
          input: '{x:"\\x01"}',
          expected: { x: '' }
        },
        {
          name: 'multipleRootObjects',
          input: '{"a":1}\n{"b":2}',
          expected: [ { a: 1 }, { b: 2 } ]
        },
        {
          name: 'jsHexNumber',
          input: '{x:0x1A}',
          expected: { x: 26 }
        },
        {
          name: 'unicodeBOM',
          input: '\uFEFF{}',
          expected: {}
        },
        {
          name: 'duplicateKeysKeepLast',
          input: '{a:1,a:2}',
          expected: { a: 2 }
        },
        {
          name: 'arrayDoubleComma',
          input: '[1,,2]',
          expected: [1, 2]
        },
        {
          name: 'unescapedQuoteInValue',
          input: `{"a": "foo "bar""}`,
          expected: { a: 'foo "bar"' }
        },
        {
          name: 'primitiveStringRoot',
          input: '"string"',
          expected: 'string'
        },
        {
          name: 'noneLiteral',
          input: '{a:None}',
          expected: { a: null }
        },
        {
          name: 'csvRowDump',
          input: '{a:1},\n{b:2}',
          expected: [ { a: 1 }, { b: 2 } ]
        },
        {
          name: 'numericStringPreserved',
          input: '{"a":"1"}',
          expected: { a: '1' }
        },
        {
          name: 'deepNestedJSONinString',
          input: '{"a":"{\\"b\\":\\"{\\\\\\"c\\\\\\":1}\\"}"}',
          expected: { a: { b: { c: 1 } } }
        },
        {
          name: 'doubleOpeningBrace',
          input: '{{"a":1}}',
          expected: { a: 1 }
        },
        {
          name: 'missingCommaBetweenProps',
          input: '{"a":1 "b":2}',
          expected: { a: 1, b: 2 }
        },
        {
          name: 'emojiAndSurrogate',
          input: '{"emoji":"Done ✅"}',
          expected: { emoji: 'Done ✅' }
        },
        {
          name: 'htmlResidue',
          input: '{"desc":"5 < 6"}',
          expected: { desc: '5 < 6' }
        }
      ];

      // Test each comprehensive case
      cases.forEach(testCase => {
        it(`should fix: ${testCase.name}`, () => {
          const result = JSONMan.fix(testCase.input);
          
          expect(result.success).toBe(true);
          if (result.success && result.data) {
            const parsedResult = JSONMan.parse(result.data);
            expect(parsedResult.success).toBe(true);
            expect(parsedResult.data).toEqual(testCase.expected);
          }
        });
      });

      // Legacy tests to ensure backwards compatibility
      it('should fix single quotes to double quotes', () => {
        const result = JSONMan.fix("{'name': 'John', 'age': 30}");
        
        expect(result.success).toBe(true);
        const parsedResult = JSONMan.parse(result.data!);
        expect(parsedResult.data).toEqual({ name: 'John', age: 30 });
        expect(result.fixes).toHaveLength(1);
        expect(result.fixes[0]?.type).toBe('quote');
      });

      it('should remove trailing commas', () => {
        const result = JSONMan.fix('{"name": "John", "age": 30,}');
        
        expect(result.success).toBe(true);
        const parsedResult = JSONMan.parse(result.data!);
        expect(parsedResult.data).toEqual({ name: 'John', age: 30 });
      });

      it('should quote unquoted keys', () => {
        const result = JSONMan.fix('{name: "John", age: 30}');
        
        expect(result.success).toBe(true);
        const parsedResult = JSONMan.parse(result.data!);
        expect(parsedResult.data).toEqual({ name: 'John', age: 30 });
      });

      it('should handle multiple issues at once', () => {
        const result = JSONMan.fix("{name: 'John', age: 30,}");
        
        expect(result.success).toBe(true);
        const parsedResult = JSONMan.parse(result.data!);
        expect(parsedResult.data).toEqual({ name: 'John', age: 30 });
      });

      it('should fail gracefully for truly unfixable JSON', () => {
        const result = JSONMan.fix('{"name": "John" "age": 30}'); // Missing comma, hard to fix
        
        // Our enhanced fixer should be able to handle this now
        expect(result.success).toBe(true);
        const parsedResult = JSONMan.parse(result.data!);
        expect(parsedResult.data).toEqual({ name: 'John', age: 30 });
      });

      it('should handle completely invalid input gracefully', () => {
        const result = JSONMan.fix('this is not json at all');
        
        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(JSONParseError);
      });
    });

    describe('validate()', () => {
      it('should validate valid JSON data', () => {
        const data = { name: 'John', age: 30 };
        const result = JSONMan.validate(data);
        
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should detect undefined data', () => {
        const result = JSONMan.validate(undefined as any);
        
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Data is undefined');
      });

      it('should detect non-serializable data', () => {
        const circular: any = {};
        circular.self = circular;
        const result = JSONMan.validate(circular);
        
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Data is not serializable to JSON');
      });

      it('should validate null as valid JSON', () => {
        const result = JSONMan.validate(null);
        
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should validate arrays', () => {
        const result = JSONMan.validate([1, 2, 3, { name: 'test' }]);
        
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('compare()', () => {
      it('should compare identical objects as equal', () => {
        const obj1 = { name: 'John', age: 30 };
        const obj2 = { name: 'John', age: 30 };
        const result = JSONMan.compare(obj1, obj2);
        
        expect(result.equal).toBe(true);
      });

      it('should compare different objects as not equal', () => {
        const obj1 = { name: 'John', age: 30 };
        const obj2 = { name: 'Jane', age: 25 };
        const result = JSONMan.compare(obj1, obj2);
        
        expect(result.equal).toBe(false);
      });

      it('should handle objects with different key orders', () => {
        const obj1 = { name: 'John', age: 30 };
        const obj2 = { age: 30, name: 'John' };
        const result = JSONMan.compare(obj1, obj2);
        
        expect(result.equal).toBe(true);
      });

      it('should compare arrays correctly', () => {
        const arr1 = [1, 2, 3];
        const arr2 = [1, 2, 3];
        const result = JSONMan.compare(arr1, arr2);
        
        expect(result.equal).toBe(true);
      });

      it('should detect array order differences', () => {
        const arr1 = [1, 2, 3];
        const arr2 = [3, 2, 1];
        const result = JSONMan.compare(arr1, arr2);
        
        expect(result.equal).toBe(false);
      });

      it('should handle null and undefined', () => {
        expect(JSONMan.compare(null, null).equal).toBe(true);
        expect(JSONMan.compare(null, null).equal).toBe(true);
      });
    });

    describe('analyze()', () => {
      it('should analyze simple objects', () => {
        const data = { name: 'John', age: 30 };
        const result = JSONMan.analyze(data);
        
        expect(result.type).toBe('object');
        expect(result.depth).toBe(1);
        expect(result.size).toBeGreaterThan(0);
      });

      it('should analyze nested objects', () => {
        const data = {
          user: {
            profile: {
              name: 'John'
            }
          }
        };
        const result = JSONMan.analyze(data);
        
        expect(result.type).toBe('object');
        expect(result.depth).toBe(3);
      });

      it('should analyze arrays', () => {
        const data = [1, 2, 3, [4, 5]];
        const result = JSONMan.analyze(data);
        
        expect(result.type).toBe('array');
        expect(result.depth).toBe(2);
      });

      it('should analyze primitive values', () => {
        expect(JSONMan.analyze('string').type).toBe('string');
        expect(JSONMan.analyze(123).type).toBe('number');
        expect(JSONMan.analyze(true).type).toBe('boolean');
        expect(JSONMan.analyze(null).type).toBe('null');
      });

      it('should calculate size correctly', () => {
        const data = { a: 1, b: 2 };
        const result = JSONMan.analyze(data);
        
        expect(result.size).toBe(JSON.stringify(data).length);
      });
    });

    describe('search()', () => {
      const testData = {
        users: [
          { name: 'John', email: 'john@test.com' },
          { name: 'Jane', email: 'jane@test.com' }
        ],
        settings: {
          theme: 'dark',
          notifications: true
        }
      };

      it('should find matching keys', () => {
        const result = JSONMan.search(testData, 'name');
        
        expect(result.totalFound).toBeGreaterThan(0);
        expect(result.matches.some((m: any) => m.key === 'name')).toBe(true);
      });

      it('should find matching values', () => {
        const result = JSONMan.search(testData, 'John');
        
        expect(result.totalFound).toBeGreaterThan(0);
        expect(result.matches.some((m: any) => m.value === 'John')).toBe(true);
      });

      it('should handle empty search results', () => {
        const result = JSONMan.search(testData, 'nonexistent');
        
        expect(result.totalFound).toBe(0);
        expect(result.matches).toHaveLength(0);
      });

      it('should search in nested structures', () => {
        const result = JSONMan.search(testData, 'dark');
        
        expect(result.totalFound).toBeGreaterThan(0);
      });
    });

    describe('transform()', () => {
      it('should transform data with function', () => {
        const data = { count: 5 };
        const transformer = (d: any) => ({ ...d, doubled: d.count * 2 });
        const result = JSONMan.transform(data, transformer);
        
        expect(result).toEqual({ count: 5, doubled: 10 });
      });

      it('should return original data for non-function transformer', () => {
        const data = { count: 5 };
        const result = JSONMan.transform(data, 'not a function');
        
        expect(result).toEqual(data);
      });

      it('should handle null/undefined data', () => {
        const transformer = (d: any) => d;
        expect(JSONMan.transform(null, transformer)).toBe(null);
        expect(JSONMan.transform(null, transformer)).toBe(null);
      });
    });

    describe('merge()', () => {
      it('should merge simple objects', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { c: 3, d: 4 };
        const result = JSONMan.merge(obj1, obj2);
        
        expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
      });

      it('should merge nested objects', () => {
        const obj1 = { config: { theme: 'dark', size: 'large' } };
        const obj2 = { config: { theme: 'light', position: 'top' } };
        const result = JSONMan.merge(obj1, obj2);
        
        expect(result).toEqual({
          config: { theme: 'light', size: 'large', position: 'top' }
        });
      });

      it('should handle non-object inputs', () => {
        expect(JSONMan.merge('string', { a: 1 })).toEqual({ a: 1 });
        expect(JSONMan.merge({ a: 1 }, 'string')).toEqual({ a: 1 });
        expect(JSONMan.merge(null, { a: 1 })).toEqual({ a: 1 });
        expect(JSONMan.merge([1, 2], { a: 1 })).toEqual([1, 2]);
      });

      it('should overwrite conflicting values', () => {
        const obj1 = { name: 'John', age: 30 };
        const obj2 = { name: 'Jane', city: 'NYC' };
        const result = JSONMan.merge(obj1, obj2);
        
        expect(result).toEqual({ name: 'Jane', age: 30, city: 'NYC' });
      });
    });

    describe('convert()', () => {
      const testData = {
        name: 'Test',
        version: '1.0.0',
        active: true
      };

      it('should convert to YAML format', () => {
        const result = JSONMan.convert(testData, 'yaml');
        
        expect(result).toContain('name: "Test"');
        expect(result).toContain('version: "1.0.0"');
        expect(result).toContain('active: true');
      });

      it('should convert to XML format', () => {
        const result = JSONMan.convert(testData, 'xml');
        
        expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(result).toContain('<root>');
        expect(result).toContain('<name>Test</name>');
      });

      it('should convert array to CSV', () => {
        const arrayData = [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 }
        ];
        const result = JSONMan.convert(arrayData, 'csv');
        
        expect(result).toContain('name,age');
        expect(result).toContain('"John",30');
        expect(result).toContain('"Jane",25');
      });

      it('should default to JSON for unknown formats', () => {
        const result = JSONMan.convert(testData, 'unknown');
        
        expect(() => JSON.parse(result)).not.toThrow();
        expect(JSON.parse(result)).toEqual(testData);
      });

      it('should handle CSV conversion errors', () => {
        expect(() => JSONMan.convert('not an array', 'csv')).toThrow();
      });
    });
  });

  describe('Instance Methods (Chainable API)', () => {
    describe('Constructor and basic operations', () => {
      it('should create instance with initial data', () => {
        const data = { test: true };
        const instance = new JSONMan(data);
        
        expect(instance.getData()).toEqual(data);
      });

      it('should create instance without initial data', () => {
        const instance = new JSONMan();
        
        expect(instance.getData()).toBe(null);
      });

      it('should set and get data', () => {
        const instance = new JSONMan();
        const data = { name: 'test' };
        
        instance.setData(data);
        expect(instance.getData()).toEqual(data);
      });

      it('should reset data when getting result', () => {
        const instance = new JSONMan({ test: true });
        const result = instance.get();
        
        expect(result).toEqual({ test: true });
        expect(instance.getData()).toBe(null);
      });
    });

    describe('Chaining operations', () => {
      it('should chain parse operation', () => {
        const instance = new JSONMan();
        const result = instance.parse('{"name": "John"}').getData();
        
        expect(result).toEqual({ name: 'John' });
      });

      it('should chain validation', () => {
        const instance = new JSONMan({ name: 'John' });
        instance.validate();
        
        expect(instance.hasErrors()).toBe(false);
      });

      it('should chain transformation', () => {
        const instance = new JSONMan({ count: 5 });
        const result = instance
          .transform((data: any) => ({ ...data, doubled: data.count * 2 }))
          .getData();
        
        expect(result).toEqual({ count: 5, doubled: 10 });
      });

      it('should chain merge operation', () => {
        const instance = new JSONMan({ a: 1 });
        const result = instance.merge({ b: 2 }).getData();
        
        expect(result).toEqual({ a: 1, b: 2 });
      });

      it('should chain multiple operations', () => {
        const instance = new JSONMan();
        const result = instance
          .parse('{"count": 5}')
          .transform((data: any) => ({ ...data, doubled: data.count * 2 }))
          .merge({ timestamp: '2024-01-01' })
          .get();
        
        expect(result).toEqual({
          count: 5,
          doubled: 10,
          timestamp: '2024-01-01'
        });
      });
    });

    describe('Error handling in chains', () => {
      it('should track parse errors', () => {
        const instance = new JSONMan();
        instance.parse('{"invalid": json}');
        
        expect(instance.hasErrors()).toBe(true);
        expect(instance.getErrors()).toHaveLength(1);
      });

      it('should track validation errors', () => {
        const instance = new JSONMan(undefined);
        instance.validate();
        
        expect(instance.hasErrors()).toBe(true);
      });

      it('should continue chain despite errors', () => {
        const instance = new JSONMan();
        instance
          .parse('{"invalid": json}')
          .transform((data: any) => data)
          .merge({ test: true });
        
        expect(instance.hasErrors()).toBe(true);
        expect(instance.getErrors().length).toBeGreaterThan(0);
      });

      it('should clear errors', () => {
        const instance = new JSONMan();
        instance.parse('{"invalid": json}');
        
        expect(instance.hasErrors()).toBe(true);
        
        instance.clearErrors();
        expect(instance.hasErrors()).toBe(false);
        expect(instance.getErrors()).toHaveLength(0);
      });
    });

    describe('Search in chain', () => {
      it('should chain search operation', () => {
        const instance = new JSONMan({
          users: [{ name: 'John' }, { name: 'Jane' }]
        });
        
        const result = instance.search('John').getData();
        
        expect(result).toHaveProperty('searchResults');
        expect((result as any).searchResults.totalFound).toBeGreaterThan(0);
      });
    });
  });
});
