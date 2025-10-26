# Contributing to Howl2Go

Thank you for your interest in making Howl2Go a smarter food delivery platform. All contributions—code, documentation, bug reports, feature requests, and tests—are welcome and appreciated.

---

## Code of Conduct

Contributors are expected to maintain a respectful, inclusive, and constructive environment. Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

**In brief:**
- Be respectful and welcoming
- Focus on constructive feedback
- Help newcomers get started
- Report unacceptable behavior to maintainers

---

## Ways to Contribute

### Bug Reports
Use [GitHub Issues](https://github.com/harsha711/SE_Project_Grp_27/issues) for reproducible bugs, with a clear title, expected vs. actual behavior, and environment details.

**Example:**
```
Title: Search API returns 500 for special characters

Steps to reproduce:
1. Search for "jalapeño"
2. Observe 500 error

Expected: Handle special characters
Actual: Server error

Environment: Node 18, Chrome 120, Windows 11
```

### Feature Requests
Check our [ROADMAP.md](docs/ROADMAP.md) first. Open an issue with rationale and user impact.

**Include:**
- Problem it solves
- Proposed solution
- User benefit
- Implementation ideas (optional)

### Documentation
Help clarify or expand docs, fix errors, and update examples.

**Areas to improve:**
- User guides ([docs/USER_MANUAL.md](docs/USER_MANUAL.md))
- API documentation ([docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md))
- Setup guides ([docs/DEVELOPER_SETUP.md](docs/DEVELOPER_SETUP.md))
- Code comments

### Code
Submit improvements for backend (API, performance, security), frontend (UI, accessibility), or testing.

**Focus areas:**
- New features
- Bug fixes
- Performance optimizations
- Security improvements
- Test coverage

---

## Quick Start

### 1. Fork the Repo
1. Visit https://github.com/harsha711/SE_Project_Grp_27
2. Click "Fork" button
3. Clone to your workspace:

```bash
git clone https://github.com/YOUR_USERNAME/SE_Project_Grp_27.git
cd SE_Project_Grp_27/Proj\ 2

# Add upstream remote
git remote add upstream https://github.com/harsha711/SE_Project_Grp_27.git
```

### 2. Set Up
Follow [DEVELOPER_SETUP.md](docs/DEVELOPER_SETUP.md) and ensure both backend and frontend run locally.

**Quick setup:**
```bash
# Backend
cd Howl2Go_backend
npm install
cp .env.example .env
# Add your MongoDB URI and Groq API key to .env
npm run dev

# Frontend (new terminal)
cd Howl2Go_frontend
npm install
npm run dev
```

**Verify:**
- Backend: http://localhost:4000
- Frontend: http://localhost:3000

### 3. Sync Regularly
Sync regularly with `upstream/main`:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## Workflow

### 1. Create a Feature Branch
Use descriptive branch names:

```bash
git checkout -b feature/your-feature-name
git checkout -b bugfix/issue-description
git checkout -b docs/documentation-update
```

**Branch naming:**
- `feature/` - New functionality
- `bugfix/` - Fixing issues
- `docs/` - Documentation only
- `hotfix/` - Critical production fixes

### 2. Write Clear, Atomic Commits
Use [Conventional Commits](https://www.conventionalcommits.org/):

**Format:** `<type>(<scope>): <subject>`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance

**Examples:**
```bash
git commit -m "feat(search): Add dietary restriction filters"
git commit -m "fix(api): Handle null query parameters"
git commit -m "docs: Update API examples"
git commit -m "test: Add search endpoint tests"
```

### 3. Include or Update Tests
Include or update tests with every feature or fix.

```bash
# Run tests
npm test

# Add tests in src/__tests__/
```

**Test requirements:**
- Unit tests for new functions
- Integration tests for API endpoints
- Minimum 80% coverage for new features

### 4. Run All Tests and Linters
Run all tests and linters before making a pull request:

```bash
# Backend
cd Howl2Go_backend
npm test
npm run lint

# Frontend
cd Howl2Go_frontend
npm run lint
npm run build
```

---

## Pull Requests

### Before Creating PR

**Checklist:**
- [ ] Keep branches up-to-date with main
- [ ] All tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Commits follow conventional format

```bash
# Update your branch
git fetch upstream
git rebase upstream/main

# Push to your fork
git push origin feature/your-feature-name
```

### PR Title Format
**Format:** `<type>(<scope>): <subject>`

**Examples:**
- `feat(search): Add dietary restriction filters`
- `fix(api): Handle timeout errors gracefully`
- `docs: Update contributing guide`

### PR Description Template

```markdown
## Summary
Brief description of changes (1-3 sentences).

## Changes
- Specific change 1
- Specific change 2
- Documentation updates

## Related Issues
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
1. Test step 1
2. Test step 2
3. Verify results

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed my code
- [ ] Updated documentation
- [ ] Added tests
- [ ] All tests pass
```

### CI/CD Requirements
Pass CI (lint, tests) before review:

**Automated checks:**
- [ ] ESLint passes
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No merge conflicts

### Review Process
Address reviewer comments promptly:

1. Read all comments carefully
2. Make requested changes
3. Push updates to same branch
4. Reply when addressed
5. Request re-review

**Timeline:**
- Initial review: 2-3 business days
- Follow-up: 1-2 business days

---

## Code Style & Testing

### Code Style

**General principles:**
- Use consistent formatting and descriptive naming conventions
- Follow ESLint/Prettier for JavaScript/TypeScript
- Write clear, readable code
- Comment complex logic

**JavaScript/TypeScript:**
```javascript
// Indentation: 2 spaces
// Quotes: Single quotes
// Semicolons: Always

// Good
const userName = 'John';
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Bad
var user_name = "John"
function calc(x) {
  return x
}
```

**React/TypeScript:**
```typescript
// Component naming: PascalCase
// Props: Define interfaces

interface SearchResultsProps {
  query: string;
  results: FoodItem[];
}

export default function SearchResults({ query, results }: SearchResultsProps) {
  // Hooks at top
  const [loading, setLoading] = useState(false);

  // Helper functions
  const handleSearch = () => { };

  // Render
  return <div>...</div>;
}
```

**File naming:**
- Backend: `camelCase.js`, `PascalCase.js` (models)
- Frontend: `PascalCase.tsx` (components), `camelCase.ts` (utilities)
- Tests: `*.test.js` or `*.test.tsx`

### Testing

Write unit and integration tests for new logic (see `src/__tests__/`).

**Backend tests:**
```javascript
// src/__tests__/food.controller.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { searchFood } from '../controllers/food.controller.js';

describe('Food Controller', () => {
  it('should search for high protein meals', async () => {
    const result = await searchFood('high protein');
    assert.ok(result.length > 0);
    assert.ok(result[0].protein >= 20);
  });
});
```

**Test coverage:**
Aim for minimum 80% test coverage for new features.

**What to test:**
- Happy path (expected usage)
- Edge cases (boundary conditions)
- Error handling (invalid input, failures)
- Async operations

**What NOT to test:**
- Third-party libraries
- Framework code
- Simple getters/setters

---

## Documentation Standards

Update relevant guides/docs with all non-trivial changes.

**When to update:**
- Adding new features
- Changing existing functionality
- Modifying API endpoints
- Fixing significant bugs

**What to update:**
- **User docs:** [docs/USER_MANUAL.md](docs/USER_MANUAL.md), [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)
- **Developer docs:** [docs/DEVELOPER_SETUP.md](docs/DEVELOPER_SETUP.md), [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- **Code comments:** JSDoc for functions, inline comments for complex logic

**Documentation style:**
- Use concise language and add examples where appropriate
- Be clear and specific
- Include code examples
- Show expected output
- Mention limitations

**Example:**
```markdown
## New Feature: Dietary Filters

**Endpoint:** `POST /api/food/search`

**New Parameter:**
- `dietary` (Array): Filter by dietary restrictions

**Example:**
```bash
curl -X POST http://localhost:4000/api/food/search \
  -H "Content-Type: application/json" \
  -d '{"query": "high protein", "dietary": ["vegetarian"]}'
```

**Supported values:** `vegetarian`, `vegan`, `gluten-free`, `dairy-free`
```

---

## Support & Recognition

### Get Help

**GitHub Discussions:**
Best for general questions, ideas, and discussions.
https://github.com/harsha711/SE_Project_Grp_27/discussions

**GitHub Issues:**
Best for bug reports and specific technical problems.
https://github.com/harsha711/SE_Project_Grp_27/issues

**Documentation:**
- [README.md](README.md) - Project overview
- [docs/DEVELOPER_SETUP.md](docs/DEVELOPER_SETUP.md) - Setup guide
- [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) - API reference

### Recognition

**All contributors are recognized:**
- Listed in [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Mentioned in [CHANGELOG.md](CHANGELOG.md) and release notes
- GitHub contribution history

**High-impact contributors:**
- May be invited as maintainers
- Gain additional permissions
- Help guide project direction

**Maintainer responsibilities:**
- Review pull requests
- Triage issues
- Guide new contributors
- Make architectural decisions

---

## Common Questions

**Q: What should I work on?**
Check [good first issue](https://github.com/harsha711/SE_Project_Grp_27/labels/good%20first%20issue) and [help wanted](https://github.com/harsha711/SE_Project_Grp_27/labels/help%20wanted) labels.

**Q: How long does PR review take?**
Usually 2-3 business days for initial review.

**Q: Can I add a new dependency?**
Ask first by opening an issue. Provide justification and consider alternatives.

**Q: My PR has merge conflicts. What do I do?**
```bash
git fetch upstream
git rebase upstream/main
# Resolve conflicts in your editor
git add <resolved-files>
git rebase --continue
git push --force-with-lease origin your-branch
```

**Q: Do I need to sign a CLA?**
No, Howl2Go uses the MIT license and doesn't require a CLA.

---

## Quick Reference

### Git Commands
```bash
# Keep fork synced
git fetch upstream
git checkout main
git merge upstream/main

# Create branch
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "feat: Add new feature"

# Push to fork
git push origin feature/my-feature

# Update PR after review
git add .
git commit -m "fix: Address review comments"
git push origin feature/my-feature
```

### Testing Commands
```bash
# Backend
npm test                    # Run all tests
npm test <file>             # Run specific test
npm run lint                # Check code style

# Frontend
npm run lint                # Check code style
npm run build               # Verify build works
```

---

## Thank You!

Thank you for helping build Howl2Go. Contribute, learn, and collaborate with us! For questions, open a [GitHub Discussion](https://github.com/harsha711/SE_Project_Grp_27/discussions) or tag maintainers in [Issues](https://github.com/harsha711/SE_Project_Grp_27/issues).

**Quick Links:**
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Developer Setup](docs/DEVELOPER_SETUP.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Roadmap](docs/ROADMAP.md)
- [GitHub Repository](https://github.com/harsha711/SE_Project_Grp_27)

**Happy Contributing!** 🚀

---

*Last updated: October 2025*
