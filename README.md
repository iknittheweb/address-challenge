# I Knit The Web - Portfolio Website

## 🚨 IMPORTANT: Build Process Instructions

This project uses a build process to automatically handle URL updates for different environments.

### 📁 File Structure

- `index.template.html` - **EDIT THIS FILE** for content changes
- `index.html` - Generated file (DO NOT EDIT directly)
- `build.js` - Build script that handles URL replacements

### 🛠️ Development Workflow

#### After editing content:

```bash
npm run dev
```

This builds `index.html` for development (GitHub Pages URLs)

#### Before deploying to production:

```bash
npm run deploy
```

This builds `index.html` for production (custom domain URLs)

### 📝 Remember:

1. **ALWAYS edit `index.template.html`** - never edit `index.html` directly
2. **Run `npm run dev`** after making any changes to test locally
3. **Run `npm run deploy`** before pushing to your live site
4. **Update the production URLs** in `build.js` when you get your custom domain

### 🔄 Commands Quick Reference:

- `npm run dev` - Build for development/testing
- `npm run deploy` - Build for production deployment
- `node build.js development` - Same as npm run dev
- `node build.js production` - Same as npm run deploy

### 🎯 Benefits:

- No manual URL updates needed
- Automatic environment-specific URLs
- Prevents forgetting to update URLs when deploying
