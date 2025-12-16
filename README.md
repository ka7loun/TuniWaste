# TuniWaste - Circular Waste Marketplace Platform

A full-stack MEAN (MongoDB, Express, Angular, Node.js) application for connecting waste generators (sellers) with recyclers (buyers) in Tunisia. The platform facilitates waste trading, bidding, transactions, and messaging with comprehensive analytics and compliance tracking.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Development](#development)
- [Deployment](#deployment)

## 🎯 Overview

TuniWaste is a B2B marketplace platform that enables:
- **Waste Generators (Sellers)**: List waste materials for sale, manage listings, receive bids, and track transactions
- **Recyclers (Buyers)**: Browse available waste listings, place bids, communicate with sellers, and manage deals
- **Compliance**: KYC verification, document management, and certification tracking
- **Analytics**: Real-time KPIs, impact metrics (CO₂ savings, waste diversion), and trend analysis
- **Admin Dashboard**: Comprehensive super admin dashboard for platform management (separate application)

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐
│ Angular Frontend│      │ Admin Dashboard  │
│  (Port 4200)    │      │  (Port 4201)     │
└────────┬────────┘      └────────┬─────────┘
         │                        │
         │ HTTP + JWT             │ HTTP + JWT
         │                        │
         └──────────┬─────────────┘
                    │
         ┌──────────▼─────────┐
         │  Express Backend   │
         │    (Port 5000)     │
         └──────────┬─────────┘
                    │ Mongoose
                    │
         ┌──────────▼─────────┐
         │   MongoDB Atlas    │
         │     (Cloud DB)     │
         └────────────────────┘
```

### Data Flow

1. **Frontend Services** → Make HTTP requests with JWT tokens
2. **Backend API** → Validates JWT, processes business logic
3. **MongoDB** → Stores and retrieves data
4. **Response** → Returns JSON data to frontend


## 🛠️ Tech Stack

### Frontend
- **Framework**: Angular 17 (Standalone Components)
- **Language**: TypeScript
- **State Management**: RxJS Observables & BehaviorSubjects
- **Forms**: Angular Reactive Forms
- **Routing**: Angular Router with Guards
- **HTTP**: Angular HttpClient
- **Styling**: SCSS with CSS Variables
- **Build Tool**: Angular CLI

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Security**: Helmet, CORS
- **Logging**: Morgan

### Database
- **Provider**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose

## ✨ Features

### User Management
- User registration and authentication
- Role-based access (Generator/Seller, Buyer/Recycler)
- KYC verification workflow
- Profile management

### Listings Management
- Create, read, update, delete waste listings
- Category-based filtering (metals, plastics, chemicals, organics, construction, textiles)
- Location-based search with geospatial indexing
- Status tracking (open, reserved, awarded)
- Document attachments

### Bidding System
- Place bids on open listings
- Accept/decline bids (sellers)
- Real-time bid updates via polling
- Bid history tracking

### Messaging
- Thread-based conversations
- Real-time message updates
- Unread message tracking
- File attachments in messages

### Transactions
- Automatic transaction creation on bid acceptance
- Stage management (negotiation → contract → in-transit → delivered)
- Document management
- Transaction history

### Notifications
- Real-time notifications via polling
- Notification types: bid, message, compliance, system
- Unread count tracking
- Mark as read functionality

### Analytics
- KPI Dashboard (Waste Diverted, Avg Clearance, Compliance Score, Active Deals)
- Impact Metrics (CO₂ Saved, Water Preserved, Energy Recovered)
- Diversion Trend Charts
- Role-based analytics

### File Management
- Document uploads (images, PDFs)
- Progress tracking
- File serving

## 📁 Project Structure

```
TuniWaste/
├── tuniwaste-frontend/          # Angular Frontend (Main App)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/            # Core services, models, guards
│   │   │   │   ├── guards/      # Route guards (auth, role, verified)
│   │   │   │   ├── models/      # TypeScript interfaces
│   │   │   │   └── services/    # Business logic services
│   │   │   ├── features/        # Feature modules
│   │   │   │   ├── auth/        # Authentication
│   │   │   │   ├── verification/# KYC/Verification
│   │   │   │   ├── dashboard/   # Dashboard hub
│   │   │   │   ├── listings/    # Listings management
│   │   │   │   ├── bidding/     # Bidding interface
│   │   │   │   ├── messaging/   # Messaging system
│   │   │   │   ├── analytics/   # Analytics dashboard
│   │   │   │   └── profile/     # User profile
│   │   │   ├── shared/          # Shared components
│   │   │   │   └── components/  # Reusable components
│   │   │   └── app.routes.ts    # Route configuration
│   │   ├── environments/        # Environment configs
│   │   └── styles/              # Global styles
│   └── angular.json
│
├── tuniwaste-admin/             # Angular Admin Dashboard (Separate App)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/            # Core services, models, guards
│   │   │   ├── features/        # Admin features
│   │   │   │   ├── login/       # Admin login
│   │   │   │   ├── dashboard/  # Admin dashboard
│   │   │   │   ├── users/       # User management
│   │   │   │   ├── listings/   # Listing management
│   │   │   │   ├── transactions/# Transaction management
│   │   │   │   └── analytics/  # Analytics & reports
│   │   │   └── shared/          # Shared components
│   │   └── environments/       # Environment configs
│   └── angular.json
│
└── tuniwaste-backend/           # Express Backend
    ├── src/
    │   ├── models/              # Mongoose schemas
    │   ├── controllers/         # Route controllers
    │   │   └── adminController.ts # Admin controllers
    │   ├── routes/              # Express routes
    │   │   └── adminRoutes.ts   # Admin routes
    │   ├── middleware/          # Custom middleware
    │   │   └── admin.middleware.ts # Admin auth middleware
    │   ├── app.ts               # Express app setup
    │   └── server.ts            # Server entry point
    ├── uploads/                 # File uploads directory
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB Atlas Account** (Free tier available)
- **Angular CLI** (v17): `npm install -g @angular/cli`

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd tuniwaste-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tuniwaste?retryWrites=true&w=majority
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   ```

4. **Create uploads directory:**
   ```bash
   mkdir uploads
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd tuniwaste-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update environment file** (`src/environments/environment.ts`):
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5000/api',
   };
   ```

4. **Start the development server:**
   ```bash
   ng serve
   ```

   The application will be available at `http://localhost:4200`

### Admin Dashboard Setup

1. **Navigate to admin dashboard directory:**
   ```bash
   cd tuniwaste-admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the admin dashboard:**
   ```bash
   ng serve
   ```

   The admin dashboard will be available at `http://localhost:4201` (port is configured automatically)

   **Note:** The admin dashboard requires a user account with `role: 'admin'`. See the admin dashboard README for details on creating an admin user.

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |

### Frontend (environment.ts)

| Variable | Description | Example |
|----------|-------------|---------|
| `apiUrl` | Backend API base URL | `http://localhost:5000/api` |
| `production` | Production mode flag | `false` |

## 📚 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "company": "Company Name",
  "contact": "Contact Name",
  "role": "generator" | "buyer"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "company": "Company Name",
    "contact": "Contact Name",
    "role": "generator",
    "verified": false
  }
}
```

### Listings

#### Get All Listings
```http
GET /api/listings?category=metals&location=Tunis&minQuantity=10
Authorization: Bearer {token}
```

#### Get Single Listing
```http
GET /api/listings/:id
Authorization: Bearer {token}
```

#### Create Listing (Seller Only)
```http
POST /api/listings
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "High-grade Copper Scrap",
  "material": "Copper wiring bundles",
  "category": "metals",
  "quantityTons": 35,
  "location": "Bizerte, Tunisia",
  "coords": [37.2746, 9.8739],
  "pricePerTon": 890,
  "certifications": ["ISO 14001"],
  "availableFrom": "2025-12-01",
  "expiresOn": "2026-01-15",
  "pickupRequirements": "Requires covered transport",
  "documents": [],
  "thumbnail": "url_to_image"
}
```

#### Update Listing
```http
PUT /api/listings/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "pricePerTon": 950
}
```

#### Delete Listing
```http
DELETE /api/listings/:id
Authorization: Bearer {token}
```

### Bidding

#### Place Bid (Buyer Only)
```http
POST /api/bids
Authorization: Bearer {token}
Content-Type: application/json

