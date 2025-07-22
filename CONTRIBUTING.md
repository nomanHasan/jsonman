# Contributing to JSONMan

We love your input! We want to make contributing to JSONMan as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nomanHasan/jsonman.git
   cd jsonman
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development build:**
   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm test
   # or for watch mode
   npm run test:watch
   ```

5. **Run tests with coverage:**
   ```bash
   npm run test:coverage
   ```

## Testing

We use Jest for testing. When adding new features or fixing bugs, please include tests that cover the changes.

### Test Structure

- `tests/core.test.ts` - Core JSONMan functionality tests
- `tests/parser.test.ts` - Parser-specific tests  
- `tests/helpers.test.ts` - Helper utility tests

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Code Style

We use ESLint and Prettier to maintain code quality and consistency:

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Building

```bash
# Build for production
npm run build

# Build in watch mode for development
npm run dev
```

## Commit Messages

Please use clear and meaningful commit messages. We follow conventional commits:

- `feat:` - new feature
- `fix:` - bug fix
- `docs:` - documentation changes
- `style:` - formatting changes
- `refactor:` - code refactoring
- `test:` - adding tests
- `chore:` - maintenance tasks

Examples:
- `feat: add support for nested object fixing`
- `fix: handle unescaped quotes in string values`
- `docs: update API documentation for merge method`

## Reporting Issues

We use GitHub issues to track public bugs. Please ensure your description is clear and has sufficient instructions to be able to reproduce the issue.

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We welcome feature requests! Please open an issue with:

- Clear description of the feature
- Use case / motivation
- How you envision it working
- Any alternative solutions you've considered

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue with the `question` label, or reach out to the maintainers.

Thank you for contributing to JSONMan! 🎉