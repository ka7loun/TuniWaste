# TuniWaste Admin Dashboard

A comprehensive super admin dashboard for managing the TuniWaste platform. This is a separate Angular application that runs independently from the main frontend.

## Features

- **Dashboard Overview**: Real-time statistics and metrics
- **User Management**: View, verify, and manage all users
- **Listing Management**: Monitor and manage all waste listings
- **Transaction Monitoring**: Track all transactions across the platform
- **Analytics & Reports**: Comprehensive analytics and insights
- **Activity Timeline**: Real-time activity feed

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v17): `npm install -g @angular/cli`
- Backend server running on `http://localhost:5000`

### Installation

1. Navigate to the admin dashboard directory:
   ```bash
   cd tuniwaste-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

   The admin dashboard will be available at `http://localhost:4200`

### Creating an Admin User

To access the admin dashboard, you need a user account with the `admin` role. You can create one by:

1. Using MongoDB directly to update a user's role:
   ```javascript
   db.users.updateOne(
     { email: "admin@tuniwaste.com" },
     { $set: { role: "admin" } }
   )
   ```

2. Or modify the registration endpoint temporarily to allow admin registration (for development only).

## Usage

### Login

1. Navigate to `http://localhost:4200`
2. You'll be redirected to the login page
3. Enter your admin credentials (email and password)
4. Upon successful login, you'll be taken to the dashboard

### Dashboard

The dashboard provides:
- **Overview Cards**: Total users, listings, bids, transactions, etc.
- **Today's Activity**: New users, listings, bids, transactions created today
- **Distribution Charts**: User roles, listing statuses, transaction stages, bid statuses
- **Recent Activity**: Real-time feed of platform activities

### User Management

- View all users with filtering options (role, verification status, search)
- Verify/unverify users
- Delete users (admin users cannot be deleted)
- View user details and statistics

### Listing Management

- View all listings with filtering (status, category, search)
- Delete listings
- Monitor listing statuses

### Transaction Management

- View all transactions
- Filter by stage (negotiation, contract, in-transit, delivered)
- Monitor transaction values and participants

### Analytics

- Category distribution
- Top sellers by listings and quantity
- Top buyers by transactions and value
- Time-based analytics (6, 12, 24 months)

## API Endpoints

The admin dashboard uses the following backend endpoints:

- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/activity` - Activity timeline
- `GET /api/admin/dashboard/analytics` - Analytics data
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/listings` - Get all listings
- `DELETE /api/admin/listings/:id` - Delete listing
- `GET /api/admin/transactions` - Get all transactions

All endpoints require admin authentication via JWT token.

## Security

- All admin routes are protected by authentication guards
- Only users with `role: 'admin'` can access the dashboard
- JWT tokens are stored in localStorage
- Admin middleware validates admin role on the backend

## Development

### Project Structure

```
tuniwaste-admin/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/        # Route guards
│   │   │   ├── models/        # TypeScript interfaces
│   │   │   └── services/       # API services
│   │   ├── features/
│   │   │   ├── login/         # Login component
│   │   │   ├── dashboard/     # Dashboard component
│   │   │   ├── users/          # User management
│   │   │   ├── listings/      # Listing management
│   │   │   ├── transactions/  # Transaction management
│   │   │   └── analytics/     # Analytics component
│   │   └── shared/
│   │       └── layout/         # Layout component
│   └── environments/
│       └── environment.ts      # Environment configuration
```

### Building for Production

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/tuniwaste-admin` directory.

## Notes

- The admin dashboard runs on a separate port (4200) from the main frontend
- Make sure the backend server is running before starting the admin dashboard
- Admin users should be created carefully and securely
- The dashboard is designed for internal use by platform administrators
