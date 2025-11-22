# Design Guidelines: Condominium Delivery Marketplace

## Design Approach

**Reference-Based:** Drawing inspiration from leading delivery platforms (iFood, Rappi, Uber Eats, Mercado Libre) with hyperlocal marketplace adaptations for community-focused commerce.

**Key Principles:**
- Trust-building through visual clarity and familiar patterns
- Product-first presentation with appetizing imagery
- Seamless multi-role experience (buyers, sellers, admins)
- Mobile-first responsive design

## Typography System

**Font Families:**
- Primary: Inter (via Google Fonts) - Clean, modern, highly readable
- Secondary: Poppins (via Google Fonts) - Friendly headers and CTAs

**Hierarchy:**
- Hero/Page Titles: text-4xl to text-5xl, font-bold (Poppins)
- Section Headers: text-2xl to text-3xl, font-semibold (Poppins)
- Product Names: text-lg, font-semibold (Inter)
- Body Text: text-base (Inter)
- Captions/Meta: text-sm, text-gray-600
- Prices: text-xl to text-2xl, font-bold

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 (e.g., p-4, gap-6, mt-8, space-y-2)

**Grid System:**
- Mobile: Single column (grid-cols-1)
- Tablet: 2 columns for products/stores (md:grid-cols-2)
- Desktop: 3-4 columns for catalogs (lg:grid-cols-3, xl:grid-cols-4)

**Container Widths:**
- Mobile marketplace: Full-width with px-4 padding
- Desktop: max-w-7xl mx-auto for main content
- Product details: max-w-4xl for focused views

## Core Components

### Navigation & Header
- Sticky top navigation with condo selector dropdown
- Search bar prominently placed (similar to iFood's persistent search)
- Cart icon with badge counter
- User profile avatar with role indicator
- Bottom tab navigation for mobile (Home, Orders, Sell, Profile)

### Marketplace Homepage
- Hero banner carousel showcasing featured vendors/deals (h-48 to h-64)
- Category chips horizontal scroll (Food, Beverages, Bakery, Snacks, etc.)
- "Popular Now" section with horizontal product scroll
- Store grid with card-based layout

### Store/Vendor Cards
- Square aspect ratio image (aspect-square)
- Store name and category tags
- Rating stars with review count
- Delivery estimate badge
- Rounded corners (rounded-xl)
- Subtle shadow (shadow-md) with hover lift effect

### Product Cards
- Portrait aspect ratio for food items (aspect-[3/4])
- High-quality product image
- Product name, description truncated to 2 lines
- Price prominently displayed
- Add to cart button overlay on image hover (desktop) or bottom-right corner (mobile)
- Rounded corners (rounded-lg)

### Shopping Cart & Checkout
- Sticky bottom cart summary bar on mobile
- Sidebar cart drawer on desktop (slide-in from right)
- Order items list with quantity adjusters (+/-)
- Delivery address selector with unit number
- Order notes textarea
- Total breakdown (subtotal, delivery if applicable)
- Large, prominent "Place Order" CTA button

### Order Tracking
- Timeline/stepper component showing order stages:
  - Order Placed → Accepted → Preparing → Ready → Delivered
- Real-time status updates with timestamps
- Vendor contact information
- Order details expandable accordion

### Vendor Dashboard
- Incoming orders notification banner
- Order cards with accept/reject actions
- Product management grid (add, edit, enable/disable)
- Sales statistics overview with simple charts
- Toggle for "Open/Closed" status (large, clear switch)

### Admin/Condo Management
- Vendor approval queue with pending applications
- Condo profile editor
- Vendor directory with status indicators
- Simple analytics dashboard

## Component Library Details

**Buttons:**
- Primary CTA: Large (py-3 px-6), rounded-lg, font-semibold
- Secondary: Outlined style with border-2
- Icon buttons: Square (w-10 h-10), rounded-full
- Add to Cart: Rounded-full with icon, shadow-lg
- Floating Action Button (FAB) for vendor "Create Product" (bottom-right)

**Forms:**
- Input fields: py-3 px-4, rounded-lg, border-2 focus state
- Labels: text-sm font-medium, mb-2
- Error states: border-red-500 with text-red-600 message
- File upload: Dashed border dropzone with preview

**Cards:**
- Standard padding: p-4 to p-6
- Shadows: shadow-sm default, shadow-lg for emphasis
- Borders: border or rounded corners, no both
- Hover states: scale-105 transform transition

**Badges & Tags:**
- Pill-shaped (rounded-full), px-3 py-1
- Category tags: text-xs uppercase tracking-wide
- Status badges: Different states (pending, accepted, preparing, ready)

**Icons:** Heroicons (outline for navigation, solid for filled states)

## Images

**Product Images:** High-quality, appetizing food photography. Square or portrait orientation. Use placeholder service (Unsplash Food category) for demos.

**Store Logos:** Square format, centered in circular avatars for lists

**Hero Banners:** Wide aspect ratio (21:9 or 16:9), showcasing popular items or promotional campaigns. Multiple rotating banners on homepage.

**Empty States:** Friendly illustrations for empty cart, no orders, etc.

## Responsive Behavior

**Mobile (< 768px):**
- Single column layouts
- Bottom navigation (Home, Browse, Orders, Account)
- Full-width cards with horizontal scrolling sections
- Sticky cart summary bar

**Tablet (768px - 1024px):**
- 2-column product grids
- Sidebar navigation appears
- Cart as slide-in panel

**Desktop (> 1024px):**
- 3-4 column product grids
- Persistent left sidebar for categories
- Right cart panel option
- Hover interactions enabled

## Animation Principles

**Minimal & Purposeful:**
- Page transitions: Simple fade (duration-200)
- Cart additions: Quick scale animation on icon
- Order status changes: Subtle pulse on status badge
- No scroll-triggered animations
- No parallax effects

**Performance:** Use CSS transforms (translate, scale) over position changes