# Contributing to TAKT Action

Thank you for your interest in contributing to TAKT Action!

## Important Notice

For now, This project is maintained at my own pace as a personal project. Please understand the following before contributing:

### Response Times

- **Issues**: I may not be able to respond immediately. Please be patient.
- **Pull Requests**: Review capacity is limited. Small, focused PRs are more likely to be reviewed.

### About This Project

This project is primarily developed using "vibe coding" (AI-assisted development). As such:

- **Use at your own risk** - The codebase may have unconventional patterns
- **Large PRs are difficult to review** - Especially AI-generated ones
- **Small, focused changes are preferred** - Bug fixes, typo corrections, documentation improvements

## How to Contribute

### Reporting Issues

1. Search existing issues first
2. Include reproduction steps
3. Include your environment (OS, Node version, etc.)

### Pull Requests

**Preferred:**
- Bug fixes with tests
- Documentation improvements
- Small, focused changes
- Typo corrections

**Difficult to review:**
- Large refactoring
- AI-generated bulk changes
- Feature additions without prior discussion

### Before Submitting a PR

1. Open an issue first to discuss the change
2. Keep changes small and focused
3. Include tests if applicable
4. Update documentation if needed

## Development Setup

```bash
# Clone the repository
git clone https://github.com/nrslib/takt-action.git
cd takt-action

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Package for distribution
npm run package
```

## Code Style

- TypeScript strict mode
- ESLint for linting
- Prefer simple, readable code over clever solutions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
