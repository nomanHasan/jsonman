# Security Policy

## Supported Versions

We actively support and provide security updates for the following versions of JSONMan:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ Yes             |
| < 1.0   | ❌ No              |

## Reporting a Vulnerability

We take security bugs in JSONMan seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

Please **DO NOT** report security vulnerabilities through public GitHub issues.

Instead, please send a report to our security team:

1. **Email**: Send details to `security@jsonman-js.org` (if available)
2. **GitHub Security**: Use GitHub's [private vulnerability reporting](https://github.com/jsonman-js/jsonman/security/advisories/new)

### What to Include

Please include the following information in your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Response**: Within 7 days
- **Status Updates**: Weekly or as significant developments occur
- **Resolution**: We aim to resolve critical issues within 30 days

### Security Updates

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions
2. Audit code to find any potential similar problems
3. Prepare fixes for all supported versions
4. Release patched versions as quickly as possible

### Disclosure Policy

We follow responsible disclosure:

- We will not share details of security vulnerabilities until patches are available
- We will credit security researchers who report issues responsibly
- We will coordinate disclosure timing with the reporter

### Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request or open an issue.

## Security Best Practices

When using JSONMan:

1. **Input Validation**: Always validate JSON input before processing
2. **Resource Limits**: Set appropriate limits for JSON size and complexity
3. **Error Handling**: Handle parsing errors gracefully without exposing sensitive information
4. **Updates**: Keep JSONMan updated to the latest version
5. **Dependencies**: Regularly audit your dependency tree

## Known Security Considerations

- **Denial of Service**: Very large or deeply nested JSON can consume significant resources
- **JSON Injection**: Be cautious when dynamically constructing JSON strings
- **Error Information**: Parsing errors may contain fragments of input data

Thank you for helping keep JSONMan and its users safe!