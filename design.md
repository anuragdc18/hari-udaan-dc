# HARI UDAAN 2026 CRM — Design System

Premium, enterprise-grade SaaS CRM for the State Merit Excellence Awards. Feels like Linear/Stripe/Clerk dashboards, event-branded in HARI UDAAN navy + gold. Frontend-only, mock data.

## Brand
- **Logo lockup:** `/hari-udaan-logo.png` (HARI UDAAN wordmark + phoenix seal, navy/gold)
- **Mark:** `/hari-udaan-mark.png` (circular phoenix seal, sidebar/login)
- Event: HARI UDAAN 2026 · State Merit Excellence Awards · HARI University, Hyderabad · 21 June 2026

## Color Palette
Navy + gold event branding (overrides generic SaaS blue/teal). Status colors kept from spec.

| Token | Light | Use |
|-------|-------|-----|
| `--navy` | `#0B1F4D` | primary brand, sidebar, headings |
| `--navy-700` | `#12296A` | gradients, hovers |
| `--navy-900` | `#071336` | deep bg, sidebar |
| `--gold` | `#D4AF37` | accent, CTAs, highlights |
| `--gold-soft` | `#F0D98C` | gradient tip, glints |
| `--background` | `#F6F8FC` | app bg |
| `--card` | `#FFFFFF` | cards |
| success `#22C55E`, warning `#F59E0B`, danger `#EF4444`, info `#2563EB`, teal `#14B8A6` | | status badges |

Dark theme: navy-900 bg, gold accents preserved, cards `#0F2452`.

## Typography
- **Display / headings:** "Sora" (geometric, premium) — h1/h2/page titles, logo text fallback
- **Body / UI:** "Inter Tight" — tables, labels, inputs
- Weight hierarchy: 700 display, 600 section, 500 labels, 400 body
- Generous line-height (1.5 body, 1.2 headings), letter-spacing -0.01em on display

## Spacing & Shape
- Radius: cards 16px (`rounded-2xl`), inputs/buttons 10–12px, badges full
- Card padding: 20–24px. Section gap: 24–32px
- Soft layered shadows: `0 1px 2px rgba(11,31,77,.06), 0 8px 24px -8px rgba(11,31,77,.12)`
- Gold-glow on primary CTAs: `0 8px 24px -6px rgba(212,175,55,.45)`

## Layout
- **Shell:** fixed collapsible sidebar (navy gradient, gold active states) + sticky top navbar (search, date, notifications, theme toggle, profile)
- Sidebar: 264px expanded / 76px collapsed; becomes drawer on mobile
- Content max-width fluid, 24–32px gutters
- Breadcrumb + page header per page

## Components (reusable)
StatCard, ChartCard, DataTable, StatusBadge, RoleBadge, ProfileCard, Timeline, ActivityFeed, Sidebar, Topbar, PageHeader, Modal, Button, Input, Select, Tabs, Toast, EmptyState, SkeletonLoader, ConfirmDialog, SearchCommand (⌘K).

## Status Badges (unique colors)
- Registered → green · Pending → amber · Certificate Issued → gold · Absent → slate · Duplicate → red · Missing Data → orange

## Motion (Framer Motion / `motion`)
- Page transitions: fade + 8px slide-up, 0.3s ease
- Staggered card reveals on dashboard (0.05s stagger)
- Hover: subtle scale 1.01 + shadow lift on cards/rows
- Loading skeletons, modal scale-in. No excessive motion.

## UX Patterns
- Global ⌘K fuzzy search across mock awardees
- Toasts for actions; "Backend Integration Pending" modal for import/export/report buttons
- Empty/loading/error states everywhere
- Fully responsive: sidebar→drawer, cards stack, tables→card list on mobile

## Mock Data
~120 realistic awardees across Telangana districts, colleges, courses, percentages (95–99.8%), award categories (Gold/Silver/Bronze Merit, Excellence, Topper), registration + certificate statuses, parent/guest counts.
