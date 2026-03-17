# Auto Hub Project Summary

## Project Context
Auto Hub is a multi-role platform connecting car buyers, dealers, admins, and staff across a single responsive web UI. Customers browse featured cars, contact dealers, book test drives, save wishlists, and track orders while dealers manage inventory, uploads, and bookings; admins oversee vehicles, users, orders, notifications, and operational reports.

## Scope
- **Public Pages:** hero, featured cars, search, car details, wishlist, login/register, about/contact, and FAQ sections.
- **Customer Experience:** Firebase auth (email/social), axios API client, Socket.IO notifications, wishlist persistence, inquiry/booking/order forms, OTP/password resets.
- **Dealer Workspace:** inventory CRUD, image uploads with Cloudinary/local fallback, featured badge toggle, deletion, and seeded admin/demo data.
- **Admin/Staff Dashboards:** vehicle management (filter/search), user role controls, reports, notifications, order status, and analytics insights.

## Objectives
- Deliver a responsive single-page React experience (Vite + Tailwind + Radix/Sonner) accessible on mobile and desktop.
- Secure backend with Node/Express, JWT authentication, role-based middleware, CORS/origin validation, and Firebase session verification helpers.
- Provide real-time Socket.IO notifications for invitations, bookings, and orders.
- Automate workflows: Cloudinary uploads with Multer limits, seed scripts, email templates, and order pipelines.

## Feasibility Study
- **Need:** Fragmented car marketplaces lack consistent listings, booking flows, and dealer coordination; Auto Hub unifies inventory, means of communication, and analytics.
- **Significance:** Showcases full-stack engineering (React/Tailwind, Express, MongoDB, Firebase, Cloudinary, Socket.IO) suitable for a BCA project incorporating deployment and maintenance topics.
- **Key Features:** vehicle catalog + filters, bookings/inquiries, orders, wishlist, dealer uploads, admin reports, notifications, and env-aware deployment.

## Methodology / Work Plan
1. Define MongoDB schemas (`users`, `vehicles`, `bookings`, `orders`, `notifications`) plus validation and RBAC middleware.
2. Implement Express routers (`auth`, `vehicles`, `users`, `bookings`, `orders`, `admin`, `staff`, `uploads`, `notifications`) with Cloudinary/local storage fallback.
3. Build the frontend (Vite, React, TanStack Query) with home, cars, detail, auth, dealer/admin/staff dashboards, and shared hooks (`useAuth`, API client, notification toast).
4. Deploy backend to Render (`backend` root, `npm ci`, `npm start`, Render envs for Mongo, JWT, Cloudinary, Firebase, CORS) and frontend to Vercel (`npm run build`, envs for API/socket URLs and Firebase).

## Technology Stack
- **Frontend:** Vite + React + Tailwind + Radix UI + TanStack Query + Sonner toasts + socket.io-client.
- **Backend:** Node/Express + Mongoose + JWT + bcrypt + multer + Cloudinary helper + dotenv + cors + Socket.IO.
- **Infrastructure:** MongoDB Atlas, Firebase Auth, Cloudinary media, Render backend, Vercel frontend, env-aware `.env` helpers for dev vs prod.

## Deployment & Operations
- Render backend configuration: `rootDirectory=backend`, `buildCommand=npm ci`, `startCommand=npm start`, env vars for `MONGODB_URI`, `JWT_SECRET`, Cloudinary credentials, Firebase certs, frontend URL, CORS origins.
- Vercel frontend: `npm run build`, env vars for `VITE_API_BASE_URL`/`VITE_SOCKET_URL`, Firebase settings; automatically falls back to `https://auto-verse1.onrender.com` when not local.
- Monitoring through Render/Vercel logs, Socket.IO toasts, seed scripts, and detailed error handling.

## Security & Data
- JWT stored in `localStorage`, backend enforces `Authorization` header, CORS origins validated, passwords hashed via bcrypt, reset links use hashed tokens and optional SMTP.
- Cloudinary/Firebase secrets stay in env vars; `.env.example` documents placeholders; `.env` files ignored in git.

## Facilities Required
- **Software:** VS Code, Git/GitHub, Node.js/npm, MongoDB Atlas or local Mongo, Firebase Auth/analytics, Cloudinary, Render, Vercel, Chrome/Firefox for QA.
- **Hardware:** Development workstation (Windows/macOS/Linux), reliable internet, optional mobile preview/emulator.

## References
- React + Vite docs  
- Tailwind CSS guide  
- Radix UI + Sonner component docs  
- Express + Mongoose + MongoDB documentation  
- Socket.IO official guides  
- Firebase/Firebase Auth docs  
- Cloudinary documentation  
- Render & Vercel deployment guides
frontend url -> https://auto-verse-omega.vercel.app/
backend url -> https://auto-verse1.onrender.com
