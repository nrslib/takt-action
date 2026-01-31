# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in TAKT Action, please report it responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Send an email to the maintainer with:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact assessment
   - Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: Within 7 days of your report
- **Status Update**: Within 14 days with an initial assessment
- **Resolution**: Depending on severity, typically within 30-90 days

### Disclosure Policy

- We follow responsible disclosure practices
- We will credit reporters in the security advisory (unless you prefer anonymity)
- Please allow us reasonable time to address the issue before public disclosure

## Security Considerations

### TAKT Action-Specific Security Notes

TAKT Action runs AI agents that can interact with your codebase and GitHub PRs. Users should be aware:

- **API Keys**: `ANTHROPIC_API_KEY` should be stored as a GitHub secret, never in plain text
- **GitHub Token**: Use the minimum required permissions for `github_token`
- **Review Output**: AI-generated review comments may contain false positives
- **Code Changes**: When code modification features are enabled (#5), review changes before merging

### Best Practices

1. Store API keys as GitHub Secrets
2. Use `permissions` in your workflow to limit the `GITHUB_TOKEN` scope
3. Pin the action to a specific version or commit SHA
4. Review AI-generated comments and code changes before acting on them

## Dependencies

TAKT Action uses `@actions/core`, `@actions/github`, and other npm packages. We recommend:

- Running `npm audit` regularly
- Keeping dependencies updated
- Reviewing Dependabot alerts if enabled

## Contact

For security concerns, please reach out via the repository's security advisory feature or contact the maintainer directly.
