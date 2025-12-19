# Cipet - Creative Freelancer Platform

## Project Overview
A professional portfolio and freelance services platform for "Cipet" (Creative Freelancer) with dual language support (Bahasa Indonesia/English), Discord webhook integration for order submissions, and a comprehensive admin dashboard.

## Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Express.js with API routes for Discord webhook proxy
- **Database:** PostgreSQL with Drizzle ORM
- **Form Handling:** React Hook Form + Zod validation
- **Styling:** Modern dark theme with professional color palette
- **Image Processing:** Sharp for image compression
- **Deployment:** Configured for Vercel deployment

## Key Features
1. **Dual Language System (ID/EN)**
   - React Context API for language switching
   - Translation dictionary in `client/src/lib/translations.ts`

2. **Order Form with Service Logic**
   - Graphic Design: Flyer, Poster, Social Media, UI/UX
   - Academic Help: Essay/Paper, PPT, Resume (writing/presentation only)
   - Conditional helper text based on service selection

3. **Discord Webhook Integration**
   - Server-side API route at `/api/order`
   - Rich embed messages with order details
   - Environment variable for secure webhook URL

4. **Admin Dashboard**
   - Secure login with session-based authentication
   - Dashboard with statistics overview
   - Projects management (CRUD operations)
   - Orders management with status tracking
   - Settings page with password change

5. **Real-time Updates (WebSocket)**
   - WebSocket server on `/ws` path
   - Auto-sync when data changes in database
   - Broadcasts: projects_updated, orders_updated, settings_updated
   - TanStack Query cache invalidation for instant UI updates

6. **Image Compression for Admin Uploads**
   - Automatic image compression using Sharp library
   - Targets ~100KB file size with quality optimization
   - Supports JPEG, PNG, GIF, WebP formats
   - Reduces storage and improves page load performance

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/           # Shadcn UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Portfolio.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   └── Footer.tsx
│   │   ├── contexts/         # React contexts
│   │   │   ├── LanguageContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── lib/              # Utilities
│   │   │   ├── translations.ts
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── pages/            # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── admin/        # Admin dashboard pages
│   │   │       ├── AdminLogin.tsx
│   │   │       ├── AdminLayout.tsx
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminProjects.tsx
│   │   │       ├── AdminOrders.tsx
│   │   │       └── AdminSettings.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Database operations
│   ├── db.ts                 # Database connection
│   ├── websocket.ts          # WebSocket server for real-time updates
│   └── index.ts
├── shared/
│   └── schema.ts             # Drizzle schemas and TypeScript types
└── drizzle.config.ts         # Drizzle configuration
```

## Database Schema
- **admin_users:** Admin authentication (username, password, email, role)
- **projects:** Portfolio items (title, description, category, imageUrl, featured)
- **orders:** Customer orders (name, contact, service details, status, notes)
- **site_settings:** Key-value settings storage

## Design System
- **Theme:** Professional dark theme with blue accent colors
- **Primary Color:** HSL 217 91% 60% (Blue)
- **Background (Dark):** HSL 222 47% 6% (Deep navy)
- **Typography:** Inter font family
- **Border Radius:** 0.5rem (subtle rounded corners)
- **Shadows:** Subtle shadow system for depth

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `DISCORD_WEBHOOK_URL` - Discord webhook URL (optional)

## Admin Dashboard Access
1. Navigate to `/admin/login`
2. Click "Setup Admin Awal" to create default admin (first time only)
3. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
4. Change password in Settings after first login

## API Endpoints

### Public
- `POST /api/order` - Submit order form
- `GET /api/projects` - Get all projects

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current admin
- `POST /api/auth/setup` - Create initial admin
- `POST /api/auth/change-password` - Change password

### Admin (Protected)
- `GET /api/admin/projects` - List all projects
- `POST /api/admin/projects` - Create project
- `PATCH /api/admin/projects/:id` - Update project
- `DELETE /api/admin/projects/:id` - Delete project
- `GET /api/admin/orders` - List all orders
- `PATCH /api/admin/orders/:id` - Update order
- `DELETE /api/admin/orders/:id` - Delete order
- `GET /api/admin/stats` - Get dashboard statistics

## Development
```bash
npm run dev   # Start development server on port 5000
npx drizzle-kit push  # Push schema changes to database
```

## Deployment Notes
- Uses Replit's built-in deployment
- Database: PostgreSQL (Railway)
- Session storage: In-memory (MemoryStore)
- All environment variables should be configured as secrets
