---
name: tailwind-css-v4
description: Instructions and standards for Tailwind CSS v4 styling, including @theme block configurations, CSS variables mapping, dark mode theming, and modern utility-first component styling.
---

# Tailwind CSS v4 Mastery Skill

Tailwind CSS v4 introduces CSS-first configuration using `@theme` in `src/index.css`. This skill outlines how to configure, structure, and utilize modern Tailwind v4 utilities.

## Key Concepts in Tailwind v4

### 1. Theme Configuration in CSS
Instead of `tailwind.config.js`, define tokens directly inside `@theme` blocks:
```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-canvas-light: #f8fafc;
  --color-canvas-dark: #090d16;
}
```

### 2. Dark Mode Implementation
- Tailwind v4 supports class-based dark mode using `.dark` selector on `<html>` or `<body>`.
- Pair utility variants seamlessly:
  `className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800"`

### 3. Custom Utilities with `@utility`
Define custom project utilities cleanly:
```css
@utility glass-card {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.dark @utility glass-card {
  background-color: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(30, 41, 59, 0.8);
}
```

### 4. Layout & Flex/Grid Patterns
- Use Flexbox for aligned one-dimensional layouts (`flex items-center justify-between gap-3`).
- Use Grid for multi-dimensional dashboards (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`).
- Always support responsive breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px), `2xl:` (1536px).
