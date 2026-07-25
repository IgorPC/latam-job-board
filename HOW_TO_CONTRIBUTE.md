# How to contribute

This is an open project — anyone is welcome to contribute, whether that's a bug fix, a new
scraping source, a UI tweak, or anything else you think improves it.

All contributions (code, comments, commit messages, PR titles/descriptions) must be written in
**English**, regardless of the contributor's native language.

## Steps

### 1. Clone the repository

Clone the `main` branch:

```bash
git clone https://github.com/IgorPC/latam-job-board.git
cd latam-job-board
```

If you don't have push access, fork the repository first and clone your fork instead.

### 2. Create your own branch

Never commit directly to `main`. Create a branch off of it for your change:

```bash
git checkout -b your-branch-name
```

Use a short, descriptive branch name (e.g. `add-remoteok-salary-parsing`,
`fix-latam-badge-color`).

Then make your change. See the [README](README.md) for how to run the project locally
(`docker compose up`), the tech stack, and the codebase structure.

### 3. Commit your changes and open a Pull Request

Commit messages and PR titles must follow this convention — the type describes the *nature* of
the change, not just what file it touches:

| Prefix | When to use it |
|---|---|
| `feat: what changed` | A new feature or capability |
| `fix: what changed` | A bug fix |
| `chore: what changed` | Backend/internal changes with no visible or functional impact (refactors, dependency bumps, config, docs) |

Examples:

```
feat: add support for filtering jobs by seniority level
fix: correct salary range parsing for Himalayas source
chore: bump typeorm to 0.3.21
```

Then open a Pull Request against `main`, describing what changed and why. A short description is
enough — link any related issue if there is one.

## What to expect after opening a PR

Someone will review your PR, may ask for changes, and will merge it once it's ready. There's no
strict formal review process here — just be responsive to feedback and keep the scope of your PR
focused on one change at a time.
