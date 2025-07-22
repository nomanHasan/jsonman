/**
 * Jest Setup Configuration
 */

// Extend Jest matchers
expect.extend({
  toBeValidJSON(received: string) {
    try {
      JSON.parse(received);
      return {
        message: () => `expected ${received} not to be valid JSON`,
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `expected ${received} to be valid JSON`,
        pass: false,
      };
    }
  },
});

// Test utilities
export const testUtils = {
  createLargeObject: (size: number) => {
    const obj: any = {};
    for (let i = 0; i < size; i++) {
      obj[`key${i}`] = `value${i}`;
    }
    return obj;
  },
  
  createNestedObject: (depth: number) => {
    let nested: any = {};
    let current = nested;
    for (let i = 0; i < depth; i++) {
      current.next = {};
      current = current.next;
    }
    current.value = 'deep';
    return nested;
  },
  
  createCircularObject: () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    return obj;
  }
};

// Performance testing utilities
export const benchmark = {
  time: (fn: () => void, iterations = 1000) => {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    const end = performance.now();
    return end - start;
  }
};

// Console mocking utilities
const originalConsole = { ...console };

export const mockConsole = () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
};

export const restoreConsole = () => {
  Object.assign(console, originalConsole);
};
