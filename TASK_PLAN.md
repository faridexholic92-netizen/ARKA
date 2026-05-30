# ARKA Enhancement Task Plan

## Project Path
/home/user/.workspace/projects/ARKA

## Stack
Next.js 14 App Router + TypeScript + Firebase Firestore + TailwindCSS + ShadCN/Radix + Zustand + Recharts

## Key Files
- src/types/index.ts — all TypeScript interfaces
- src/services/*.ts — Firebase CRUD services
- src/app/(dashboard)/ — all dashboard pages
- src/components/ — shared components
- src/app/globals.css — CSS vars + theme
- public/logo.png — ARKA logo

## Existing Patterns (follow these exactly)
- inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
- labelCls = "block text-sm font-medium text-gray-700 mb-1"
- Cards: "bg-white rounded-2xl border p-6 shadow-sm"
- Primary buttons: "gradient-primary text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 transition"
- Danger buttons: "bg-red-50 text-red-600 hover:bg-red-100 rounded-xl"
- Toast: import { toast } from "@/components/Toast" → toast.success/error/info
- All text in Bahasa Malaysia

## Tasks

### TASK 1: Edit rekod — Growth, Health, Attendance, Achievement
Each currently only has add + delete. Add EDIT functionality:
- Growth: edit modal inside /growth page (inline form with pre-filled values)
- Health: edit modal inside /health page
- Attendance: edit modal inside /attendance page
- Achievement: edit modal inside /achievements page

For each service file, add updateXxx function:
- growthService.ts: updateGrowthRecord(id, data)
- healthService.ts: updateHealthRecord(id, data) — already has updateDoc imported
- attendanceService.ts: updateAttendanceRecord(id, data)
- achievementService.ts: updateAchievement(id, data)

Edit modal pattern: reuse existing add form, pre-fill with record data, show in a fixed overlay div (not Radix Dialog — keep it simple with Tailwind).

### TASK 2: Custom 404 + Error pages
- Create src/app/not-found.tsx — friendly 404 with logo, "Halaman tidak dijumpai" message, back to dashboard button
- Create src/app/error.tsx — generic error boundary with retry button

### TASK 3: Delete confirmation modal (replace browser confirm())
- Create src/components/ConfirmModal.tsx — reusable modal component
  Props: isOpen, title, message, onConfirm, onCancel, confirmLabel, danger
- Replace ALL confirm() calls in: children/page.tsx, growth/page.tsx, health/page.tsx, attendance/page.tsx, achievements/page.tsx, children/[id]/page.tsx

### TASK 4: Export PDF
- Create src/components/ExportPDF.tsx — a button component
- Create src/app/(dashboard)/children/[id]/report/page.tsx — print-friendly full report page for a child
  Shows: profile info, latest growth, health records, attendance stats, achievements
  Has a "Muat Turun PDF" button that uses jspdf + html2canvas to capture the report div
- Add "Export PDF" button in children/[id]/page.tsx header area

### TASK 5: Global Search
- Create src/components/GlobalSearch.tsx — search overlay/modal
  Searches across: children names, health record titles, achievement titles
  Shows results grouped by category with links
  Opens with Ctrl+K or search icon in sidebar header
- Add search icon button to Sidebar.tsx (top of nav area)

### TASK 6: Filter & Sort for all record pages
- Growth page: sort by date (newest/oldest)
- Health page: filter by category (tabs already exist, but add dropdown filter too), sort by date
- Attendance page: filter by status (present/absent/sick/etc), filter by month
- Achievements page: filter by category

Pattern: Add a small filter bar above the records list. Use local state for filters.

### TASK 7: Appointment reminder badge
- In health/page.tsx and children/[id]/page.tsx health tab:
  Show a badge/alert for records that have nextAppointment within 30 days from today
  Badge: "🔔 X temujanji akan datang" in a yellow/orange callout card at top of health section

### TASK 9: Onboarding flow
- Create src/components/OnboardingModal.tsx
  Show only if user has 0 children (first time user)
  3-step modal: Step 1 Welcome (show logo), Step 2 "Tambah anak pertama anda", Step 3 "Siap!"
  Store completion in localStorage key "arka-onboarded"
- Show in dashboard/page.tsx

### TASK 10: Statistics / Analytics page
- Create src/app/(dashboard)/stats/page.tsx
  Sections:
  a) Growth trend chart — weight & height over time (line chart, multi-child)
  b) Attendance monthly bar chart — compare months
  c) Achievement breakdown — pie/bar by category
  d) Health category breakdown — bar chart
  Uses Recharts (already installed)
- Add "Statistik" nav item to Sidebar.tsx and BottomNav.tsx with BarChart2 icon

### TASK 11: Print-friendly CSS
- In globals.css, add @media print section:
  Hide: Sidebar, BottomNav, ToastContainer, all buttons except content
  Show: clean white background, full width content
  Page breaks between sections
- In children/[id]/report/page.tsx, this will be used for browser print as well

### TASK 12: Dark mode polish
- Audit these components and add dark mode class variants:
  - All form inputs: add dark: classes or use CSS var --input-bg, --input-text, --input-border
  - Cards in children/page.tsx, growth/page.tsx etc that use hard-coded bg-white / text-gray-*
  - Table rows: thead bg-gray-50 → should be dark:bg-slate-800
  - Stat cards on dashboard
  
The existing globals.css already has:
  [data-theme="dark"] .bg-white { background: var(--card-bg) !important; }
  [data-theme="dark"] .bg-gray-50 { background: #0f172a !important; }
  
Extend this with more selectors for text colors and borders in dark mode.
Add to globals.css @layer base:
  [data-theme="dark"] .text-gray-800 { color: #f1f5f9 !important; }
  [data-theme="dark"] .text-gray-700 { color: #e2e8f0 !important; }
  [data-theme="dark"] .text-gray-600 { color: #cbd5e1 !important; }
  [data-theme="dark"] .text-gray-500 { color: #94a3b8 !important; }
  [data-theme="dark"] .text-gray-400 { color: #64748b !important; }
  [data-theme="dark"] .border-gray-100 { border-color: #334155 !important; }
  [data-theme="dark"] .border-gray-200 { border-color: #475569 !important; }
  [data-theme="dark"] input, [data-theme="dark"] select, [data-theme="dark"] textarea {
    background: var(--input-bg) !important;
    color: var(--input-text) !important;
    border-color: var(--input-border) !important;
  }

## Implementation Order
1. Task 3 (ConfirmModal) — needed by Task 1
2. Task 1 (Edit records) — core functionality
3. Task 2 (404/Error pages) — quick win
4. Task 12 (Dark mode) — CSS only
5. Task 11 (Print CSS) — CSS only
6. Task 6 (Filter/Sort) — UI enhancement
7. Task 7 (Appointment reminder) — small feature
8. Task 9 (Onboarding) — new component
9. Task 5 (Global Search) — new component
10. Task 10 (Stats page) — new page
11. Task 4 (Export PDF) — uses jspdf + html2canvas (already installed)

## Git commit at the end
cd /home/user/.workspace/projects/ARKA
git add -A
git commit -m "feat: major enhancement — edit records, 404, confirm modal, PDF export, global search, filter/sort, reminders, onboarding, stats page, print CSS, dark mode polish"
git push origin main
