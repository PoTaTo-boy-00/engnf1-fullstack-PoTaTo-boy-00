# AGENTS.md — TriageSync Frontend

## Project Overview

TriageSync is a full-stack support ticket triage and resource booking platform.

The frontend is built using Next.js App Router, React, TypeScript, and Tailwind CSS.

The application includes:
- Public landing page
- Login and registration
- Ticket dashboard and ticket details
- Resource listing and availability
- User bookings
- Admin resource management
- Admin booking management
- Admin analytics

## Technology Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Axios
- Lucide React
- GSAP, only when useful and already available

## Development Rules

1. Inspect the existing codebase before making changes.
2. Reuse existing components, hooks, services, and utilities.
3. Do not duplicate API clients or authentication logic.
4. Do not modify backend functionality when working on frontend tasks.
5. Use TypeScript with explicit types.
6. Keep components modular and maintainable.
7. Use TanStack Query for server-state management.
8. Use React Hook Form and Zod for form validation.
9. Handle loading, error, and empty states.
10. Preserve existing API request and response contracts.
11. Do not introduce mock data or hardcoded application data.
12. Do not remove existing functionality while improving the UI.

## Design Guidelines

The visual quality of the application is important.

Avoid generic AI-generated SaaS layouts.

Prioritise:
- Strong typography hierarchy
- Consistent spacing
- Intentional grid systems
- Balanced visual composition
- Clear information hierarchy
- Restrained color palettes
- High-quality interaction details
- Responsive layouts

Avoid:
- Excessive gradients
- Excessive rounded cards
- Unnecessary glassmorphism
- Random decorative elements
- Repetitive card-based layouts
- Unnecessary animations

## Landing Page Guidelines

The homepage should be a polished product marketing website.

Use the Voiceflow Screenrove reference as a structural and visual reference, not as a source of branding or copy.

The landing page should include:
- Navigation
- Hero
- Product illustration
- Core features
- Engineering highlights
- How it works
- About the project
- Final call to action
- Footer

Login and registration must link to the existing routes.

The GitHub link must use the actual repository URL.

## Code Quality

- Prefer server components by default.
- Use client components only when interactivity requires them.
- Avoid unnecessary dependencies.
- Keep animations performant.
- Support reduced-motion preferences.
- Ensure accessibility and keyboard navigation.
- Test responsive behavior at 375px, 768px, and 1440px.
- Avoid horizontal overflow.

## Before Completing a Task

1. Run TypeScript checks where available.
2. Run the production build.
3. Check affected routes.
4. Check mobile responsiveness.
5. Report files changed and any unresolved issues.