{
  "listingId": "listing_id",
  "amount": 905
}
```

#### Get Bids for Listing
```http
GET /api/bids/listing/:listingId
Authorization: Bearer {token}
```

#### Accept Bid (Seller Only)
```http
PUT /api/bids/:id/accept
Authorization: Bearer {token}
```

#### Decline Bid (Seller Only)
```http
PUT /api/bids/:id/decline
Authorization: Bearer {token}
```

### Messaging

#### Get Threads
```http
GET /api/messages/threads
Authorization: Bearer {token}
```

#### Get Messages in Thread
```http
GET /api/messages/threads/:threadId
Authorization: Bearer {token}
```

#### Send Message
```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "threadId": "thread_id",
  "body": "Message text",
  "attachments": []
}
```

### Transactions

#### Get All Transactions
```http
GET /api/transactions
Authorization: Bearer {token}
```

#### Update Transaction Stage
```http
PUT /api/transactions/:id/stage
Authorization: Bearer {token}
Content-Type: application/json

{
  "stage": "in-transit"
}
```

### Notifications

#### Get Notifications
```http
GET /api/notifications?page=1&limit=50
Authorization: Bearer {token}
```

#### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer {token}
```

#### Mark as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer {token}
```

### Analytics

#### Get KPIs
```http
GET /api/analytics/kpis
Authorization: Bearer {token}
```

#### Get Impact Metrics
```http
GET /api/analytics/impact
Authorization: Bearer {token}
```

#### Get Diversion Trend
```http
GET /api/analytics/diversion-trend?months=6
Authorization: Bearer {token}
```

### File Upload

#### Upload File
```http
POST /api/files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary]
```

## 🗄️ Database Schema

### User
```typescript
{
  email: string (unique, indexed)
  passwordHash: string
  company: string
  contact: string
  role: 'generator' | 'buyer' (indexed)
  verified: boolean (indexed)
  kyc: {
    company: { legalName, registrationNumber, taxId, industry, hqCity }
    compliance: { handlesHazmat, annualWaste, certifications[] }
    contacts: { complianceOfficer, phone, email }
    documents: string[]
  }
  createdAt: Date
}
```

### Listing
```typescript
{
  title: string
  material: string
  category: 'metals' | 'plastics' | 'chemicals' | 'organics' | 'construction' | 'textiles' (indexed)
  quantityTons: number
  location: string
  coords: [number, number] (geospatial indexed)
  seller: ObjectId (ref User, indexed)
  status: 'open' | 'reserved' | 'awarded' (indexed)
  pricePerTon: number
  certifications: string[]
  availableFrom: Date
  expiresOn: Date
  pickupRequirements: string
  documents: string[]
  thumbnail: string
  createdAt: Date
  updatedAt: Date
}
```

### Bid
```typescript
{
  listingId: ObjectId (ref Listing, indexed)
  bidder: ObjectId (ref User, indexed)
  amount: number
  status: 'pending' | 'accepted' | 'declined' (indexed)
  timestamp: Date (indexed)
  createdAt: Date
}
```

### MessageThread
```typescript
{
  participants: ObjectId[] (ref User, indexed)
  listingId: ObjectId (ref Listing, optional, indexed)
  lastMessage: string
  lastTimestamp: Date (indexed)
  createdAt: Date
  updatedAt: Date
}
```

### Message
```typescript
{
  threadId: ObjectId (ref MessageThread, indexed)
  sender: ObjectId (ref User)
  body: string
  timestamp: Date (indexed)
  attachments: string[]
  readBy: ObjectId[] (ref User)
  createdAt: Date
}
```

### Transaction
```typescript
{
  listingId: ObjectId (ref Listing)
  bidId: ObjectId (ref Bid)
  seller: ObjectId (ref User, indexed)
  buyer: ObjectId (ref User, indexed)
  value: number
  stage: 'negotiation' | 'contract' | 'in-transit' | 'delivered' (indexed)
  documents: string[]
  updatedAt: Date
  createdAt: Date (indexed)
}
```

### Notification
```typescript
{
  userId: ObjectId (ref User, indexed)
  type: 'bid' | 'message' | 'compliance' | 'system'
  title: string
  detail: string
  relatedId: ObjectId (polymorphic)
  read: boolean (indexed)
  timestamp: Date (indexed)
  createdAt: Date
}
```

## 🔒 Authentication & Authorization

### JWT Token Flow

1. User registers/logs in → Receives JWT token
2. Token stored in localStorage
3. Token included in `Authorization: Bearer {token}` header for all protected routes
4. Backend validates token via `authenticateToken` middleware

### Route Guards

- **authGuard**: Requires authentication
- **verifiedRedirectGuard**: Redirects verified users away from public pages
- **unverifiedGuard**: Only allows unverified users
- **roleGuard**: Restricts routes by user role

### Role-Based Access

- **Sellers (generators)**:
  - Create/edit/delete listings
  - Accept/decline bids
  - View bids on their listings

- **Buyers**:
  - Browse all open listings
  - Place bids
  - View their own bids

- **Admins**:
  - Access to super admin dashboard
  - View all users, listings, transactions
  - Manage user verification
  - Delete users and listings
  - View comprehensive analytics and reports

## 💻 Development

### Backend Scripts

```bash
npm run dev      # Start development server with auto-reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
```

### Frontend Scripts

```bash
ng serve         # Start development server
ng build         # Build for production
ng test          # Run unit tests
ng lint          # Run linter
```

### Code Structure Guidelines

- **Services**: Business logic and API calls
- **Components**: UI presentation and user interaction
- **Models**: TypeScript interfaces matching backend schemas
- **Guards**: Route protection logic
- **Middleware**: Backend request processing

### Adding New Features

1. **Backend**:
   - Create model in `src/models/`
   - Create controller in `src/controllers/`
   - Create routes in `src/routes/`
   - Register routes in `src/app.ts`

2. **Frontend**:
   - Create service in `src/app/core/services/`
   - Create components in `src/app/features/`
   - Add routes in `src/app/app.routes.ts`

## 🚢 Deployment

### Backend Deployment

1. Set production environment variables
2. Build TypeScript: `npm run build`
3. Start server: `npm start`
4. Use process manager (PM2) for production

### Frontend Deployment

1. Update `environment.prod.ts` with production API URL
2. Build: `ng build --configuration production`
3. Deploy `dist/` folder to hosting service (Vercel, Netlify, etc.)

### Environment Setup

- **MongoDB Atlas**: Configure IP whitelist and database user
- **CORS**: Update allowed origins in backend
- **File Storage**: Consider cloud storage (AWS S3, Cloudinary) for production

## 📝 License

This project is proprietary software.

## 👥 Contributors

TuniWaste Development Team

## 📞 Support

For issues and questions, please contact the development team.

---

**Last Updated**: December 2025

