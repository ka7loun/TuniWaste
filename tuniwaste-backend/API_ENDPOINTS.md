# TuniWaste API Endpoints Documentation

## Base URL
`http://localhost:5000/api`

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "company": "Company Name",
  "contact": "Contact Info",
  "role": "generator" | "buyer"
}
```

**Response:** `201 Created`
```json
{
  "token": "jwt_token",
  "user": { "id": "...", "email": "...", "company": "...", "role": "...", "verified": false }
}
```

### POST `/api/auth/login`
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "jwt_token",
  "user": { "id": "...", "email": "...", "company": "...", "role": "...", "verified": true }
}
```

### GET `/api/auth/me`
Get current user details (requires auth).

**Response:** `200 OK`
```json
{
  "user": { "id": "...", "email": "...", "company": "...", "role": "...", "verified": true }
}
```

---

## Listing Endpoints

### GET `/api/listings`
Get all listings (filtered by role).

**Query Parameters:**
- `category`: Filter by category
- `location`: Filter by location (regex)
- `status`: Filter by status
- `minQuantity`: Minimum quantity in tons

**Response:** `200 OK`
```json
[{ "_id": "...", "title": "...", "material": "...", "category": "...", ... }]
```

### GET `/api/listings/my`
Get current user's listings (seller only).

**Response:** `200 OK`
```json
[{ "_id": "...", "title": "...", ... }]
```

### GET `/api/listings/:id`
Get listing by ID.

**Response:** `200 OK`
```json
{ "_id": "...", "title": "...", ... }
```

### POST `/api/listings`
Create new listing (seller only, verified users only).

**Request Body:**
```json
{
  "title": "Listing Title",
  "material": "Material description",
  "category": "metals",
  "quantityTons": 10,
  "location": "Tunis",
  "coords": [10.17, 36.8],
  "pricePerTon": 500,
  "certifications": [],
  "availableFrom": "2024-01-01",
  "expiresOn": "2024-12-31",
  "pickupRequirements": "...",
  "documents": [],
  "thumbnail": "url"
}
```

**Response:** `201 Created`

### PUT `/api/listings/:id`
Update listing (owner only).

**Request Body:** (same as create, all fields optional)

**Response:** `200 OK`

### DELETE `/api/listings/:id`
Delete listing (owner only).

**Response:** `200 OK`
```json
{ "message": "Listing deleted successfully" }
```

---

## Bid Endpoints

### GET `/api/bids/my`
Get user's bids (buyers see their bids, sellers see bids on their listings).

**Response:** `200 OK`
```json
[{ "_id": "...", "listingId": "...", "bidder": "...", "amount": 500, "status": "pending", ... }]
```

### GET `/api/bids/listing/:listingId`
Get all bids for a listing.

**Response:** `200 OK`
```json
[{ "_id": "...", "bidder": "...", "amount": 500, ... }]
```

### POST `/api/bids`
Place a bid (buyer only).

**Request Body:**
```json
{
  "listingId": "listing_id",
  "amount": 500
}
```

**Response:** `201 Created`

### PUT `/api/bids/:id/accept`
Accept a bid (seller only, owner of listing).

**Response:** `200 OK`

### PUT `/api/bids/:id/decline`
Decline a bid (seller only, owner of listing).

**Response:** `200 OK`

---

## Message Endpoints

### GET `/api/messages/threads`
Get all message threads for current user.

**Response:** `200 OK`
```json
[{
  "id": "...",
  "counterpart": "Company Name",
  "role": "buyer",
  "unread": 2,
  "lastMessage": "Last message text",
  "lastTimestamp": "2024-01-01T00:00:00Z"
}]
```

### GET `/api/messages/threads/:threadId`
Get messages in a thread.

**Response:** `200 OK`
```json
[{
  "_id": "...",
  "threadId": "...",
  "sender": { "_id": "...", "company": "...", "email": "..." },
  "body": "Message text",
  "timestamp": "2024-01-01T00:00:00Z",
  "attachments": []
}]
```

### POST `/api/messages/threads`
Create a new message thread.

**Request Body:**
```json
{
  "otherUserId": "user_id",
  "listingId": "listing_id" // optional
}
```

**Response:** `201 Created`

### POST `/api/messages`
Send a message.

**Request Body:**
```json
{
  "threadId": "thread_id",
  "body": "Message text",
  "attachments": [] // optional
}
```

**Response:** `201 Created`

### PUT `/api/messages/threads/:threadId/read`
Mark thread as read.

**Response:** `200 OK`
```json
{ "message": "Thread marked as read" }
```

### PUT `/api/messages/:id/read`
Mark message as read.

**Response:** `200 OK`
```json
{ "message": "Message marked as read" }
```

---

## Transaction Endpoints

