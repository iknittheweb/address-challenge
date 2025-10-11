---

> **Note:** If you upgrade Husky to v10 or later, update your `.husky/pre-commit` hook to the new format. The old `#!/bin/sh` and `._/husky.sh` lines will break in v10+.

---

## 📦 Keeping Dependencies Up to Date

To keep your project secure and running smoothly, periodically check for outdated dependencies and vulnerabilities:

1. **Check for outdated packages:**

```bash
npm outdated
```

Review which packages have newer versions available.

2. **Update packages:**

```bash
npm update
```

This updates to the latest compatible versions.

3. **Check for vulnerabilities:**

```bash
npm audit
npm audit fix
```

Use `npm audit fix --force` for major/breaking changes (review changelogs first).

4. **After updating:**

- Test your site and build process to ensure everything works as expected.
- Review release notes for breaking changes if you update major versions.

**Best practice:** Do this every few weeks, or before/after major work.

# I Knit The Web - Portfolio Website

Welcome to the codebase for my personal portfolio site! This project is a static site built with custom HTML, SCSS, and
JavaScript, featuring a flexible build system for easy environment management and modular page/component generation.

---

## 📁 Folder Structure Overview

```
├── build.js                # Main build script (uses .env for config)
├── component-build.cjs     # Component/page build system (uses .env for config)
├── .env                    # Development environment variables (not committed)
├── .env.production         # Production environment variables (not committed)
├── .env.example            # Example env file (copy to .env/.env.production)
├── index.template.html     # Main HTML template (edit this, not index.html)
├── index.html              # Generated output (do not edit directly)
├── dist/                   # Compiled CSS output
├── src/
│   ├── css/                # Legacy CSS files (to be migrated to SCSS)
│   ├── img/                # All image assets, organized by type
│   ├── js/                 # JavaScript files (components, scripts)
│   ├── pages/              # All HTML pages and subfolders
│   ├── scss/               # SCSS source (modular, by type/page)
│   └── templates/          # HTML templates for page generation
├── certificates/           # Personal certificates (not used on site)
├── docs/                   # Project documentation and guides
├── notes/                  # Planning, to-do, and brainstorming files
├── package.json            # NPM scripts and dependencies
└── README.md               # This file
```

---

## 🛠️ Build & Development Workflow

### 1. Edit Content

- **Edit `index.template.html`** for homepage changes.
- **Edit files in `src/pages/`** for other pages.
- **Edit SCSS in `src/scss/`** (modular, by page/component).

### 2. Build for Development

```bash
npm run dev
```

This generates `index.html` and other pages using development URLs from `.env`.

### 3. Build for Production

```bash
npm run deploy
```

This generates files using production URLs from `.env.production`.

### 4. Environment Variables

- **.env**: For local/dev builds (not committed)
- **.env.production**: For production builds (not committed)
- **.env.example**: Template for required variables

Variables used:

```
BASE_URL=...      # The base URL for your site
ASSET_URL=...     # The base path or URL for static assets
```

---

## 🔄 NPM Scripts & Commands

- `npm run local` Build for local development (all pages, purged CSS)
- `npm run deploy` Build for production (all pages, purged CSS)
- `node build.js` Manual build (uses .env)
- `node build.js production` Manual build (uses .env.production)
- `node component-build.cjs` Build all pages/components
- `npm run lint` Lint JS files with ESLint
- `npm run format` Format code with Prettier
- `npm test` Run all JavaScript unit tests (Jest)
- `npm run test:e2e` Run end-to-end tests (Cypress)
- `npm run test:style` Lint SCSS files (Stylelint)
- `npm run test:a11y` Run accessibility tests (axe-core)

---

## 🧪 Testing & Quality

### 1. JavaScript Unit Tests (Jest)

- All unit tests are in the `tests/` directory (e.g., `tests/example.unit.test.js`).
- Run with `npm test`.

### 2. End-to-End (E2E) Tests (Cypress)

- E2E tests are in `tests/` (e.g., `tests/example.e2e.cy.js`).
- Run with `npm run test:e2e` (opens Cypress UI).

### 3. Style Linting (Stylelint)

- SCSS files are checked with Stylelint.
- Run with `npm run test:style`.

### 4. Accessibility Testing (axe-core)

- Example accessibility tests are in `tests/` (e.g., `tests/example.accessibility.js`).
- Run with `npm run test:a11y`.

---

---

## 📝 Commit Messages & Pre-commit Hooks

### Conventional Commits & Commitizen

- This project uses the [Conventional Commits](https://www.conventionalcommits.org/) standard for clear, consistent
  commit messages.
- Use Commitizen to be guided through writing commit messages:

  ```bash
  npx cz
  # or
  npx commitizen
  ```

- Answer the prompts to generate a well-structured commit message (e.g., `feat: add new hero section`).

### Pre-commit Hooks

- Pre-commit hooks are set up with Husky and lint-staged.
- On every commit, staged JS, CSS, SCSS, and HTML files are automatically linted and formatted.
- If issues are found, the commit is blocked until they are fixed.

---

---

## 🧩 How the Build System Works

- **build.js**: Processes `index.template.html` and outputs `index.html`, replacing placeholders with
  environment-specific values.
- **component-build.cjs**: Generates all pages from templates, injecting shared components and environment variables.
- **Environment variables** are loaded using [dotenv](https://www.npmjs.com/package/dotenv) and must be set in
  `.env`/`.env.production`.
- **SCSS** is modular and compiled to `dist/styles.css`.
- **Legacy CSS** in `src/css/` is being migrated to SCSS (one page at a time).

---

## 📝 Notes & Best Practices

- **Edit templates, not generated files.**
- **Keep `.env` files in the root.**
- **Organize images in `src/img/` by type or page.**
- **Store docs and notes in `docs/` and `notes/`.**
- **Certificates are archived in `certificates/`.**
- **Do not commit real `.env` files—use `.env.example` as a template.**

---

## 📚 Additional Documentation

- See `docs/` for migration guides and technical notes.
- See `notes/` for planning, to-dos, and brainstorming.

---

## 💡 About This Project

This site is a showcase of my web development work, built with a focus on maintainability, modularity, and best
practices. The build system is custom, but inspired by modern static site generators. If you have questions or want to
contribute, see the docs or contact me.

---

## ✨ CSS Naming Convention: BEM

This project uses the BEM (Block\_\_Element--Modifier) naming convention for all CSS/SCSS class names. Example:

```scss
.block {
}
.block__element {
}
.block__element--modifier {
}
```

- **Block:** The standalone entity (e.g., `.header`, `.button`)
- **Element:** A part of the block, separated by `__` (e.g., `.header__logo`)
- **Modifier:** A variation, separated by `--` (e.g., `.button--primary`)

Stylelint is configured to enforce BEM patterns. Please use this convention for all new styles.

---

## 📜 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of code reviews, compliance sweeps, and major updates.
