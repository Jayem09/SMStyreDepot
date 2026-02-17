# SMS Tyre Depot: Premium Tyre E-Commerce & Intelligence Platform

![SMS Tyre Depot Logo](file:///Users/dinglasanefren/Desktop/SMSTyreDepot/frontend/public/logo.png)

A high-performance, full-stack e-commerce ecosystem specifically designed for the tyre industry. This platform combines a premium shopping experience with an AI-powered admin intelligence dashboard.

---

## 🚀 Tech Stack

### Core Architecture
- **Monorepo**: Unified management of Frontend and Backend.
- **Runtime**: Node.js (V3)
- **Deployment**: Vercel (Edge Functions & Serverless API).

### Frontend
- **Framework**: [React 18](https://reactjs.org/) (Vite)
- **Language**: TypeScript
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Lightweight, central state)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) + Lucide Icons
- **Motion**: Framer Motion / Motion (Motion.dev)
- **Performance**: Code-splitting, dynamic imports, and lazy loading.

### Backend & Infrastructure
- **Framework**: Express.js
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Authentication**: JWT & Supabase Auth handles secure user sessions.
- **Emails**: [Resend](https://resend.com/) for transactional receipts and alerts.
- **Push Notifications**: [Firebase Cloud Messaging (FCM)](https://firebase.google.com/docs/cloud-messaging) for real-time order updates.
- **Payments**: Integrated [PayMongo](https://paymongo.com/) API (Gcash, Credit Cards, Maya).

---

## 🎨 Key Features & User Journeys

### 🛠️ The Shopping Experience
- **Smart Tyre Finder**: Multi-step filtering based on Width, Aspect Ratio, and Rim Diameter.
- **Comparison Engine**: Side-by-side comparison of tyre metrics (Load index, speed rating, warranty).
- **Intelligent Recommendations**: "Related Products" suggestions based on matching size or brand.
- **Vehicle Profiles**: Users can save their vehicle info to receive tailored tyre suggestions.
- **Wishlist & Save for Later**: Personalized list for tracking price drops or future purchases.

### 🏢 Admin Intelligence & Management
- **Performance Dashboard**: Real-time sales conversion charts and growth metrics.
- **AI-Powered Intelligence**: Market trend analysis and price prediction modules.
- **Notification Center**: Segmented broadcast system to send push alerts to all users.
- **Service Appointments**: Integrated booking system for tyre fitting and maintenance.
- **Automated Alerts**: Telegram & Email integration for new orders and low stock warnings.

### 🔍 Search & Discovery (SEO)
- **Dynamic SEO**: Auto-generated meta tags and OpenGraph images for every product.
- **Sitemap Generation**: Real-time XML sitemaps to ensure Google indexes all inventory.
- **Structured Data**: JSON-LD schema for Rich Results (Price, Ratings, In-Stock status).

---

## 📖 API Documentation (Overview)

All endpoints are reachable under the `/api` prefix.

| Module | Purpose | Key Endpoints | Auth Required |
| :------- | :------- | :------- | :--- |
| `Auth` | Security | `/login`, `/signup`, `/forgot-password`, `/profile` | Mixed |
| `Products` | Inventory | `/`, `/:id`, `/search`, `/related`, `/featured` | No |
| `Orders` | Commerce | `/:id` (Get), `/` (Create/History) | Yes |
| `Wishlist` | Personalization | `/toggle`, `/` (List) | Yes |
| `Admin` | Ops | `/analytics`, `/intelligence`, `/broadcast` | **Admin Only** |
| `Payments` | FinTech | `/create-source`, `/webhook` | Mixed |
| `Vehicles` | User Data | `/`, `/:id` | Yes |
| `Appointments`| Services | `/book`, `/my-appointments` | Yes |

---

## ⚡ Setup & Development

### 1. Root Installation
One command to install both frontend and backend dependencies:
```bash
npm run install-all
```

### 2. Environment Configuration
Create `.env` files in both directories following these structures:

**Backend (`/backend/.env`)**
```env
PORT=3001
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
JWT_SECRET=...
RESEND_API_KEY=...
PAYMONGO_SECRET_KEY=...
FIREBASE_PRIVATE_KEY=...
```

**Frontend (`/frontend/.env`)**
```env
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=...
VITE_PAYMONGO_PUBLIC_KEY=...
```

### 3. Running Locally
- **Backend**: `cd backend && npm run dev`
- **Frontend**: `cd frontend && npm run dev`

---

## 🚢 Deployment (Vercel)

The platform is designed to be fully Serverless. The `vercel.json` in the root handles the routing between the static React frontend and the Express backend functions.

**Deployment Command:**
```bash
vercel --prod
```

---

## � License
© 2026 SMS Tyre Depot. All rights reserved. Built for precision and performance.
