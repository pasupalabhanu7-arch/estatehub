# EstateHub - MERN Real Estate Listing Platform

List and search properties for sale or rent.
Stack: MongoDB + Express + React (Vite) + Node.js. Auth with JWT and role-based access (buyer, owner, admin).

## Folder structure
```
estatehub/
  server/   Express API + Mongoose models + seed script
  client/   React app (Vite)
```

## Run it (step by step)

Requirements: Node.js 18+ and either local MongoDB or a free MongoDB Atlas cluster.

### 1. Backend
```bash
cd server
npm install
cp .env.example .env      # Windows: copy .env.example .env
```
Open `server/.env` and set:
- `MONGO_URI` - local `mongodb://127.0.0.1:27017/estatehub` or your Atlas string
- `JWT_SECRET` - any long random text

Then:
```bash
npm run seed              # inserts demo users + 12 properties
npm run dev               # API on http://localhost:5000
```
Check http://localhost:5000/api/health shows `{"status":"ok"}`.

### 2. Frontend (new terminal)
```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

## Demo logins (created by the seed script)
| Role  | Email                  | Password |
|-------|------------------------|----------|
| Admin | admin@estatehub.com    | admin123 |
| Owner | owner@estatehub.com    | owner123 |
| Owner | anita@estatehub.com    | owner123 |
| Buyer | buyer@estatehub.com    | buyer123 |

## Features (mapped to the problem statement)
- CRUD with MongoDB: add, view, update, delete properties (title, description, price, location, type, status, owner)
- REST APIs with Node + Express
- React UI: home with search, listings with filters and pagination, detail page, owner dashboard, admin panel
- Search and filter: keyword, city, sale/rent, property type, status, price range, bedrooms, sorting
- Authentication and role-based access:
  - Buyer: browse, save favorites, contact owner
  - Owner: add/edit/delete only own listings, mark sold/rented, see inquiries
  - Admin: manage all users and listings, see stats
- Extras: favorites, inquiries to owner, status badges (available / sold / rented)

## API summary
| Method | Route | Access |
|--------|-------|--------|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/auth/me | logged in |
| GET | /api/properties?q=&city=&listingType=&propertyType=&status=&minPrice=&maxPrice=&bedrooms=&sort=&page= | public |
| GET | /api/properties/:id | public |
| POST | /api/properties | owner, admin |
| PUT / DELETE | /api/properties/:id | listing owner or admin |
| GET | /api/properties/mine | owner, admin |
| GET | /api/properties/favorites | logged in |
| POST | /api/properties/:id/favorite | logged in (toggle) |
| POST | /api/inquiries | logged in |
| GET | /api/inquiries/received, /sent | logged in |
| GET | /api/admin/stats, /users | admin |
| DELETE | /api/admin/users/:id | admin |

## Troubleshooting
- `MongoDB connection failed`: check `MONGO_URI`. On Atlas, add your IP under Network Access and use the right password (URL-encode special characters).
- Login/API calls fail in the browser: make sure the backend is running on port 5000; the Vite dev server proxies `/api` to it.
- Images not showing: seed images load from Unsplash and need internet; a grey "No image" placeholder shows when offline.
- Port already in use: change `PORT` in `server/.env` and the proxy target in `client/vite.config.js`.

## Demo script (2 to 3 minutes)
1. Home page search, then filter by city and price.
2. Open a listing, save it, send a message to the owner.
3. Log in as owner: add a listing, edit it, mark it sold, view the inquiry.
4. Log in as admin: show stats and user/listing management.
5. Mention role-based access: owners cannot edit other owners' listings (API returns 403).