### GET `/api/transactions`
Get all transactions for current user.

**Response:** `200 OK`
```json
[{
  "id": "...",
  "listingTitle": "...",
  "counterparty": "Company Name",
  "value": 5000,
  "stage": "negotiation",
  "updatedAt": "2024-01-01T00:00:00Z",
  "documents": []
}]
```

### GET `/api/transactions/:id`
Get transaction by ID.

**Response:** `200 OK`
```json
{
  "_id": "...",
  "listingId": { "_id": "...", "title": "..." },
  "seller": { "_id": "...", "company": "..." },
  "buyer": { "_id": "...", "company": "..." },
  "value": 5000,
  "stage": "negotiation",
  ...
}
```

### PUT `/api/transactions/:id/stage`
Update transaction stage.

**Request Body:**
```json
{
  "stage": "negotiation" | "contract" | "in-transit" | "delivered"
}
```

**Response:** `200 OK`

### POST `/api/transactions/:id/documents`
Add document to transaction.

**Request Body:**
```json
{
  "document": "filename.pdf"
}
```

**Response:** `200 OK`

---

## Notification Endpoints

### GET `/api/notifications`
Get all notifications for current user.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response:** `200 OK`
```json
[{
  "_id": "...",
  "userId": "...",
  "type": "bid" | "message" | "system",
  "title": "Notification title",
  "detail": "Notification detail",
  "read": false,
  "timestamp": "2024-01-01T00:00:00Z",
  "relatedId": "..."
}]
```

### GET `/api/notifications/unread-count`
Get unread notification count.

**Response:** `200 OK`
```json
{ "count": 5 }
```

### PUT `/api/notifications/:id/read`
Mark notification as read.

**Response:** `200 OK`

### PUT `/api/notifications/read-all`
Mark all notifications as read.

**Response:** `200 OK`
```json
{ "message": "All notifications marked as read" }
```

### DELETE `/api/notifications/:id`
Delete notification.

**Response:** `200 OK`
```json
{ "message": "Notification deleted" }
```

---

## Analytics Endpoints

### GET `/api/analytics/kpis`
Get KPI statistics.

**Response:** `200 OK`
```json
[{
  "label": "Waste Diverted",
  "value": "100 t",
  "delta": "+12% vs last qtr",
  "positive": true
}, ...]
```

### GET `/api/analytics/impact`
Get environmental impact metrics.

**Response:** `200 OK`
```json
[{
  "label": "CO₂ Saved",
  "value": "310 t",
  "sublabel": "Scope 3 avoidance",
  "trend": "up"
}, ...]
```

### GET `/api/analytics/diversion-trend`
Get waste diversion trend.

**Query Parameters:**
- `months`: Number of months (default: 6)

**Response:** `200 OK`
```json
[{
  "month": "Jan",
  "divertedTons": 50,
  "co2Saved": 65
}, ...]
```

---

## File Endpoints

### POST `/api/files/upload`
Upload a single file.

**Request:** `multipart/form-data`
- `file`: File to upload

**Response:** `200 OK`
```json
{
  "fileName": "file-1234567890.pdf",
  "originalName": "document.pdf",
  "size": 1024,
  "path": "/uploads/file-1234567890.pdf"
}
```

### POST `/api/files/upload-multiple`
Upload multiple files (max 10).

**Request:** `multipart/form-data`
- `files`: Array of files

**Response:** `200 OK`
```json
{
  "files": [
    { "fileName": "...", "originalName": "...", "size": 1024, "path": "/uploads/..." },
    ...
  ]
}
```

### DELETE `/api/files/:filename`
Delete a file.

**Response:** `200 OK`
```json
{ "message": "File deleted successfully" }
```

### GET `/uploads/:filename`
Serve uploaded file (public access).

---

## KYC Endpoints

### POST `/api/kyc`
Submit KYC data.

**Request Body:**
```json
{
  "kyc": {
    "company": {
      "legalName": "...",
      "registrationNumber": "...",
      "taxId": "...",
      "industry": "...",
      "hqCity": "..."
    },
    "compliance": {
      "handlesHazmat": true,
      "annualWaste": "...",
      "certifications": []
    },
    "contacts": {
      "complianceOfficer": "...",
      "phone": "...",
      "email": "..."
    },
    "documents": []
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "KYC submitted successfully",
  "user": { "id": "...", "verified": true, ... }
}
```

---

## Test Endpoints

### GET `/api/users`
Get all users (development only - remove in production!).

**Response:** `200 OK`
```json
{
  "count": 10,
  "users": [{ "id": "...", "email": "...", "company": "...", ... }]
}
```

---

## Error Responses

All endpoints may return the following error responses:

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "message": "Error message",
  "error": "Detailed error message (development only)"
}
```

