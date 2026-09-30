---
name: react-modern-patterns
description: Best practices and modern architectural patterns for React 19+ applications, including hooks composition, performance optimizations, state ergonomics, and accessible UI patterns.
---

# React Modern Patterns & Best Practices Skill

This skill provides expert guidance for building production-ready, performant, and maintainable React 19+ web applications.

## Core Principles

1. **Component Modularity & Composition**
   - Keep components focused on a single responsibility (Single Responsibility Principle).
   - Prefer composition (`children`, slot patterns) over boolean prop soup.
   - Separate stateful containers from stateless visual presentation components.

2. **React 19 & Modern Hooks Ergonomics**
   - Leverage React 19 features (Actions, `use()`, compiler optimizations, improved form actions).
   - Custom Hooks: Extract repetitive logic into clean hooks (e.g. `useWeb3`, `useTheme`, `useDebounce`, `useLocalStorage`).
   - Clean effects: Always specify proper dependency arrays and return cleanup functions to prevent memory leaks and duplicate event listeners.
   - Avoid redundant state: Derive values during render rather than syncing with `useEffect`.

3. **Performance & Rendering Optimization**
   - Use `React.memo`, `useMemo`, and `useCallback` judiciously on expensive calculations and frequently re-rendering trees.
   - Code splitting with dynamic `React.lazy()` and `<Suspense>` for route-based chunking.
   - Virtualize or paginate large data tables (e.g. smart contract transaction histories).
   - Avoid inline object/array definitions inside tight loop props where reference equality matters.

4. **Form Handling & Validation**
   - Provide instant, accessible inline feedback with clear error messaging.
   - Maintain controlled inputs with clean sanitization and boundary checks (e.g., Ethereum address checksums, token amounts).
   - Disable submission buttons and display loading spinners during active asynchronous transactions.

5. **Accessibility (a11y)**
   - Always include meaningful `aria-label`, `role`, and keyboard navigation support (`tabIndex`, `onKeyDown`).
   - Focus rings: Ensure interactive elements have visible `focus-visible` outlines for keyboard users.
   - Maintain appropriate semantic HTML (`<main>`, `<nav>`, `<aside>`, `<header>`, `<article>`, `<button>`).
