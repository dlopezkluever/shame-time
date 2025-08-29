# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

**Shame Time** is a mobile app that uses social accountability and competitive "shame-based" systems to help users reduce screen time. The app tracks device screen time and creates public dashboards and leaderboards among friend groups.

### Technology Stack
- **Frontend:** React Native with Expo (TypeScript)
- **State Management:** Zustand
- **UI Framework:** Tamagui for responsive components and theming
- **UI Components:** Tamagui components with custom styling
- **Data Visualization:** Recharts for interactive graphs
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Real-time:** Socket.io for live leaderboards and messaging
- **Payments:** Stripe for optional "Shame Pool" competitions
- **Hosting:** Vercel with PlanetScale for global stats

### Core Architecture Pattern
```
/shame-time-app
├── /app                 # Main app entry and navigation
├── /components          # Reusable UI components
│   ├── /common         # Generic components (Button, Modal)
│   ├── /dashboard      # Personal dashboard components
│   └── /groups         # Group-specific components
├── /screens            # Main app screens
├── /hooks              # Custom React hooks
├── /store              # Zustand state management
├── /services           # External API calls and logic
├── /utils              # Utility functions and constants
├── /assets             # Static assets
├── /styles             # Global styles and Tailwind config
└── /backend            # Server-side code
    ├── /supabase-functions
    └── /vercel-functions
```

## Key Features & Components

### Core Metrics System
- **Shame Score:** Lower is better. Bad apps increase score, good apps decrease it
- **Exponential Breach Penalties:** First breach = 1 penalty, second = 2, third = 4, etc.
- **App Categories:**
  - Bad: Social media, entertainment (TikTok, Instagram, Netflix)
  - Neutral: YouTube
  - Good: Educational apps (Duolingo, Kindle, Audible)

### Database Schema (Supabase PostgreSQL)
- `users` - User profile information
- `groups` - Group settings and admin info
- `group_members` - Many-to-many user-group relationships
- `daily_app_usage` - Daily app usage tracking
- `breaches` - Time limit violation logs
- `payments` - Stripe payment records for Shame Pool

### Privacy Levels
- **Full Access:** Friends see specific app usage
- **Limited Access:** Friends see only categories/genres

## UI Design System

### Theme & Colors
- **Primary Colors:**
  - Background: `#0F0F0F` (Dark, almost black)
  - Text: `#F5F5F5` (Light gray/off-white)
- **Accent Colors:**
  - Green: `#6CC4A1` (Positive metrics, improvement)
  - Yellow: `#F7DC6F` (Neutral metrics, warnings)
  - Red: `#E55B5B` (Negative metrics, high Shame Score)
- **Grayscale:**
  - Light: `#BDBDBD`
  - Medium: `#757575`
  - Dark: `#212121`

### Typography
- **Font Family:** Inter (clean sans-serif)
- **Font Weights:** Light, Regular, SemiBold, Bold
- All text must be optimized for mobile readability

### Component Standards
- **Touch Targets:** Minimum 44x44 pixels for all interactive elements
- **Spacing:** Consistent spacing scale (multiples of 4 or 8)
- **Responsive Design:** Mobile-first with fluid layouts
- **Accessibility:** Proper labeling, keyboard navigation, adequate color contrast
- **Tamagui Integration:** Use Tamagui's theming system for all styling

### Visual Identity
- **Shame Score Gradient:** Green (0-25) → Yellow (26-75) → Red (76-100)
- **Provocative & Humorous Tone:** Bold visuals with slightly provocative messaging
- **Data-First:** Clear hierarchy with most important metrics prominent
- **Interactive Elements:** Visual feedback for all user interactions

## Coding Standards

### File Structure & Naming
- Components: `PascalCase` (e.g., `Button.tsx`)
- Non-components: `camelCase` (e.g., `useAuth.ts`)
- Max 500 lines per file - refactor if exceeded

### TypeScript Requirements
- All files must use TypeScript (`.ts` or `.tsx`)
- Use TSDoc comments for all functions
- Implement proper error handling with try/catch for async operations
- Clear props interfaces for all components

### Code Organization
- Organize imports: external libraries, local components, types
- Component structure: hooks, functions, return statement
- Use descriptive variable/function names
- Reusable components in `/components` hierarchy

### Security Requirements
- Enable Row-Level Security (RLS) on all Supabase tables
- Never handle Stripe payments client-side
- Encrypt all screen time data in transit and at rest
- No secrets or API keys in code

## Development Workflow

### When implementing features:
1. Follow the established component hierarchy in `/components`
2. Use existing hooks pattern in `/hooks` directory
3. Implement proper state management with Zustand
4. Use Tamagui components with custom theming for consistency
5. Follow the UI design system and visual identity guidelines
6. Ensure mobile-first responsive design with proper touch targets
7. Follow the privacy model defined in the architecture docs

### Screen Time Integration
- **iOS:** Use Screen Time API (requires special entitlement)
- **Android:** Use UsageStatsManager API
- Both require explicit user permissions

### Real-time Features
- Use Socket.io rooms for group-specific communications
- Event naming: `shame_score_update`, `new_message`
- Implement throttling for frequent updates

## Current State
This project is in early planning/documentation phase. The core implementation has not yet begun.

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
