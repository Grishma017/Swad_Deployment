# Swad (स्वा) – Taste of Nepal · Developer Memory

> **Last updated:** November 2026  
> This file is a living reference for anyone continuing work on this project.  
> It documents the full architecture, decisions made, auth flows, permissions, file structure, and how to run everything.

---

## 1. What Is Swad?

**Swad** (स्वाद, meaning "taste" in Nepali) is a full-stack MERN web application celebrating authentic Nepali culinary heritage. It lets visitors browse traditional recipes, read about food culture, and share their own family recipes with the community.

The project has **three layers of users:**

| Role | Can do |
|------|--------|
| **Visitor** (not logged in) | Browse all recipes, search, filter by category |
| **User** (registered) | Everything a visitor can do + create, edit, and delete **their own** recipes |
| **Admin** | Everything a user can do + delete **any** recipe (moderation), manage all recipes via dashboard |

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Database** | MongoDB (via Mongoose ORM) |
| **Backend** | Node.js + Express.js |
| **Frontend** | React.js (Vite) |
| **Auth** | bcryptjs (password hashing) + jsonwebtoken (JWT) |
| **Image uploads** | Cloudinary (via `multer` + `cloudinary` npm packages) |
| **CSS** | Plain CSS with design tokens (no Tailwind, no component libraries) |

**What is NOT used:** Firebase, Supabase, PHP, MySQL, Passport.js, sessions, Redux, React Router DOM (custom routing via `window.history.pushState` instead).

---

## 3. Monorepo Structure

```
swad-taste-of-nepal/
├── backend/                   ← Express API server
│   ├── middleware/
│   │   ├── authMiddleware.js  ← JWT auth: authenticate, requireAdmin, optionalAuth
│   │   └── uploadMiddleware.js← Cloudinary + multer image upload
│   ├── models/
│   │   ├── Admin.js           ← Admin schema (bcrypt pre-save + comparePassword)
│   │   ├── Recipe.js          ← Recipe schema (see §6)
│   │   └── User.js            ← User schema (bcrypt pre-save + comparePassword)
│   ├── routes/
│   │   ├── authRoutes.js      ← /api/auth/* endpoints
│   │   └── recipeRoutes.js    ← /api/recipes/* endpoints
│   ├── scripts/
│   │   ├── seedAdmin.js       ← One-time admin account creation script
│   │   └── seedRecipes.js     ← Seed sample recipes into MongoDB
│   ├── server.js              ← Express entry point
│   ├── .env                   ← Secrets (never commit this)
│   └── .env.example           ← Template for .env
│
├── frontend/                  ← React (Vite) SPA
│   └── src/
│       ├── admin/             ← Admin panel components
│       │   ├── AdminLogin.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── AdminLayout.jsx
│       │   ├── ManageRecipes.jsx
│       │   ├── AddRecipe.jsx
│       │   ├── EditRecipe.jsx
│       │   └── admin.css
│       ├── user/              ← User panel components
│       │   ├── UserAuth.jsx   ← Combined register + login form
│       │   ├── UserDashboard.jsx
│       │   ├── UserRecipeForm.jsx ← Add/edit recipe form with Cloudinary upload
│       │   └── user.css
│       ├── components/        ← Public site components
│       │   ├── Navbar.jsx
│       │   ├── HeroSection.jsx
│       │   ├── RecipeGrid.jsx
│       │   ├── RecipeCard.jsx
│       │   ├── RecipeDetailModal.jsx
│       │   ├── CategoryFilter.jsx
│       │   ├── CultureSection.jsx
│       │   ├── ShareRecipeSection.jsx
│       │   └── Footer.jsx
│       ├── pages/
│       │   └── CategoryRecipesPage.jsx
│       ├── data/
│       │   ├── categories.js  ← Category definitions (name, slug, href, emoji)
│       │   └── categoryPages.js
│       ├── services/
│       │   └── api.js         ← All fetch calls to backend (unified API client)
│       ├── App.jsx            ← Root component + all routing logic
│       └── App.css
│
├── README.md
└── memory.md                  ← This file
```

---

## 4. How to Run

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally on port 27017
- Cloudinary account (free tier is enough)

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/swad
JWT_SECRET=your_long_random_string_here
PORT=5000
ADMIN_EMAIL=admin@swad.com
ADMIN_PASSWORD=YourSecurePassword123
ADMIN_NAME=Chief Admin
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Cloudinary credentials:** Sign up free at https://cloudinary.com → Dashboard → copy Cloud Name, API Key, API Secret.

### 3. Create the admin account (one-time)

```bash
cd backend
npm run seed:admin
```

This reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` from `.env`, hashes the password with bcryptjs, and saves to MongoDB. Run once only. Never hardcode credentials anywhere.

### 4. (Optional) Seed sample recipes

```bash
cd backend
npm run seed:recipes
```

### 5. Start the servers

```bash
# Terminal 1 – Backend (port 5000)
cd backend
npm start          # or: node server.js

# Terminal 2 – Frontend (port 5173)
cd frontend
npm run dev
```

Open: http://localhost:5173

---

## 5. All Routes

### Public website (no login required)

| URL | What you see |
|-----|-------------|
| `/` | Homepage: hero, recipe grid, culture section, share CTA |
| `/main-course` | Main Course category page |
| `/snacks` | Snacks category page |
| `/desserts` | Desserts category page |
| `/drinks` | Drinks category page |
| `/traditional-newari-food` | Traditional Newari Food category page |

### User panel

| URL | What you see |
|-----|-------------|
| `/user/login` | Login / Register page (toggle between modes) |
| `/user/dashboard` | User dashboard: browse recipes, my recipes, add recipe |

### Admin panel

| URL | What you see |
|-----|-------------|
| `/admin/login` | Admin-only login page |
| `/admin/dashboard` | Stats overview: total recipes, user submissions, category breakdown, recent recipes with creator info |
| `/admin/recipes` | Full recipe table with creator name, role, date added; edit + delete any recipe |
| `/admin/recipes/add` | Add new recipe form |
| `/admin/recipes/edit/:id` | Edit existing recipe form |

---

## 6. Backend API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/auth/user/register` | None | Register new user account |
| POST | `/api/auth/user/login` | None | User login → sets `swadToken` cookie + returns JWT |
| POST | `/api/auth/admin/login` | None | Admin login → sets `swadToken` cookie + returns JWT |
| POST | `/api/auth/logout` | None | Clears `swadToken` (and legacy `adminToken`) cookies |
| GET | `/api/auth/me` | Bearer/cookie JWT | Returns `{ user: { id, name, email, role } }` |

### Recipes — `/api/recipes`

| Method | Endpoint | Auth required | Purpose |
|--------|----------|---------------|---------|
| GET | `/api/recipes` | None | Get all recipes (supports `?category=` and `?search=`) |
| GET | `/api/recipes/:id` | None | Get single recipe by MongoDB ID |
| POST | `/api/recipes/upload-image` | Any logged-in user | Upload image to Cloudinary → `{ url, publicId }` |
| POST | `/api/recipes` | Any logged-in user | Create recipe (auto-sets `createdBy`, `creatorRole`, `creatorName`) |
| PUT | `/api/recipes/:id` | Owner OR admin | Update recipe (non-owners get 403) |
| DELETE | `/api/recipes/:id` | Owner OR admin | Delete recipe + remove image from Cloudinary |
| GET | `/api/recipes/admin/all` | Admin only | Get all recipes with full creator details (admin dashboard) |

---

## 7. Recipe Data Model

```js
// backend/models/Recipe.js
{
  name: String,                  // required
  description: String,
  image: String,                 // Cloudinary secure_url
  imagePublicId: String,         // Cloudinary public_id (for deletion)
  categories: [String],          // e.g. ['Main Course', 'Traditional Newari Food']
  ingredients: [String],         // section: Ingredients
  instructions: [String],        // section: Cooking Instructions
  tips: [String],                // section: Tips & Notes
  prepTime: Number,              // minutes
  cookTime: Number,              // minutes
  servings: Number,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  createdBy: ObjectId,           // ref to Admin or User document
  creatorRole: 'User' | 'Admin',
  creatorName: String,           // denormalized display name
  createdAt: Date,               // auto (Mongoose timestamps)
  updatedAt: Date,               // auto
}
```

### Fixed Recipe Form Sections
All recipe cards share the **same section headings** regardless of who creates them:
1. **Introduction** — description field
2. **Ingredients** — dynamic list of ingredient strings
3. **Cooking Instructions** — dynamic list of step strings
4. **Tips & Notes** — dynamic list of tip strings

---

## 8. Authentication Architecture

### How JWTs work here

1. User/admin submits credentials to the appropriate login endpoint.
2. Backend verifies password with `bcryptjs.compare()`.
3. Backend signs a JWT: `{ id, email, name, role }` with 7-day expiry.
4. JWT is sent as:
   - **HTTP-only cookie** `swadToken` (for server-rendered validation via `/api/auth/me`)
   - **Response body** `token` field (stored in `localStorage` as `swad_token` for the Authorization header on API calls)
5. `authMiddleware.authenticate` reads the JWT from either source (cookie first, then `Authorization: Bearer <token>`).
6. Decoded payload is attached to `req.user = { id, email, name, role }`.
7. `requireAdmin` middleware checks `req.user.role === 'admin'`.

### Admin vs User separation

