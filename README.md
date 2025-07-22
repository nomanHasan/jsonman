# 🔧 JSONMan - The Ultimate JSON Manipulation Library

> **Comprehensive, intuitive, and powerful JSON helper library for TypeScript/JavaScript**

[![npm version](https://badge.fury.io/js/jsonman.svg)](https://badge.fury.io/js/jsonman)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

JSONMan is designed to be the most **intuitive**, **powerful**, and **developer-friendly** JSON manipulation library. It provides a comprehensive set of tools for parsing, fixing, analyzing, searching, comparing, merging, converting, validating, and transforming JSON data.

## ✨ Features

- 🚀 **Lightning Fast** - Optimized for performance
- 🔒 **Type Safe** - Full TypeScript support with strict typing
- 🛠️ **Auto-Fix** - Automatically repair malformed JSON
- 📊 **Deep Analysis** - Comprehensive JSON structure analysis
- 🔍 **Powerful Search** - JSONPath and regex-based searching
- 🔄 **Smart Merging** - Intelligent merge strategies with conflict resolution
- 🌐 **Multi-Format** - Convert to YAML, XML, CSV, and more
- ✅ **Validation** - JSON Schema and custom validation rules
- 🎯 **Chainable API** - Fluent interface for complex operations
- 🧩 **Zero Dependencies** - No external dependencies for core functionality

## 📦 Installation

```bash
npm install jsonman
```

```bash
yarn add jsonman
```

```bash
pnpm add jsonman
```

## 🚀 Quick Start

### Basic Usage

```typescript
import JSONMan from 'jsonman';

// Parse with detailed error information
const result = JSONMan.parse('{"name": "John", "age": 30}');
if (result.success) {
  console.log(result.data); // { name: "John", age: 30 }
} else {
  console.log(result.error.message);
}

// Auto-fix malformed JSON
const fixed = JSONMan.fix(`{name: 'John', age: 30,}`);
console.log(fixed.data); // {"name": "John", "age": 30}

// Validate JSON data
const validation = JSONMan.validate(data);
console.log(validation.valid, validation.errors);
```

### Chainable Operations

```typescript
import JSONMan from 'jsonman';

const result = new JSONMan(`{"users": [{"name": "John"}, {"name": "Jane"}]}`)
  .parse()
  .validate()
  .transform(data => ({
    ...data,
    users: data.users.map(user => ({ ...user, id: Math.random() }))
  }))
  .merge({ timestamp: new Date().toISOString() })
  .get();
```

## 📖 API Reference

### Static Methods (Quick Operations)

#### 🔍 Parse & Fix

```typescript
// Safe parsing with detailed errors
JSONMan.parse(jsonString, options?)
JSONMan.fix(malformedJson, options?)

// Examples
const result = JSONMan.parse('{"invalid": json}');
const fixed = JSONMan.fix(`{name: 'John', age: 30,}`);
```

#### ✅ Validate & Analyze

```typescript
// Validation and analysis
JSONMan.validate(data, schema?)
JSONMan.analyze(data, options?)

// Examples
const isValid = JSONMan.validate(data);
const insights = JSONMan.analyze(data);
```

#### 🔄 Transform & Merge

```typescript
// Data manipulation
JSONMan.transform(data, transformer, options?)
JSONMan.merge(obj1, obj2, strategy?)

// Examples
const transformed = JSONMan.transform(data, x => x.users.filter(u => u.active));
const merged = JSONMan.merge(config, userConfig);
```

#### 🔍 Search & Compare

```typescript
// Search and comparison
JSONMan.search(data, query, options?)
JSONMan.compare(obj1, obj2, options?)

// Examples
const users = JSONMan.search(data, 'John');
const diff = JSONMan.compare(original, modified);
```

#### 🌐 Convert

```typescript
// Format conversion
JSONMan.convert(data, format, options?)

// Examples
const yaml = JSONMan.convert(data, 'yaml');
const csv = JSONMan.convert(arrayData, 'csv', { headers: true });
```

### Instance Methods (Chainable API)

```typescript
const jsonMan = new JSONMan(initialData);

jsonMan
  .parse(jsonString)           // Parse JSON string
  .validate(schema)            // Validate against schema
  .transform(transformer)      // Transform data
  .merge(otherData)           // Merge with other data
  .search(query)              // Search within data
  .get();                     // Get final result

// Error handling
if (jsonMan.hasErrors()) {
  console.log(jsonMan.getErrors());
}
```

## 🎯 Use Cases

### 🔧 API Response Processing

```typescript
import JSONMan from 'jsonman';

// Process potentially malformed API responses
const processApiResponse = (response: string) => {
  return new JSONMan()
    .parse(response)
    .validate()
    .get();
};
```

### 📝 Configuration Management

```typescript
// Merge user config with defaults
const config = JSONMan.merge(defaultConfig, userConfig);
```

### 🔍 Data Analysis

```typescript
// Analyze JSON structure
const analysis = JSONMan.analyze(complexData);
console.log(`Depth: ${analysis.depth}`);
console.log(`Size: ${analysis.size}`);
```

### 🌐 Format Conversion

```typescript
// Convert between formats
const yaml = JSONMan.convert(jsonData, 'yaml');
const xml = JSONMan.convert(jsonData, 'xml');
```

## 🚨 Error Handling

JSONMan provides detailed error information:

```typescript
const result = JSONMan.parse('{"invalid": json}');

if (!result.success) {
  console.log(result.error.message);     // Detailed error message
  console.log(result.error.position);    // Line and column information
}
```

## 🔧 TypeScript Support

JSONMan is built with TypeScript and provides full type safety:

```typescript
import { JSONValue, JSONObject, ParseResult } from 'jsonman';

// Type-safe operations
const result: ParseResult = JSONMan.parse(jsonString);
```

## 🚀 Performance

JSONMan is optimized for performance:

- **Fast parsing** with minimal overhead
- **Memory efficient** operations
- **Lazy evaluation** where possible
- **Bundle size optimized** (< 50KB)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/nomanHasan/jsonman.git
cd jsonman
npm install
npm run dev
```

### Running Tests

```bash
npm test
npm run test:coverage
```

### Building

```bash
npm run build
```

## 📄 License

MIT © [Noman Hasan](https://github.com/nomanHasan)

## 🔗 Links

- [GitHub](https://github.com/nomanHasan/jsonman)
- [NPM](https://www.npmjs.com/package/jsonman)
- [Issues](https://github.com/nomanHasan/jsonman/issues)

---

<div align="center">
  <strong>Built with ❤️ for developers who work with JSON</strong>
</div>