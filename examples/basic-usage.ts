/**
 * Basic JSONMan Usage Examples
 */

import JSONMan, { Parser } from '../src/index';

// ============================================================================
// BASIC PARSING EXAMPLES
// ============================================================================

console.log('🔍 PARSING EXAMPLES\n');

// Example 1: Safe JSON parsing
const validJson = '{"name": "John", "age": 30, "city": "New York"}';
const parseResult = JSONMan.parse(validJson);

if (parseResult.success) {
  console.log('✅ Parsed successfully:', parseResult.data);
} else {
  console.log('❌ Parse failed:', parseResult.error.message);
}

// Example 2: Parsing malformed JSON with helpful errors
const malformedJson = `{name: 'John', age: 30,}`;
const malformedResult = JSONMan.parse(malformedJson);

if (!malformedResult.success) {
  console.log('\n❌ Malformed JSON error:');
  console.log('Message:', malformedResult.error.message);
  console.log('Suggestions:', malformedResult.error.suggestions);
}

// Example 3: Auto-fixing malformed JSON
console.log('\n🛠️  AUTO-FIX EXAMPLES\n');

const fixResult = JSONMan.fix(malformedJson);
if (fixResult.success) {
  console.log('✅ Fixed JSON:', fixResult.data);
  console.log('Fixes applied:', fixResult.fixes.map(f => f.description));
}

// ============================================================================
// ADVANCED PARSING WITH RECOVERY
// ============================================================================

console.log('\n🚑 PARSING WITH RECOVERY\n');

const recoveryResult = Parser.withRecovery(`{
  name: 'John',
  age: 30,
  email: "john@example.com",
  active: true,
}`);

if (recoveryResult.success) {
  console.log('✅ Recovered successfully:', recoveryResult.data);
  console.log('Recovery applied:', recoveryResult.recovered);
  console.log('Fixes applied:', recoveryResult.fixesApplied);
}

// ============================================================================
// VALIDATION EXAMPLES
// ============================================================================

console.log('\n✅ VALIDATION EXAMPLES\n');

const userData = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    notifications: true
  }
};

const validation = JSONMan.validate(userData);
console.log('Validation result:', validation.valid ? '✅ Valid' : '❌ Invalid');
if (!validation.valid) {
  console.log('Errors:', validation.errors);
}

// ============================================================================
// ANALYSIS EXAMPLES
// ============================================================================

console.log('\n📊 ANALYSIS EXAMPLES\n');

const complexData = {
  users: [
    { id: 1, name: 'John', age: 30, city: 'New York' },
    { id: 2, name: 'Jane', age: 25, city: 'Los Angeles' },
    { id: 3, name: 'Bob', age: 35, city: 'Chicago' }
  ],
  metadata: {
    created: '2024-01-01',
    version: '1.0.0',
    tags: ['users', 'demo', 'example']
  }
};

const analysis = JSONMan.analyze(complexData);
console.log('Analysis result:');
console.log('- Type:', analysis.type);
console.log('- Depth:', analysis.depth);
console.log('- Size:', analysis.size, 'characters');

// ============================================================================
// SEARCH EXAMPLES
// ============================================================================

console.log('\n🔍 SEARCH EXAMPLES\n');

const searchResult = JSONMan.search(complexData, 'John');
console.log('Search results for "John":');
console.log('- Total found:', searchResult.totalFound);
console.log('- Matches:', searchResult.matches);

// ============================================================================
// TRANSFORMATION EXAMPLES
// ============================================================================

console.log('\n🔄 TRANSFORMATION EXAMPLES\n');

const transformed = JSONMan.transform(complexData, (data: any) => ({
  ...data,
  users: data.users.map((user: any) => ({
    ...user,
    displayName: `${user.name} (${user.age} years old)`
  })),
  processedAt: new Date().toISOString()
}));

console.log('Transformed data:', JSON.stringify(transformed, null, 2));

// ============================================================================
// MERGE EXAMPLES
// ============================================================================

console.log('\n🔗 MERGE EXAMPLES\n');

const config1 = {
  database: {
    host: 'localhost',
    port: 5432
  },
  cache: {
    enabled: true,
    ttl: 3600
  }
};

const config2 = {
  database: {
    port: 5433,
    ssl: true
  },
  cache: {
    ttl: 7200
  },
  logging: {
    level: 'info'
  }
};

const merged = JSONMan.merge(config1, config2);
console.log('Merged configuration:', JSON.stringify(merged, null, 2));

// ============================================================================
// CONVERSION EXAMPLES
// ============================================================================

console.log('\n🌐 CONVERSION EXAMPLES\n');

const simpleData = {
  name: 'JSONMan',
  version: '1.0.0',
  features: ['parse', 'fix', 'analyze']
};

console.log('YAML conversion:');
console.log(JSONMan.convert(simpleData, 'yaml'));

console.log('\nXML conversion:');
console.log(JSONMan.convert(simpleData, 'xml'));

// ============================================================================
// CHAINABLE API EXAMPLES
// ============================================================================

console.log('\n⛓️  CHAINABLE API EXAMPLES\n');

const jsonString = '{"users": [{"name": "John"}, {"name": "Jane"}]}';

try {
  const result = new JSONMan()
    .parse(jsonString)
    .transform((data: any) => ({
      ...data,
      users: data.users.map((user: any, index: number) => ({
        ...user,
        id: index + 1,
        createdAt: new Date().toISOString()
      }))
    }))
    .merge({ metadata: { processed: true } })
    .get();

  console.log('Chainable result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Chainable operation failed:', error);
}

// ============================================================================
// ERROR HANDLING EXAMPLES
// ============================================================================

console.log('\n🚨 ERROR HANDLING EXAMPLES\n');

const chainedWithErrors = new JSONMan();
chainedWithErrors
  .parse('{"invalid": json}')  // This will fail
  .transform((data: any) => data.nonexistent.property); // This will also fail

if (chainedWithErrors.hasErrors()) {
  console.log('Errors occurred during chaining:');
  chainedWithErrors.getErrors().forEach((error, index) => {
    console.log(`${index + 1}. ${error.message}`);
  });
}

console.log('\n✨ Examples completed! ✨');
