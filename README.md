# FoundIt. — AI-Powered Campus Lost & Found Platform

> **"Lost something? Let's find it."**  
> AI finds the potential match. People verify the item. Campus security ensures safe recovery.

## Tech Stack
- **Frontend**: React 18, Vite, JavaScript, Tailwind CSS, React Router, Lucide React
- **Backend / Persistence**: Firebase (Authentication, Cloud Firestore, Firebase Storage) with an explicit, full-featured **Local Demo Mode** fallback when Firebase environment variables are not configured
- **AI Engine**: SmartFind AI weighted deterministic matching (`35%` description, `25%` category, `25%` location proximity, `15%` date proximity) + optional Gemini API semantic enhancement (`VITE_GEMINI_API_KEY`)
- **Security**: Role-based route protection (`student` vs `admin`), separated `reportSecrets` collection, `firestore.rules`, and `storage.rules`

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables** (optional — leave blank to run in explicit Local Demo Mode):
   Copy `.env.example` to `.env` and populate your Firebase & optional Gemini credentials:
   ```bash
   cp .env.example .env
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Run automated tests & production build**:
   ```bash
   npm test
   npm run build
   ```

## Local Demo Mode vs. Live Firebase
- When `VITE_FIREBASE_*` keys are unset, FoundIt displays a clear **Local Demo Mode** banner and persists all accounts, reports, photos, matches, TrustLoop threads, and audit logs in browser `localStorage` with one-click demo accounts (`Aryan Sharma` Student Owner, `Kunal Verma` Student Finder, and `Security Admin`).
- Public registration (`/register`) strictly assigns `role: "student"`. Admin accounts must be provisioned by an administrator in Firestore (`users/{uid}.role = "admin"`).
