---
name: modern-ui-ux-design
description: Design principles and implementation guidelines for modern 2025-2026 SaaS, Web3, and dashboard user interfaces featuring sleek glassmorphism, Bento grid layouts, micro-interactions, dark mode, and high-clarity typography.
---

# Modern UI/UX Design System Skill (2025 - 2026 Edition)

This skill provides guidelines and patterns for building world-class user interfaces inspired by Linear, Stripe, Vercel, and modern Web3 fintech platforms.

## Visual Foundations

### 1. Typography & Hierarchy
- **Font Stack**: Clean geometric sans-serif (Inter, Plus Jakarta Sans, Geist, SF Pro).
- **Scale**:
  - Hero Display: `text-4xl` to `text-6xl`, `font-extrabold`, `tracking-tight`.
  - Section Headings: `text-xl` to `text-2xl`, `font-bold`, `tracking-tight`.
  - Body: `text-sm` to `text-base`, `text-slate-600 dark:text-slate-300`, line height 1.6.
  - Micro-copy / Meta tags: `text-xs`, `font-medium`, `text-slate-400 dark:text-slate-500`.

### 2. Glassmorphism & Ambient Glows
- **Glass Card**:
  - `backdrop-blur-xl bg-white/80 dark:bg-slate-900/80`
  - Subtle borders: `border border-slate-200/80 dark:border-slate-800/80`
  - Soft multi-layered shadows: `shadow-xs hover:shadow-lg dark:shadow-none dark:hover:shadow-cyan-950/20`
- **Ambient Glows**:
  - Radial gradient backgrounds positioned behind key cards or heroes:
  - `bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-3xl`

### 3. Bento Grid Architecture
- Use responsive CSS Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6`.
- Featured or critical metrics span 2 columns (`col-span-1 md:col-span-2`).
- Each card possesses a clear primary metric, subtext delta, and iconic visual badge.

### 4. Color System & Contrast
- **Light Theme**:
  - Canvas: `bg-slate-50` or `#f8fafc`
  - Surface: `#ffffff`
  - Primary: `#2563eb` (Blue-600) to `#7c3aed` (Violet-600)
  - Text: Primary `#0f172a`, Secondary `#475569`, Muted `#94a3b8`
- **Dark Theme**:
  - Canvas: `bg-slate-950` or `#0b0f19`
  - Surface: `bg-slate-900` or `#131b2e`
  - Cards: `bg-slate-900/90` with border `border-slate-800`
  - Text: Primary `#f8fafc`, Secondary `#94a3b8`, Muted `#64748b`

### 5. Micro-Interactions & States
- **Hover Transitions**: Smooth `transition-all duration-200 ease-out`.
- **Card Hover**: Subtle elevate (`hover:-translate-y-0.5 hover:shadow-md`).
- **Button Press**: Active scale (`active:scale-[0.98]`).
- **Status Indicators**: Live pulsating badges (`animate-ping` inside relative circle).
