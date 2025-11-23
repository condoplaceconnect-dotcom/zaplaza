# Condominium Marketplace App

## 🎯 Project Overview
A hyperlocal delivery and services platform for condominiums. Residents register as customers, vendors (stores or service providers), or delivery drivers. Combines iFood-style product delivery with appointment scheduling.

## 🏗️ Architecture

### Frontend (React + Vite)
- **Pages**: Located in `client/src/pages/`
- **Components**: Reusable UI components in `client/src/components/`
- **Routing**: Wouter for client-side routing
- **Code Splitting**: Implemented with React.lazy() and Suspense for each page
- **Styling**: Tailwind CSS + Shadcn UI components

### Backend (Express.js)
- **Routes**: API endpoints in `server/routes.ts`
- **Storage**: In-memory storage (MemStorage) in `server/storage.ts`
- **Auth**: JWT-based authentication with bcrypt hashing
- **Security**: Helmet.js for security headers, CORS configured

### Database
- PostgreSQL with Drizzle ORM (integrated but not yet connected)
- Schema in `shared/schema.ts`

## 🔐 Security Features Implemented

### ✅ Authentication
- JWT tokens with 1-hour expiry
- Bcrypt password hashing (10 rounds)
- Protected routes with `authMiddleware` and `adminMiddleware`
- Secure token storage in sessionStorage (no localStorage)

### ✅ Payment Security
- **NO card data stored** on frontend
- Stripe integration prepared (endpoints: `/api/payments/create-payment-intent`)
- PIX QR Code support (`/api/payments/create-pix-qr`)
- Webhook endpoint for Stripe events

### ✅ Upload Security
- 5MB file size limit
- MIME type validation (not relying on extensions)
- Filename sanitization
- Upload endpoints prepared for cloud storage (S3/Cloudinary)

### ✅ Input Sanitization
- XSS protection utility in `client/src/lib/sanitize.ts`
- HTML escaping, URL validation, filename sanitization
- All user inputs validated before processing

### ✅ Security Headers
- Content Security Policy (CSP)
- HSTS (1 year)
- X-Frame-Options: DENY (anti-clickjacking)
- X-Content-Type-Options: nosniff
- CORS properly configured

### ✅ Performance
- Lazy loading of images with Intersection Observer (`LazyImage` component)
- Code splitting: Each page loaded with React.lazy() and Suspense
- React Query for data caching and optimization
- Page loader skeleton while code splitting

## 📋 User Types & Roles
1. **Customer**: Browse products, book services, make purchases
2. **Vendor**: Create store (22 categories) or service provider (23 types)
3. **Delivery Driver**: Take orders, manage earnings
4. **Admin**: Approve condos, manage payments, system oversight
5. **Condominium Manager**: Register condo, manage facility

## 💳 Payment System
- **Commission**: 0% - 100% to vendor
- **Methods**: Card (Stripe), PIX (QR Code)
- **Payment Page**: `/checkout`
- **Admin Dashboard**: `/admin/payments`

## 📁 Important Files
- `client/src/App.tsx` - Main app with code splitting
- `server/auth.ts` - JWT and authentication logic
- `client/src/lib/sanitize.ts` - XSS protection utilities
- `client/src/lib/auth.ts` - Frontend auth utilities
- `client/src/components/LazyImage.tsx` - Lazy loading images
- `server/app.ts` - Express setup with security headers

## 🔧 Environment Variables Needed
- `JWT_SECRET` - Secret key for JWT tokens (auto-generated for dev)
- `STRIPE_SECRET_KEY` - When integrating Stripe
- `STRIPE_WEBHOOK_SECRET` - For Stripe webhooks
- `FRONTEND_URL` - For CORS (default: http://localhost:5000)

## 📝 Current Status
- ✅ Full registration system with photo uploads
- ✅ Vendor/Service provider split
- ✅ Checkout with payment methods
- ✅ Admin payments dashboard
- ✅ JWT authentication
- ✅ Security headers
- ✅ Input sanitization
- ✅ Code splitting + lazy loading
- ⚠️ Database connection (ready to connect)
- ⚠️ Stripe live integration (endpoints ready)

## 🚀 Next Steps
1. Connect PostgreSQL database
2. Integrate Stripe with live credentials
3. Deploy to production
4. Implement email notifications
5. Add analytics

## 📱 Design Notes
- iFood-inspired design (green primary, orange accent)
- Mobile-first with bottom navigation
- Dark mode support
- Address privacy: Customers see condo/block/apt, vendors can toggle visibility

## 🔒 Security Checklist
- [x] No card data on frontend
- [x] JWT authentication
- [x] Protected admin routes
- [x] Input sanitization (XSS protection)
- [x] Security headers (Helmet)
- [x] Password hashing (bcrypt)
- [x] CORS configured
- [x] File upload validation
- [x] Code splitting for performance
- [x] Lazy image loading

## User Preferences
- No app commission - vendors receive 100% of payments
- Solicitation-based system for condo registration (admin approval required)
- Address privacy controls for vendors/service providers
