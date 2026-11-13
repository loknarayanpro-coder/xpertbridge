# XpertBridge — Academic Resource & Career Platform

> **Tagline:** Learn. Connect. Grow.  
> **Mission:** Make academic resources easy to find, access, and share for college students.

XpertBridge is a modern, student-focused academic platform engineered for engineering and university students. It empowers students to discover, preview, download, and contribute unit-wise lecture notes and previous-year university examination papers.

---

## 1. Visual Design & Branding

- **Deep Navy (`#102C4B`):** Brand headers, hero headings, and footer.
- **Primary Blue (`#2563EB`):** Primary action buttons, active navigational states, and links.
- **Cyan Accent (`#00D2D3`):** Official XpertBridge bridge arc emblem accent.
- **Subtle Purple (`#8B5CF6`):** Document tags, question paper badges, and highlights.
- **Off-White (`#F8FAFC`):** Application canvas and page backgrounds.
- **Typography:** Inter & Plus Jakarta Sans via Google Fonts.

---

## 2. Technology Stack

- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 with `@tailwindcss/vite`
- **Routing:** React Router v7
- **Icons:** Lucide React & Custom Brand SVGs
- **Backend & Database:** Supabase (PostgreSQL 15, Supabase Auth, Row Level Security, Cloud Storage)
- **State & Storage:** Context API with dual-mode Supabase and localStorage fallback

---

## 3. Implemented Routes & Navigation

| Route | Page | Key Functionality |
|---|---|---|
| `/` | **Homepage** | Typography-led hero, search bar, Explore by Department, Popular Notes, PYQ quick filters, Recently Added grid, and contribution banner. |
| `/notes` | **Notes Library** | Unit-wise notes browser with multi-factor filters (Department, Semester, Unit 1-5, Sort by Newest/Popular/A-Z), PDF preview, and downloads. |
| `/question-papers` | **Question Papers** | University exam paper catalog filtered by Regulation (R2021/R2017), Examination Year, Exam Type (End-Sem, Model, Internal), and Subject. |
| `/departments` | **Department Directory** | Overview of all engineering disciplines (CSE, ECE, EEE, MECH, CIVIL, AIDS) with subject counts and core course chips. |
| `/subjects/:id` | **Subject Details** | Course code, regulation, unit-wise syllabus breakdowns, lecture notes, and past examination papers. |
| `/resources/:id` | **Resource Viewer** | In-browser document viewer with zoom controls, page navigation, fullscreen, print, direct download, and citation metadata. |
| `/search` | **Search Results** | Live multi-faceted search across resource titles, course codes (e.g., `CS3351`), syllabus topics, and departments. |
| `/login` | **Student / Admin Login** | Supabase Auth login with 1-click Demo credentials switcher (`student@xpertbridge.edu` / `admin@xpertbridge.edu`). |
| `/signup` | **Student Registration** | Student registration with name, college email, department, and semester. |
| `/profile` | **Student Profile** | Saved bookmarks library, user contribution tracking (with moderation status), and account settings. |
| `/admin` | **Admin Dashboard** | Protected administrative console for moderating student submissions (Approve/Reject), managing departments, and adding subjects. |
| `/about` | **About Platform** | Brand philosophy, academic integrity guidelines, and comprehensive FAQ. |
| `/contact` | **Contact & Support** | Student inquiry submission, reporting missing subjects, or submitting feedback. |

---

## 4. Dual-Mode Architecture

XpertBridge includes a transparent dual-mode engine:

1. **Interactive Demo Mode (Default when credentials not set):**
   - Populated with realistic, academic sample data (Anna University / Autonomous college engineering curricula: CSE, ECE, EEE, MECH, CIVIL, AIDS).
   - Real interactive state: You can upload notes, bookmark items, create departments, submit materials, approve/reject submissions as admin, and everything persists locally in `localStorage`.
   - 1-click persona switcher in the top banner allows instant switching between **Student (Aravind Sharma)** and **Dean / Admin (Prof. Vikram Raman)**.

2. **Live Supabase Mode:**
   - When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided in `.env`, the application automatically connects to your live PostgreSQL database and Supabase Storage bucket.

---

## 5. Local Setup Instructions

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Steps
1. Clone or navigate to the project directory:
   ```bash
   cd d:/XPERTBRIDGE
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

---

## 6. Supabase Setup & Deployment Guide

To connect your own real Supabase backend:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/20261026000000_initial_schema.sql` from this repository and run it. This will create:
   - Tables (`profiles`, `departments`, `subjects`, `resources`, `question_paper_metadata`, `bookmarks`, `submissions`)
   - Strict Row Level Security (RLS) policies
   - Helper function `is_admin()`
4. Go to **Storage** in your Supabase dashboard:
   - Create a public bucket named `academic-resources`.
5. Copy `.env.example` to `.env` and fill in your project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
6. Restart the Vite dev server (`npm run dev`). The top banner will immediately show **"Supabase Live"**.

---

## 7. Creating Your First Administrator

To promote a user to administrator in your live Supabase database:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin-email@college.edu';
```

---

## 8. Verification & Build Validation

Run production build validation:
```bash
npm run build
```
Build output is bundled and minified to the `dist/` directory, ready for immediate deployment to Vercel, Netlify, or Cloudflare Pages.