| | Admin | User |
|-|-------|------|
| Stored in MongoDB | `Admin` collection | `User` collection |
| Login endpoint | `POST /api/auth/admin/login` | `POST /api/auth/user/login` |
| JWT `role` field | `'admin'` | `'user'` |
| Can delete any recipe | ✅ | ❌ |
| Can delete own recipe | ✅ | ✅ |
| Can edit own recipe | ✅ | ✅ |
| Access to `/admin/*` routes | ✅ | ❌ (redirected to admin login) |
| Access to `/user/dashboard` | ❌ (redirected to admin dashboard) | ✅ |

### Session persistence on page refresh

- On app load, `App.jsx` reads `localStorage` for the stored user (fast path, no flash).
- Then calls `GET /api/auth/me` to verify the token is still valid server-side.
- If valid → restore session state; if 401 → clear state and redirect to login.

---

## 9. Image Upload Flow (Cloudinary)

1. User selects an image in `UserRecipeForm.jsx` (or admin form).
2. Frontend calls `uploadRecipeImage(file)` → `POST /api/recipes/upload-image` with multipart FormData.
3. `uploadMiddleware.js` runs `multer` (memory storage) + pipes buffer to Cloudinary.
4. Cloudinary auto-resizes to max 1200×900, quality auto.
5. Backend returns `{ url, publicId }`.
6. Frontend stores `url` in `recipe.image` and `publicId` in `recipe.imagePublicId`.
7. When a recipe is deleted, backend calls `deleteFromCloudinary(publicId)` to free storage.

---

## 10. Design System (CSS Tokens)

All components use these CSS custom properties from `index.css` / `App.css`:

```css
--canvas:  #f5f0e7   /* warm parchment background */
--paper:   #fffcf6   /* lighter card background */
--ink:     #252a25   /* near-black text */
--red:     #b24432   /* primary brand red (Swad color) */
--saffron: #d7a13a   /* accent gold */
--green:   #2e4339   /* deep forest green */
--line:    #ded6c9   /* borders and dividers */
```

**Typography:** System serif for headings, system sans-serif for body. The logo uses the Devanagari script character `स्वा` with a custom fork SVG icon forming the "d".

**Admin badge** = red pill. **User badge** = green pill.

---

## 11. Known Decisions & Constraints

- **No React Router DOM** — routing is done with `window.history.pushState` + `useState(currentPath)` in `App.jsx`. This keeps the bundle small and avoids a router dependency.
- **No Redux / Zustand** — React `useState` + prop drilling is enough for this scale.
- **Admin registration page does NOT exist** — admins are created via `npm run seed:admin` script only.
- **User registration IS public** — anyone can sign up at `/user/login` (toggle to register mode).
- **Recipe form headings are fixed** — Introduction, Ingredients, Cooking Instructions, Tips & Notes. Only the content can differ, not the structure.
- **`creatorName` is denormalized** — stored directly on the Recipe document so recipe listings don't need a join/populate on every query.
- **Cloudinary delete on recipe delete** — when a recipe is deleted, `imagePublicId` is used to call Cloudinary's destroy API. If `imagePublicId` is null (URL-only image), no Cloudinary call is made.

---

## 12. Scripts Reference

```bash
# Backend
npm start              # start Express server (port 5000)
npm run seed:admin     # create admin account from .env vars (run once)
npm run seed:recipes   # seed sample Nepali recipes into MongoDB

# Frontend
npm run dev            # start Vite dev server (port 5173)
npm run build          # production build to frontend/dist/
npm run preview        # preview production build locally
```

---

## 13. Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWTs (keep long and random) |
| `PORT` | No | Backend port (default 5000) |
| `ADMIN_EMAIL` | ✅ for seed | Admin email for `seed:admin` script |
| `ADMIN_PASSWORD` | ✅ for seed | Admin plain-text password for seeding (hashed before saving) |
| `ADMIN_NAME` | No | Admin display name (default: Chief Admin) |
| `NODE_ENV` | No | `development` or `production` |
| `CLOUDINARY_CLOUD_NAME` | ✅ for images | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ for images | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ for images | Your Cloudinary API secret |

---

## 14. Setting Up Cloudinary (Step by Step)

1. Go to https://cloudinary.com and sign up for a free account.
2. After login, open your **Dashboard**.
3. Copy the three values: **Cloud Name**, **API Key**, **API Secret**.
4. Paste them into `backend/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=mycloudname
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWx
   ```
5. Restart the backend server.
6. Test by uploading an image in the user dashboard — it should return a Cloudinary URL.

**Free tier limits (as of 2026):** 25 GB storage, 25 GB bandwidth/month. More than enough for a portfolio project.

---

*This memory file is maintained alongside the codebase. Update it whenever you make significant architectural changes.*
