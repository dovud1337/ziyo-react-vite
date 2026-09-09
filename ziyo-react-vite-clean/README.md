# NOOR — React + Vite

NOOR is a mock **online course marketplace** (like a tiny Udemy) — students browse courses, buy them, take lessons, leave reviews. It's built with plain, familiar tools:

- React
- JavaScript (no TypeScript)
- CSS (no UI framework, no Tailwind)
- Vite
- React Router

## The backend: Supabase

This app talks to a real backend now — [Supabase](https://supabase.com), a hosted Postgres database with built-in auth. Every course, review, cart, and account lives in a shared database, not in your browser. Open the app in two different browsers and you'll see the same data in both, because it's no longer local.

`src/context/AppContext.jsx` is the bridge between the UI and the database: it calls `supabase.auth` for login/register/logout and reads/writes Postgres tables (via `src/lib/supabaseClient.js`) for everything else — courses, curriculum, cart, enrollments, lesson progress, wishlist, reviews, Q&A. The full table layout and permission rules live in `supabase/schema.sql`.

## Run it locally

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, go to **Authentication → Providers → Email** and turn **off** "Confirm email" (this demo has no email-sending set up, so signup needs to log you in immediately instead of waiting on a confirmation link).
3. Open the **SQL Editor**, paste in the contents of `supabase/schema.sql`, and run it once. This creates all the tables and their row-level-security policies.
4. Go to **Settings → API**, copy the **Project URL** and **anon public** key.
5. Copy `.env.example` to `.env` and fill in those two values:
   ```bash
   cp .env.example .env
   ```
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
6. Install and run:
   ```bash
   npm install
   npm run dev
   ```

Open the address Vite prints, usually `http://localhost:5173`.

## Build for production

```bash
npm run build
npm run preview
```

## Folder structure — what lives where

```text
src/
  main.jsx           the very first file that runs — mounts React onto the page
  App.jsx             the list of every route/page ("if the URL is X, show component Y")
  context/
    AppContext.jsx     talks to Supabase — see below, this is the heart of the app
  lib/
    supabaseClient.js  creates the Supabase client from your .env values
  layouts/
    MainLayout.jsx     header + sidebar wrapper shown around every page
  pages/               one file per group of screens (see table below)
  components/          small reusable pieces used across pages (a button, a course card...)
  data/                static config, NOT user data (category names, coupon codes...)
  utils/
    courseHelpers.js   plain JS math functions (average rating, progress %, price with discount)
  styles/
    global.css         all the CSS for the whole app, one file, no CSS modules
```

### The `pages/` files, in plain English

| File | What's in it |
|---|---|
| `HomePage.jsx` | The `/` landing page |
| `CatalogPage.jsx` | `/catalog` — search, filters, course grid |
| `CoursePage.jsx` | `/courses/:id` — one course's detail page: description, curriculum, reviews, Q&A |
| `AuthPages.jsx` | `/login`, `/register`, `/forgot-password` |
| `StudentPages.jsx` | Everything under `/student/...` — dashboard, my courses, wishlist, lesson viewer, certificates |
| `InstructorPages.jsx` | Everything under `/instructor/...` — dashboard, "create a course" form |
| `CommercePages.jsx` | `/cart`, `/checkout`, `/payment-success` |
| `AdminPages.jsx` | `/admin/...` — read-only tables, no real admin actions |
| `PublicPages.jsx` | `/instructors`, `/about`, `/business`, `/teach`, `/blog`, etc. |
| `NotFoundPage.jsx` | The `*` catch-all 404 page |

## How the backend connection works (`AppContext.jsx`)

If you've never used **React Context** before, here's the short version: normally, to pass data from a parent component to a deeply nested child, you'd have to pass it down through every component in between as *props* — annoying if there are 5 layers. Context lets any component, anywhere in the tree, grab shared data directly with one hook call, no prop-passing chain needed.

In this app, `AppContext.jsx` holds the pieces every page needs — the logged-in user, the list of all courses, what's in the cart, who's enrolled in what — and keeps them in sync with Supabase. Any page can read or change it like this:

```js
import { useApp } from '../context/AppContext.jsx';

function SomePage() {
  const { courses, user, addToCart } = useApp();
  // courses -> array of every course that exists (fetched from Postgres)
  // user    -> { id, name, email } or null if nobody's logged in
  // addToCart(courseId) -> async function that writes a cart_items row in Supabase
}
```

Almost every function exposed by `useApp()` (`login`, `addToCart`, `addCourse`, `addReview`, ...) is **async** now, because it's making a network request to the database. Pages that call them use `await` and catch errors — see `AuthPages.jsx` or `CommercePages.jsx` for the pattern.

**Login now really persists.** Supabase keeps a session token in the browser and `AppContext` listens for it with `supabase.auth.onAuthStateChange`, so refreshing the page keeps you logged in — unlike the old localStorage version, which deliberately logged you out on every reload.

### What `useApp()` exposes, roughly

```js
{
  user: null,                 // { id, name, email } once logged in, from Supabase Auth
  courses: [],                // fetched from the `courses` table (with sections/lessons/reviews/qna nested in)
  cartIds: [],                // this user's rows in `cart_items`
  enrollments: {},            // { [courseId]: { enrolledAt, completedLessonIds: [] } }, built from `enrollments` + `completed_lessons`
  wishlistIds: [],            // this user's rows in `wishlist_items`
  subscribedInstructorIds: [],
  instructorCourseIds: [],    // courses where `teacher_id` is this user
}
```

Cart, enrollments, wishlist, and subscriptions are per-user database rows, so they're only fetched (and only writable) once someone is logged in — browsing the catalog logged out still works, but wishlisting or adding to cart requires an account, same as a real course marketplace.

## How routing works (`App.jsx`)

This project uses **React Router**. `App.jsx` is just a big list mapping a URL pattern to a component:

```jsx
<Route path="/courses/:courseId" element={<CoursePage />} />
```

The `:courseId` part is a placeholder — visiting `/courses/3` lets `CoursePage` read `3` via the `useParams()` hook. Almost every page in this app does that to know which course/lesson it's showing.

Everything wrapped inside `<Route element={<MainLayout />}>` shares the same header + sidebar (see `layouts/MainLayout.jsx`). The `/login`, `/register`, `/forgot-password` routes are outside that wrapper, because the auth screens don't have a header/sidebar.

## A story: what happens when you "buy" a course

This is the best way to see how the pieces connect:

1. **Create a course**: `/instructor/create` (`InstructorPages.jsx`) → you fill a form → on submit it calls `addCourse(...)` from `AppContext` → it inserts rows into the `courses`, `sections`, and `lessons` tables in Postgres, then refetches the catalog.
2. **See it in the catalog**: `CatalogPage.jsx` reads `courses` from `useApp()` and renders a `<CourseCard>` for each one — this is a live query result, so it's the same for every visitor, not just you.
3. **Add to cart**: on the course page, clicking "Записаться на курс" calls `addToCart(course.id)`, which inserts a row into `cart_items` for your logged-in user id.
4. **Checkout**: `/checkout` (`CommercePages.jsx`) reads `cartIds`, shows a fake payment form, and on submit calls `enrollCartItems()`, which writes rows into `enrollments` and clears your `cart_items`.
5. **Take the course**: `/student/lesson/:courseId/:lessonId` (`StudentPages.jsx`) reads the course's lessons, lets you mark them complete (`toggleLessonComplete`), and computes a progress percentage.
6. **Get a certificate**: once every lesson is marked complete, `/student/certificates` shows a certificate for that course — no PDF, just a styled panel.

## Quick glossary (if some React terms are still new)

- **Component** — a JS function that returns JSX (HTML-looking code). Every file in `pages/` and `components/` exports one.
- **Props** — arguments passed into a component, e.g. `<CourseCard course={someCourse} />`.
- **State** (`useState`) — data that a component remembers and can change; changing it re-renders the component.
- **Context** (`useContext`) — shared state accessible from any component without passing props down manually (see above).
- **Hook** — any function starting with `use` (`useState`, `useEffect`, `useParams`, `useApp`...). Hooks can only be called inside components.
- **Route** — a URL pattern mapped to a component, defined in `App.jsx`.

## Known limitations (on purpose, not bugs)

- **Payments are fake.** The checkout form collects card-shaped input but never talks to a real payment processor — submitting it just writes `enrollments` rows.
- **No instructor/student role split.** Any logged-in account can create courses; there's no separate "become an instructor" approval step.
- **No password reset email.** The "forgot password" screen shows a confirmation message but doesn't actually send anything (Supabase supports this — it's just not wired up here).

## Deploy to Vercel

1. Upload the folder to GitHub.
2. In Vercel, choose **Add New → Project**.
3. Import the GitHub repository.
4. Vercel detects Vite automatically.
5. Build command: `npm run build`
6. Output directory: `dist`
7. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Environment Variables** (same values as your local `.env`).
8. Click **Deploy**.

The included `vercel.json` makes React Router URLs work after refreshing.
