# 🤖 GitHub Copilot Instructions

## 📁 Project Overview

- **Type:** Static HTML/CSS/JS website
- **Build System:** Node.js scripts (not Vite for production builds)
- **Styling:** SCSS → compiled to CSS
- **Deployment:** GitHub Pages
- **Key Scripts:**
  - `npm run bg` — Build for GitHub Pages with logs
  - `npm run bd` — Build for custom domain with logs
  - Build scripts use PowerShell (`.ps1` files)

## 🎨 Code Style & Standards

- **JavaScript:** Use single quotes (`'`) for strings (ESLint enforced)
- **HTML:** Semantic elements, accessibility-first
- **CSS:** Modern features (clamp, flexbox, grid)
- **Commits:** Conventional commits format (feat:, fix:, refactor:, docs:, etc.)

## 📂 File Structure

- `src/templates/` — HTML templates with `{{placeholders}}`
- `src/scss/` — SCSS source files
- `dist/` — Build output (gitignored)
- `scripts/` — Build and utility scripts
- `docs/` — Documentation
- `archive/` — Deprecated/unused files

## 🔨 Build Process Notes

- Templates use `{{base_url}}` placeholders replaced at build time
- Schema JSON is hard-coded in templates (no dynamic generation)
- Critical CSS is inlined automatically
- Images are optimized during build

---

## Purpose

This file provides guidelines for using GitHub Copilot and Copilot Chat in this repository, including best practices for code suggestions, commit workflows, and collaboration.

---

## 🚦 Commit Workflow (PowerShell Compatible)

1. **Check status and stage only non-ignored files (PowerShell syntax):**
   ```powershell
   git status
   git add .
   git status
   # Unstage any files you don't want to commit:
   git restore --staged <filename>
   ```
2. **Commit with a clear message (PowerShell syntax):**
   ```powershell
   git commit -m "<your descriptive message>"
   ```
3. **Push to remote (PowerShell syntax):**
   ```powershell
   git push
   ```

**When I ask for a commit workflow or plan, always provide all git commands in PowerShell syntax.**

- For all git commands that take a list of files (e.g., `git add`, `git rm`), use spaces to separate file paths, not commas.
- First, provide a single `git add` command for a group of related files or changes (e.g., combine all HTML files in one add command, all config files in another, etc.), using spaces between file names.
- Then, provide a `git commit` command for that group, with a clear, descriptive message for that set of changes.
- Continue this pattern for all changes to be committed.
- Finally, provide the `git push` command.
- Put all git commands inside a single code block ready to be inserted into the terminal.

All git commands must be formatted for PowerShell and use spaces (not commas) as file delimiters.

---

## 📝 .gitignore Best Practices

- Only track files needed for builds, tests, and deployment.
- Never commit real `.env` files or secrets.
- Use negation (`!`) to force-include files if needed.
- If ignored files show up in `git status`, clear them with:
  ```powershell
  git rm -r --cached .
  git add .
  ```

---

## 💡 Copilot Usage Tips

- Use Copilot for boilerplate, repetitive code, and suggestions.
- Always review Copilot's output for accuracy and security.
- Add comments to clarify intent for Copilot and reviewers.
- For documentation or workflow help, ask Copilot Chat.

---

## 🧑‍💻 Reviewer Guidance

- Keep code and comments clear and concise.
- Use `clamp()` and flexbox for responsive CSS.
- Add reviewer notes as HTML comments where needed.
- See `docs/DEVELOPMENT-WORKFLOW.md` for full workflow and troubleshooting.

---

## 📚 Related Documentation

- `README.md` — Project overview and folder structure
- `docs/DEVELOPMENT-WORKFLOW.md` — Full workflow, commands, and troubleshooting
- `docs/environment-setup-guide.txt` — Local and production environment setup

---

## 🆘 Need Help?

- Ask in Copilot Chat for workflow, git, or code help.
- See `docs/` and `notes/` for more guides.
