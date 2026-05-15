# Project Architecture & Standards

This project follows a **Modified Feature-Sliced Design (FSD)** and **Domain-Driven Design (DDD)** approach. It is optimized for modularity, strict separation of concerns, and AI-assisted development.

## 1. Directory Structure

### `app/` (Composition Layer)

- Strictly for Next.js App Router logic: `layout.tsx`, `page.tsx`, and `route.ts`.
- **Constraint**: Minimal UI logic here. It should import components from `features/` or `shared/` to compose pages.

### `features/` (Domain Layer)

- Each subdirectory represents a standalone functional domain (e.g., `features/design-system`).
- **Isolation Rule**: Features must NEVER import from other features. If logic is needed in multiple features, move it to `shared/`.
- **Internal Structure**: Features often contain their own `components/`, `pages/`, and `hooks/`.

### `shared/` (Infrastructure Layer)

- **`shared/components/ui/`**: Low-level, generic UI components (Buttons, Inputs, Text). These are design-system atoms.
- **`shared/styles/`**: The global design system using a 3-layer CSS architecture.
- **`shared/utils/`**: Helper functions and shared business logic.

---

## 2. Design System & Styling (3-Layer CSS)

We use Vanilla CSS with CSS Variables for theme-ability. **Avoid hardcoded hex values in JSX.**

1.  **Primitives (`shared/styles/colors.css`)**: Raw values (e.g., `--color-sun-500: #ffc20a;`).
2.  **Semantics (`shared/styles/semantics.css`)**: Intentional aliases mapped to primitives (e.g., `--bg-primary: var(--color-sun-500);`). This layer handles **Dark Mode**.
3.  **Component Styles (`shared/styles/*.css`)**: Consumes semantic tokens. Every new UI component should have a corresponding `.css` file here.

---

## 3. UI Component Standards

- **Polymorphism**: Components like `Button` and `Text` should support an `as` prop or automatically switch between HTML elements (e.g., `button` vs `Link`).
- **Icons**: Icons should be passed as `ReactNode` via props (`leftIcon`, `rightIcon`, `icon`) rather than just children to ensure consistent layout.
- **State**: Components should handle `isLoading` and `disabled` states natively.

---

## 4. AI Development Rules (Strict)

When adding code as an AI agent:

1.  **Check the folder first**: Is this a generic tool (`shared`) or a specific feature (`features`)?
2.  **Styles**: Add new variables to the correct CSS layer. Never use Tailwind `theme()` or ad-hoc style objects in JSX for brand colors.
3.  **Imports**: Always use `@/` aliases.
4.  **No Cross-Feature Pollination**: Do not break the isolation between feature folders.
