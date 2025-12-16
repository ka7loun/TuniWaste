# 🗑️ TuniWaste - Circular Waste Marketplace Platform

<div align="center">

**A full-stack MEAN (MongoDB, Express, Angular, Node.js) application connecting waste generators with recyclers in Tunisia**

[![Angular](https://img.shields.io/badge/Angular-17.3-red.svg)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/cloud/atlas)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.2-black.svg)](https://expressjs.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API Reference](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Authentication & Security](#-authentication--security)
- [User Roles & Permissions](#-user-roles--permissions)
- [Development Guide](#-development-guide)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**TuniWaste** is a comprehensive B2B marketplace platform designed to revolutionize waste management in Tunisia by connecting waste generators (sellers) with recyclers (buyers). The platform facilitates efficient waste trading, competitive bidding, secure transactions, and real-time communication, all while ensuring compliance and providing actionable analytics.

### Problem Statement

Traditional waste management in Tunisia faces challenges including:
- Lack of efficient connections between waste generators and recyclers
- Limited transparency in waste trading processes
- Difficulty tracking environmental impact
- Compliance and verification challenges
- Fragmented communication channels

### Solution

TuniWaste provides a unified platform that:
- ✅ Connects waste generators with verified recyclers
- ✅ Enables competitive bidding on waste materials
- ✅ Tracks transactions from negotiation to delivery
- ✅ Ensures compliance through KYC verification
- ✅ Provides real-time analytics and impact metrics
- ✅ Facilitates secure messaging between parties
- ✅ Offers comprehensive admin dashboard for platform management

### Target Users

1. **Waste Generators (Sellers)**: Companies that produce waste materials and want to sell them
2. **Recyclers (Buyers)**: Companies that purchase waste materials for recycling
3. **Administrators**: Platform managers who oversee operations and ensure compliance

---

## ✨ Key Features

### 🔐 User Management & Authentication
- Secure user registration and authentication with JWT
- Role-based access control (Generator/Seller, Buyer/Recycler, Admin)
- KYC (Know Your Customer) verification workflow
- Profile management with company information
- Email-based authentication system

### 📦 Listings Management
- Create, read, update, and delete waste listings
- **6 Waste Categories**: Metals, Plastics, Chemicals, Organics, Construction, Textiles
- Advanced filtering by category, location, quantity, and status
- Location-based search with geospatial indexing
- Status tracking (Open, Reserved, Awarded)
- Document attachments (images, PDFs)
- Thumbnail support for visual browsing
- Expiration date management

### 💰 Bidding System
- Place competitive bids on open listings
- Accept/decline bids (seller functionality)
- Real-time bid updates via polling
- Complete bid history tracking
- Bid status management (Pending, Accepted, Declined)
- Automatic transaction creation on bid acceptance

### 💬 Messaging System
- Thread-based conversation management
- Real-time message updates
- Unread message tracking and notifications
- File attachments in messages
- Direct communication between buyers and sellers
- Message read receipts

### 📊 Transactions Management
- Automatic transaction creation on bid acceptance
- **4-Stage Workflow**: Negotiation → Contract → In-Transit → Delivered
- Document management per transaction
- Complete transaction history
- Value tracking and reporting
- Counterparty information

### 🔔 Notifications
- Real-time notifications via polling
- **4 Notification Types**: Bid, Message, Compliance, System
- Unread count tracking
- Mark as read functionality
- Bulk read operations
- Notification deletion

### 📈 Analytics & Reporting
- **KPI Dashboard**:
  - Waste Diverted (tons)
  - Average Clearance Time
  - Compliance Score
  - Active Deals
- **Impact Metrics**:
  - CO₂ Saved (Scope 3 avoidance)
  - Water Preserved
  - Energy Recovered
- Diversion trend charts (monthly/quarterly)
- Role-based analytics (different views for sellers/buyers)
- Historical data visualization

### 🛡️ Compliance & KYC
- Comprehensive KYC submission workflow
- Company information verification
- Compliance officer details
- Document upload and management
- Certification tracking
- Hazmat handling verification
- Annual waste volume reporting

### 📁 File Management
- Secure document uploads (images, PDFs)
- Multiple file upload support (up to 10 files)
- Upload progress tracking
- File serving and access control
- File deletion capabilities

### 👨‍💼 Admin Dashboard
- Comprehensive super admin dashboard (separate application)
- User management (view, verify, delete)
- Listing management and oversight
- Transaction monitoring
- Platform-wide analytics
- System administration tools

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────┐      ┌──────────────────────┐
│  Angular Frontend   │      │  Admin Dashboard    │
│   (Port 4200)       │      │   (Port 4201)       │
│  Main Application   │      │  Super Admin Panel  │
└──────────┬──────────┘      └──────────┬───────────┘
           │                            │
           │  HTTP/HTTPS + JWT          │  HTTP/HTTPS + JWT
           │  RESTful API               │  RESTful API
           │                            │
           └────────────┬───────────────┘
                        │
           ┌────────────▼────────────┐
           │   Express Backend API   │
           │      (Port 5000)        │
           │                         │
           │  • Authentication       │
           │  • Business Logic       │
           │  • File Handling        │
           │  • Socket.IO Server     │
           └────────────┬────────────┘
                        │
                        │ Mongoose ODM
                        │
           ┌────────────▼────────────┐
           │    MongoDB Atlas        │
           │     (Cloud Database)    │
           │                         │
           │  • User Data            │
           │  • Listings             │
           │  • Bids & Transactions  │
           │  • Messages & Threads   │
           │  • Notifications        │
           └────────────────────────┘
```

### Data Flow

1. **Client Request**: Frontend/Admin makes HTTP request with JWT token
2. **Authentication**: Backend validates JWT via middleware
3. **Authorization**: Role-based access control checks permissions
4. **Business Logic**: Controller processes request and applies business rules
5. **Data Access**: Mongoose queries MongoDB with optimized indexes
6. **Response**: JSON data returned to client
7. **Real-time Updates**: Socket.IO (optional) for live updates

### Key Design Patterns

- **MVC Architecture**: Separation of concerns (Models, Views, Controllers)
- **RESTful API**: Standard HTTP methods and status codes
- **JWT Authentication**: Stateless, scalable authentication
- **Middleware Pattern**: Request processing pipeline
- **Service Layer**: Business logic abstraction
- **Repository Pattern**: Data access abstraction (via Mongoose)

---

## 🛠️ Tech Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 17.3 | Modern frontend framework with standalone components |
| **TypeScript** | 5.4 | Type-safe JavaScript superset |
| **RxJS** | 7.8 | Reactive programming for async operations |
| **Angular Router** | 17.3 | Client-side routing and navigation |
| **Angular Forms** | 17.3 | Reactive forms for user input |
| **SCSS** | Latest | Advanced CSS with variables and mixins |
| **Socket.IO Client** | 4.8 | Real-time bidirectional communication |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime environment |
| **Express.js** | 5.2 | Fast, minimalist web framework |
| **TypeScript** | 5.9 | Type-safe backend development |
| **Mongoose** | 9.0 | MongoDB object modeling |
| **JWT** | 9.0 | Secure token-based authentication |
| **bcryptjs** | 3.0 | Password hashing |
| **Multer** | 2.0 | File upload handling |
| **Socket.IO** | 4.8 | Real-time WebSocket communication |
| **Helmet** | 8.1 | Security headers |
| **CORS** | 2.8 | Cross-origin resource sharing |
| **Morgan** | 1.10 | HTTP request logger |
| **dotenv** | 17.2 | Environment variable management |

### Database

| Technology | Purpose |
|------------|---------|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Mongoose ODM** | Object Data Modeling for MongoDB |
| **Geospatial Indexing** | Location-based queries |
| **Text Indexing** | Full-text search capabilities |

### Development Tools

- **Angular CLI**: Project scaffolding and build tools
- **Nodemon**: Auto-restart development server
- **TypeScript Compiler**: Type checking and compilation
- **tsx**: TypeScript execution for Node.js

---

## 📁 Project Structure

```
TuniWaste/
│
├── 📁 tuniwaste-frontend/          # Main Angular Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                # Core functionality
│   │   │   │   ├── guards/          # Route guards (auth, role, verified)
│   │   │   │   ├── models/          # TypeScript interfaces & types
│   │   │   │   └── services/        # Business logic services
│   │   │   ├── features/            # Feature modules
│   │   │   │   ├── auth/            # Authentication & registration
│   │   │   │   ├── verification/    # KYC verification workflow
│   │   │   │   ├── dashboard/       # Main dashboard hub
│   │   │   │   ├── listings/        # Listings management
│   │   │   │   ├── bidding/         # Bidding interface
│   │   │   │   ├── messaging/       # Messaging system
│   │   │   │   ├── analytics/       # Analytics dashboard
│   │   │   │   └── profile/         # User profile management
│   │   │   ├── shared/              # Shared components
│   │   │   │   └── components/      # Reusable UI components
│   │   │   └── app.routes.ts        # Route configuration
│   │   ├── environments/            # Environment configurations
│   │   ├── styles/                  # Global styles & themes
│   │   │   ├── colors.scss          # Color variables
│   │   │   └── mixins.scss          # SCSS mixins
│   │   └── assets/                  # Static assets
│   └── angular.json                  # Angular configuration
│
├── 📁 tuniwaste-admin/              # Admin Dashboard (Separate App)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                # Core services & guards
│   │   │   ├── features/            # Admin features
│   │   │   │   ├── login/           # Admin authentication
│   │   │   │   ├── dashboard/       # Admin dashboard
│   │   │   │   ├── users/           # User management
│   │   │   │   ├── listings/        # Listing management
│   │   │   │   ├── transactions/    # Transaction oversight
│   │   │   │   └── analytics/       # Platform analytics
│   │   │   └── shared/              # Shared admin components
│   │   └── environments/            # Environment configs
│   └── angular.json
│
└── 📁 tuniwaste-backend/            # Express Backend API
    ├── src/
    │   ├── models/                  # Mongoose schemas
    │   │   ├── User.ts
    │   │   ├── Listing.ts
    │   │   ├── Bid.ts
    │   │   ├── Transaction.ts
    │   │   ├── Message.ts
    │   │   ├── MessageThread.ts
    │   │   └── Notification.ts
    │   ├── controllers/             # Route controllers
    │   │   ├── authController.ts
    │   │   ├── userController.ts
    │   │   ├── listingController.ts
    │   │   ├── bidController.ts
    │   │   ├── transactionController.ts
    │   │   ├── messageController.ts
    │   │   ├── notificationController.ts
    │   │   ├── analyticsController.ts
    │   │   ├── kycController.ts
    │   │   ├── fileController.ts
    │   │   └── adminController.ts
    │   ├── routes/                  # Express routes
    │   │   ├── authRoutes.ts
    │   │   ├── userRoutes.ts
    │   │   ├── listingRoutes.ts
    │   │   ├── bidRoutes.ts
    │   │   ├── transactionRoutes.ts
    │   │   ├── messageRoutes.ts
    │   │   ├── notificationRoutes.ts
    │   │   ├── analyticsRoutes.ts
    │   │   ├── kycRoutes.ts
    │   │   ├── fileRoutes.ts
    │   │   └── adminRoutes.ts
    │   ├── middleware/              # Custom middleware
    │   │   ├── auth.middleware.ts   # JWT authentication
    │   │   └── admin.middleware.ts   # Admin authorization
    │   ├── socket/                  # Socket.IO server
    │   │   └── socketServer.ts
    │   ├── app.ts                   # Express app configuration
    │   └── server.ts                # Server entry point
    ├── scripts/                     # Utility scripts
    │   ├── create-admin.mjs         # Admin user creation
    │   └── create-admin.js
    ├── uploads/                     # File upload directory
    ├── .env                         # Environment variables (not in repo)
    ├── package.json
    ├── tsconfig.json
    └── nodemon.json
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Angular CLI** (v17) - Install globally: `npm install -g @angular/cli`
- **MongoDB Atlas Account** - [Sign up for free](https://www.mongodb.com/cloud/atlas/register)
- **Git** - [Download](https://git-scm.com/)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd TuniWaste
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd tuniwaste-backend

# Install dependencies
npm install

# Create .env file (see Configuration section)
# Create uploads directory
mkdir uploads

# Start development server
npm run dev
```

The backend server will start on `http://localhost:5000`

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd tuniwaste-frontend

# Install dependencies
npm install

# Start development server
ng serve
```

The frontend application will be available at `http://localhost:4200`

#### 4. Admin Dashboard Setup

```bash
# Navigate to admin directory (in a new terminal)
cd tuniwaste-admin

# Install dependencies
npm install

# Start development server
ng serve
```

The admin dashboard will be available at `http://localhost:4201`

### Configuration

#### Backend Environment Variables

Create a `.env` file in `tuniwaste-backend/` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tuniwaste?retryWrites=true&w=majority

# Server Configuration
PORT=5000

# JWT Secret (use a strong, random string in production)
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

**Important**: 
- Replace `username`, `password`, and `cluster` with your MongoDB Atlas credentials
- Use a strong, random JWT secret in production
- Never commit `.env` file to version control

#### Frontend Environment Configuration

Update `tuniwaste-frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
};
```

#### Admin Dashboard Environment Configuration

Update `tuniwaste-admin/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
};
```

#### MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account**: [Sign up here](https://www.mongodb.com/cloud/atlas/register)

2. **Create a Cluster**: 
   - Choose the free tier (M0)
   - Select a cloud provider and region

3. **Create Database User**:
   - Go to Database Access
   - Add a new user with read/write permissions
   - Save the username and password

4. **Whitelist IP Address**:
   - Go to Network Access
   - Add your current IP address (or `0.0.0.0/0` for development only)
   - See [MONGODB_SETUP.md](tuniwaste-backend/MONGODB_SETUP.md) for detailed instructions

5. **Get Connection String**:
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Running the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd tuniwaste-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd tuniwaste-frontend
ng serve
```

**Terminal 3 - Admin Dashboard (Optional):**
```bash
cd tuniwaste-admin
ng serve
```

#### Creating an Admin User

To create an admin user for the admin dashboard:

```bash
cd tuniwaste-backend
npm run create-admin
```

Follow the prompts to create an admin account.

---

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/tuniwaste?retryWrites=true&w=majority` | ✅ Yes |
| `PORT` | Server port number | `5000` | ❌ No (default: 5000) |
| `JWT_SECRET` | Secret key for JWT token signing | `your_super_secret_key` | ✅ Yes |

### Frontend (environment.ts)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `apiUrl` | Backend API base URL | `http://localhost:5000/api` | ✅ Yes |
| `production` | Production mode flag | `false` | ✅ Yes |

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Endpoint Categories

#### 🔐 Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user details

#### 📦 Listing Endpoints

- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/my` - Get current user's listings
- `GET /api/listings/:id` - Get listing by ID
- `POST /api/listings` - Create new listing (seller only)
- `PUT /api/listings/:id` - Update listing (owner only)
- `DELETE /api/listings/:id` - Delete listing (owner only)

#### 💰 Bidding Endpoints

- `GET /api/bids/my` - Get user's bids
- `GET /api/bids/listing/:listingId` - Get bids for a listing
- `POST /api/bids` - Place a bid (buyer only)
- `PUT /api/bids/:id/accept` - Accept bid (seller only)
- `PUT /api/bids/:id/decline` - Decline bid (seller only)

#### 💬 Messaging Endpoints

- `GET /api/messages/threads` - Get all message threads
- `GET /api/messages/threads/:threadId` - Get messages in thread
- `POST /api/messages/threads` - Create new thread
- `POST /api/messages` - Send a message
- `PUT /api/messages/threads/:threadId/read` - Mark thread as read
- `PUT /api/messages/:id/read` - Mark message as read

#### 📊 Transaction Endpoints

- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `PUT /api/transactions/:id/stage` - Update transaction stage
- `POST /api/transactions/:id/documents` - Add document to transaction

#### 🔔 Notification Endpoints

- `GET /api/notifications` - Get all notifications (paginated)
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

#### 📈 Analytics Endpoints

- `GET /api/analytics/kpis` - Get KPI statistics
- `GET /api/analytics/impact` - Get environmental impact metrics
- `GET /api/analytics/diversion-trend` - Get waste diversion trend

#### 📁 File Endpoints

- `POST /api/files/upload` - Upload single file
- `POST /api/files/upload-multiple` - Upload multiple files
- `DELETE /api/files/:filename` - Delete file
- `GET /uploads/:filename` - Serve uploaded file

#### 🛡️ KYC Endpoints

- `POST /api/kyc` - Submit KYC data

#### 👨‍💼 Admin Endpoints

- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/verify` - Verify user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/listings` - Get all listings
- `DELETE /api/admin/listings/:id` - Delete listing
- `GET /api/admin/analytics` - Get platform analytics

### Complete API Documentation

For detailed API documentation including request/response examples, see:
- [API_ENDPOINTS.md](tuniwaste-backend/API_ENDPOINTS.md)

### Example API Calls

#### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "company": "Example Company",
    "contact": "John Doe",
    "role": "generator"
  }'
```

#### Create Listing

```bash
curl -X POST http://localhost:5000/api/listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
    "pickupRequirements": "Requires covered transport"
  }'
```

---

## 🗄️ Database Schema

### User Model

```typescript
{
  email: string (unique, indexed, required)
  passwordHash: string (required)
  company: string (required)
  contact: string (required)
  role: 'generator' | 'buyer' (indexed, required)
  verified: boolean (indexed, default: false)
  kyc: {
    company: {
      legalName: string
      registrationNumber: string
      taxId: string
      industry: string
      hqCity: string
    }
    compliance: {
      handlesHazmat: boolean
      annualWaste: string
      certifications: string[]
    }
    contacts: {
      complianceOfficer: string
      phone: string
      email: string
    }
    documents: string[]
  }
  createdAt: Date (indexed)
  updatedAt: Date
}
```

### Listing Model

```typescript
{
  title: string (required)
  material: string (required)
  category: 'metals' | 'plastics' | 'chemicals' | 'organics' | 'construction' | 'textiles' (indexed, required)
  quantityTons: number (required)
  location: string (required)
  coords: [number, number] (geospatial indexed, required) // [longitude, latitude]
  seller: ObjectId (ref: User, indexed, required)
  status: 'open' | 'reserved' | 'awarded' (indexed, default: 'open')
  pricePerTon: number (required)
  certifications: string[]
  availableFrom: Date (required)
  expiresOn: Date (required)
  pickupRequirements: string
  documents: string[]
  thumbnail: string
  createdAt: Date (indexed)
  updatedAt: Date
}
```

### Bid Model

```typescript
{
  listingId: ObjectId (ref: Listing, indexed, required)
  bidder: ObjectId (ref: User, indexed, required)
  amount: number (required)
  status: 'pending' | 'accepted' | 'declined' (indexed, default: 'pending')
  timestamp: Date (indexed, default: Date.now)
  createdAt: Date
  updatedAt: Date
}
```

### Transaction Model

```typescript
{
  listingId: ObjectId (ref: Listing, required)
  bidId: ObjectId (ref: Bid, required)
  seller: ObjectId (ref: User, indexed, required)
  buyer: ObjectId (ref: User, indexed, required)
  value: number (required)
  stage: 'negotiation' | 'contract' | 'in-transit' | 'delivered' (indexed, default: 'negotiation')
  documents: string[]
  createdAt: Date (indexed)
  updatedAt: Date
}
```

### MessageThread Model

```typescript
{
  participants: ObjectId[] (ref: User, indexed, required)
  listingId: ObjectId (ref: Listing, indexed, optional)
  lastMessage: string
  lastTimestamp: Date (indexed)
  createdAt: Date
  updatedAt: Date
}
```

### Message Model

```typescript
{
  threadId: ObjectId (ref: MessageThread, indexed, required)
  sender: ObjectId (ref: User, required)
  body: string (required)
  timestamp: Date (indexed, default: Date.now)
  attachments: string[]
  readBy: ObjectId[] (ref: User)
  createdAt: Date
}
```

### Notification Model

```typescript
{
  userId: ObjectId (ref: User, indexed, required)
  type: 'bid' | 'message' | 'compliance' | 'system' (indexed, required)
  title: string (required)
  detail: string (required)
  relatedId: ObjectId (polymorphic, optional)
  read: boolean (indexed, default: false)
  timestamp: Date (indexed, default: Date.now)
  createdAt: Date
}
```

### Indexes

The database uses optimized indexes for:
- User email (unique)
- User role and verification status
- Listing category, status, and geospatial coordinates
- Bid listing and status
- Transaction stage and participants
- Message threads and timestamps
- Notifications user and read status

---

## 🔒 Authentication & Security

### JWT Token Flow

1. **Registration/Login**: User submits credentials
2. **Token Generation**: Backend validates and generates JWT token
3. **Token Storage**: Frontend stores token in localStorage
4. **Request Headers**: Token included in `Authorization: Bearer <token>` header
5. **Token Validation**: Backend middleware validates token on each request
6. **Token Expiration**: Tokens expire after 24 hours (configurable)

### Security Features

- ✅ **Password Hashing**: bcryptjs with salt rounds
- ✅ **JWT Tokens**: Secure, stateless authentication
- ✅ **CORS Protection**: Configured for specific origins
- ✅ **Helmet.js**: Security headers (XSS, clickjacking, etc.)
- ✅ **Input Validation**: Request validation middleware
- ✅ **Role-Based Access**: Route-level authorization
- ✅ **File Upload Security**: File type and size validation
- ✅ **Environment Variables**: Sensitive data in .env (not committed)

### Route Guards

#### Frontend Guards

- **authGuard**: Requires user to be authenticated
- **verifiedRedirectGuard**: Redirects verified users away from public pages
- **unverifiedGuard**: Only allows unverified users (for KYC flow)
- **roleGuard**: Restricts routes by user role (generator/buyer)

#### Backend Middleware

- **authenticateToken**: Validates JWT token
- **adminMiddleware**: Verifies admin role for admin routes

---

## 👥 User Roles & Permissions

### Waste Generators (Sellers)

**Capabilities:**
- ✅ Create, edit, and delete their own listings
- ✅ View all bids on their listings
- ✅ Accept or decline bids
- ✅ Manage transactions as seller
- ✅ Send and receive messages
- ✅ View seller-specific analytics
- ✅ Submit KYC for verification

**Restrictions:**
- ❌ Cannot place bids
- ❌ Cannot view other sellers' private listings

### Recyclers (Buyers)

**Capabilities:**
- ✅ Browse all open listings
- ✅ Place bids on listings
- ✅ View their own bid history
- ✅ Manage transactions as buyer
- ✅ Send and receive messages
- ✅ View buyer-specific analytics
- ✅ Submit KYC for verification

**Restrictions:**
- ❌ Cannot create listings
- ❌ Cannot accept/decline bids (only sellers can)

### Administrators

**Capabilities:**
- ✅ Access admin dashboard
- ✅ View all users, listings, and transactions
- ✅ Verify or reject user KYC submissions
- ✅ Delete users and listings
- ✅ View platform-wide analytics
- ✅ Manage system settings

**Access:**
- Admin dashboard available at `http://localhost:4201`
- Requires user account with `role: 'admin'`

---

## 💻 Development Guide

### Backend Development

#### Available Scripts

```bash
npm run dev      # Start development server with auto-reload (nodemon)
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm run create-admin  # Create admin user
```

#### Project Structure

- **Models** (`src/models/`): Mongoose schemas and data models
- **Controllers** (`src/controllers/`): Business logic and request handling
- **Routes** (`src/routes/`): API endpoint definitions
- **Middleware** (`src/middleware/`): Custom middleware functions
- **Socket** (`src/socket/`): Socket.IO server configuration

#### Adding a New Feature

1. **Create Model**: Define schema in `src/models/`
2. **Create Controller**: Implement business logic in `src/controllers/`
3. **Create Routes**: Define endpoints in `src/routes/`
4. **Register Routes**: Add routes to `src/app.ts`
5. **Add Middleware**: Apply authentication/authorization as needed

### Frontend Development

#### Available Scripts

```bash
ng serve         # Start development server
ng build         # Build for production
ng test          # Run unit tests
ng lint          # Run linter
ng generate component <name>  # Generate new component
ng generate service <name>    # Generate new service
```

#### Project Structure

- **Core** (`src/app/core/`): Services, models, guards
- **Features** (`src/app/features/`): Feature modules
- **Shared** (`src/app/shared/`): Reusable components
- **Styles** (`src/styles/`): Global styles and themes

#### Adding a New Feature

1. **Create Service**: Add API service in `src/app/core/services/`
2. **Create Component**: Generate component in `src/app/features/`
3. **Add Routes**: Register route in `src/app/app.routes.ts`
4. **Add Guards**: Apply route guards if needed

### Code Style Guidelines

- **TypeScript**: Use strict type checking
- **Naming**: Use camelCase for variables, PascalCase for classes/components
- **Components**: One component per file
- **Services**: Injectable services for business logic
- **Error Handling**: Try-catch blocks with proper error messages
- **Comments**: Document complex logic and business rules

---

## 🧪 Testing

### Backend Testing

Currently, the backend uses manual testing. To add automated tests:

```bash
# Install testing dependencies
npm install --save-dev jest @types/jest ts-jest

# Run tests
npm test
```

### Frontend Testing

Angular uses Jasmine and Karma for testing:

```bash
# Run unit tests
ng test

# Run tests with coverage
ng test --code-coverage
```

### Manual Testing Checklist

See [TESTING_CHECKLIST.md](tuniwaste-backend/TESTING_CHECKLIST.md) for comprehensive testing procedures.

---

## 🚢 Deployment

### Backend Deployment

#### Production Build

```bash
cd tuniwaste-backend
npm run build
npm start
```

#### Environment Variables

Set production environment variables:
- `MONGODB_URI`: Production MongoDB connection string
- `JWT_SECRET`: Strong, random secret key
- `PORT`: Production port (default: 5000)

#### Process Management

Use PM2 for production:

```bash
npm install -g pm2
pm2 start dist/server.js --name tuniwaste-backend
pm2 save
pm2 startup
```

#### Recommended Platforms

- **Heroku**: Easy deployment with buildpacks
- **Railway**: Simple Node.js deployment
- **DigitalOcean**: App Platform or Droplets
- **AWS**: EC2 or Elastic Beanstalk
- **Azure**: App Service

### Frontend Deployment

#### Production Build

```bash
cd tuniwaste-frontend
ng build --configuration production
```

The build output will be in `dist/tuniwaste-frontend/browser/`

#### Update Environment

Create `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
};
```

#### Recommended Platforms

- **Vercel**: Excellent for Angular apps
- **Netlify**: Easy deployment with CI/CD
- **Firebase Hosting**: Google's hosting solution
- **AWS S3 + CloudFront**: Scalable static hosting
- **GitHub Pages**: Free hosting for static sites

### Admin Dashboard Deployment

Same process as frontend deployment, but deploy to a different domain/subdomain.

### Database Deployment

- **MongoDB Atlas**: Already cloud-hosted, no additional deployment needed
- Ensure production IP whitelist is configured
- Use strong database user credentials
- Enable backup and monitoring

### Security Checklist for Production

- [ ] Use HTTPS for all connections
- [ ] Set strong JWT secret (32+ characters, random)
- [ ] Configure CORS for specific origins only
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Use environment variables for all secrets
- [ ] Enable Helmet security headers
- [ ] Set up file upload size limits
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular security updates

---

## 🔧 Troubleshooting

### Common Issues

#### Backend Won't Start

**Problem**: Server fails to start

**Solutions**:
1. Check if port 5000 is already in use
2. Verify `.env` file exists and has correct values
3. Check MongoDB connection string
4. Ensure `uploads/` directory exists
5. Check Node.js version: `node --version` (should be 18+)

#### MongoDB Connection Error

**Problem**: `MongooseError: connect ECONNREFUSED` or similar

**Solutions**:
1. Verify MongoDB Atlas IP whitelist includes your IP
2. Check connection string in `.env`
3. Verify database user credentials
4. Check if cluster is running (not paused)
5. See [MONGODB_SETUP.md](tuniwaste-backend/MONGODB_SETUP.md) for detailed guide

#### Frontend Can't Connect to Backend

**Problem**: CORS errors or connection refused

**Solutions**:
1. Verify backend is running on port 5000
2. Check `apiUrl` in `environment.ts`
3. Verify CORS is configured in backend
4. Check browser console for specific errors
5. Ensure backend and frontend are on same network (or configure CORS)

#### Authentication Issues

**Problem**: JWT token invalid or expired

**Solutions**:
1. Clear localStorage and login again
2. Check JWT_SECRET matches between token creation and validation
3. Verify token is being sent in Authorization header
4. Check token expiration time

#### File Upload Fails

**Problem**: Files not uploading

**Solutions**:
1. Check `uploads/` directory exists and has write permissions
2. Verify file size is within limits
3. Check file type is allowed
4. Verify multer configuration

#### Admin Dashboard Access Denied

**Problem**: Cannot access admin routes

**Solutions**:
1. Verify user has `role: 'admin'` in database
2. Use `npm run create-admin` to create admin user
3. Check admin middleware is correctly configured
4. Verify JWT token includes admin role

### Getting Help

1. Check error messages in console/terminal
2. Review relevant documentation files
3. Check MongoDB Atlas status
4. Verify all environment variables are set
5. Review [TESTING_CHECKLIST.md](tuniwaste-backend/TESTING_CHECKLIST.md)

---

## 🤝 Contributing

### Development Workflow

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Follow code style guidelines
4. **Test Changes**: Ensure all tests pass
5. **Commit Changes**: Use descriptive commit messages
6. **Push to Branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**: Provide detailed description

### Code Standards

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Ensure backward compatibility

### Reporting Issues

When reporting issues, please include:
- Description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, etc.)
- Error messages or logs

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 👥 Contributors

**TuniWaste Development Team**

- Backend Development
- Frontend Development
- UI/UX Design
- Testing & Quality Assurance

---

## 📞 Support & Contact

For issues, questions, or support:

- **Documentation**: Check the relevant `.md` files in each directory
- **API Documentation**: See [API_ENDPOINTS.md](tuniwaste-backend/API_ENDPOINTS.md)
- **MongoDB Setup**: See [MONGODB_SETUP.md](tuniwaste-backend/MONGODB_SETUP.md)
- **Testing Guide**: See [TESTING_CHECKLIST.md](tuniwaste-backend/TESTING_CHECKLIST.md)

---

## 🎯 Future Enhancements

### Planned Features

- [ ] Real-time notifications via WebSocket (Socket.IO)
- [ ] Email notifications
- [ ] Advanced search with filters
- [ ] Mobile application (React Native)
- [ ] Payment integration
- [ ] Rating and review system
- [ ] Multi-language support (Arabic, French, English)
- [ ] Advanced analytics with machine learning
- [ ] Integration with external waste management systems
- [ ] Automated compliance checking
- [ ] Document verification AI
- [ ] Real-time chat with Socket.IO
- [ ] Push notifications
- [ ] Export reports (PDF, Excel)
- [ ] Advanced geospatial features (distance calculation, route optimization)

### Technical Improvements

- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] Load balancing
- [ ] Database optimization
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] Logging service

---

## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+
- **Backend Endpoints**: 50+
- **Frontend Components**: 30+
- **Database Models**: 7
- **API Routes**: 10+ route groups
- **Development Time**: Multiple iterations

---

## 🙏 Acknowledgments

- **MongoDB Atlas** for cloud database hosting
- **Angular Team** for the excellent framework
- **Express.js Community** for the robust backend framework
- **Open Source Community** for various libraries and tools

---

<div align="center">

**Built with ❤️ for a sustainable future**

**Last Updated**: December 2025

[⬆ Back to Top](#-tuniwaste---circular-waste-marketplace-platform)

</div>
