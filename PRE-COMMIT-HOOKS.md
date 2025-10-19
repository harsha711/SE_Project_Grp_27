# Pre-Commit Hooks

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to enforce code quality and security checks before commits.

## What Gets Checked

Every time you run `git commit`, the following checks are automatically performed:

### 1. 🔐 **Secret Detection**
Prevents committing sensitive information:
- **Groq API keys** (`gsk_...`)
- **OpenAI API keys** (`sk-...`)
- **AWS Access Keys** (`AKIA...`)
- **MongoDB connection strings** with credentials

**Example blocked commit:**
```bash
❌ ERROR: Potential API key or secret detected in staged files!
Please remove secrets before committing.
```

### 2. 🚫 **`.env` File Check**
Prevents committing environment variable files:
- Blocks any file ending in `.env`
- Suggests using `.env.example` instead

**Example blocked commit:**
```bash
❌ ERROR: .env file detected in commit!
Never commit .env files. Use .env.example instead.
```

### 3. 📦 **Large File Detection**
Prevents committing files larger than 50MB:
- Checks all staged files
- Suggests using Git LFS for large files

**Example blocked commit:**
```bash
❌ ERROR: File data/large-dataset.csv is 150MB (limit: 50MB)
Please use Git LFS or exclude from repository.
```

### 4. ✨ **Lint-Staged**
Runs checks on staged files based on file type:
- JavaScript/TypeScript files (`*.{js,jsx,ts,tsx}`)
- Python files (`*.py`)
- JSON/Markdown/YAML files

## Setup

### First Time Setup

1. **Install dependencies** (done automatically on `npm install`):
```bash
npm install
```

2. **Husky is auto-configured** via the `prepare` script in `package.json`

### Manual Installation

If hooks aren't working:

```bash
# Reinstall Husky hooks
npm run prepare
```

## Bypassing Hooks (Emergency Use Only)

**⚠️ WARNING: Only use in emergencies!**

To skip pre-commit hooks:
```bash
git commit --no-verify -m "Your commit message"
```

**When to use:**
- CI/CD failures unrelated to your changes
- Emergency hotfixes
- Documentation-only changes that fail incorrectly

**Never use to commit:**
- Secrets or API keys
- Large files
- .env files

## Customizing Checks

### Adding New File Type Checks

Edit `package.json`:

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",           // Add linting
    "prettier --write"        // Add formatting
  ],
  "*.py": [
    "black",                  // Python formatter
    "flake8"                  // Python linter
  ]
}
```

### Modifying Secret Patterns

Edit `.husky/pre-commit`:

```bash
# Add new patterns to detect
if echo "$FILES_TO_CHECK" | xargs grep -l "YOUR_PATTERN_HERE" 2>/dev/null; then
  echo "❌ ERROR: Your custom message!"
  exit 1
fi
```

### Changing File Size Limit

Edit `.husky/pre-commit`:

```bash
# Change from 50MB to 100MB
if [ "$size" -gt 100 ]; then
```

## Troubleshooting

### Hooks Not Running

**Problem:** Commits go through without running checks

**Solution:**
```bash
# Reinstall hooks
rm -rf .husky
npm run prepare

# Make sure hook is executable
chmod +x .husky/pre-commit
```

### False Positives

**Problem:** Legitimate code flagged as secret

**Solutions:**
1. **Exclude the file type** from secret scanning in `.husky/pre-commit`
2. **Use `--no-verify`** for this specific commit (document why)
3. **Refactor code** to not match the pattern

### Permission Denied

**Problem:** `Permission denied` error when committing

**Solution:**
```bash
chmod +x .husky/pre-commit
```

### Lint-Staged Fails

**Problem:** lint-staged shows errors but no details

**Solution:**
```bash
# Run lint-staged manually to see full output
npx lint-staged --verbose
```

## Best Practices

### ✅ DO:
- Commit `.env.example` files with dummy values
- Use environment variables for all secrets
- Test hooks locally before pushing
- Document any `--no-verify` usage in commit messages

### ❌ DON'T:
- Commit actual `.env` files
- Hardcode API keys in source code
- Bypass hooks without good reason
- Commit large binary files

## Examples

### Good Commit Flow
```bash
# 1. Make changes
vim src/api.js

# 2. Stage changes
git add src/api.js

# 3. Commit (hooks run automatically)
git commit -m "Add API integration"

# Output:
🔍 Running pre-commit checks...
🔐 Checking for secrets and API keys...
📦 Checking for large files...
✨ Running lint-staged...
✅ Pre-commit checks passed!
```

### Blocked Commit Example
```bash
# 1. Accidentally stage .env
git add .env

# 2. Try to commit
git commit -m "Update config"

# Output:
🔍 Running pre-commit checks...
❌ ERROR: .env file detected in commit!
Never commit .env files. Use .env.example instead.

# 3. Fix the issue
git reset .env
git add .env.example
git commit -m "Update config"
```

## File Structure

```
.
├── .husky/
│   ├── _/                    # Husky internal files
│   └── pre-commit            # Main pre-commit hook script
├── package.json              # Husky & lint-staged config
└── PRE-COMMIT-HOOKS.md      # This file
```

## Additional Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Git Hooks Overview](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

## Support

For issues with pre-commit hooks:
1. Check this documentation
2. Run `npx husky` to verify installation
3. Check `.husky/pre-commit` for custom errors
4. Report issues in the project repository
