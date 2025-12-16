# Backend API Testing Checklist

## Prerequisites
- MongoDB Atlas connection configured and IP whitelisted
- Backend server running on `http://localhost:5000`
- Frontend running on `http://localhost:4200`

## Test Authentication Flow

### ✅ Register User
- [ ] POST `/api/auth/register` with valid data
- [ ] Verify user created in MongoDB
- [ ] Verify token returned
- [ ] Test duplicate email registration (should fail)
- [ ] Test missing required fields (should fail)

### ✅ Login User
- [ ] POST `/api/auth/login` with valid credentials
- [ ] Verify token returned
- [ ] Test invalid credentials (should fail)
- [ ] Test missing email/password (should fail)

### ✅ Get Current User
- [ ] GET `/api/auth/me` with valid token
- [ ] Verify user data returned
- [ ] Test without token (should fail)
- [ ] Test with invalid token (should fail)

## Test Listing Endpoints

### ✅ Get Listings
- [ ] GET `/api/listings` as buyer (should see only open listings)
- [ ] GET `/api/listings` as seller (should see only own listings)
- [ ] Test filtering by category
- [ ] Test filtering by location
- [ ] Test filtering by minQuantity

### ✅ Get My Listings
- [ ] GET `/api/listings/my` as seller (should see own listings)
- [ ] GET `/api/listings/my` as buyer (should fail with 403)

### ✅ Get Listing by ID
- [ ] GET `/api/listings/:id` with valid ID
- [ ] Test with invalid ID (should return 404)

### ✅ Create Listing
- [ ] POST `/api/listings` as verified seller
- [ ] Verify listing created in MongoDB
- [ ] Test as buyer (should fail with 403)
- [ ] Test as unverified seller (should fail with 403)
- [ ] Test with missing required fields (should fail)

### ✅ Update Listing
- [ ] PUT `/api/listings/:id` as owner
- [ ] Verify listing updated in MongoDB
- [ ] Test as non-owner (should fail with 403)
- [ ] Test with invalid ID (should return 404)

### ✅ Delete Listing
- [ ] DELETE `/api/listings/:id` as owner
- [ ] Verify listing deleted from MongoDB
- [ ] Test as non-owner (should fail with 403)
- [ ] Test with invalid ID (should return 404)

## Test Bidding Endpoints

### ✅ Get My Bids
- [ ] GET `/api/bids/my` as buyer (should see own bids)
- [ ] GET `/api/bids/my` as seller (should see bids on own listings)

### ✅ Get Bids by Listing
- [ ] GET `/api/bids/listing/:listingId` with valid listing
- [ ] Test with invalid listing ID (should return 404)

### ✅ Place Bid
- [ ] POST `/api/bids` as buyer on open listing
- [ ] Verify bid created in MongoDB
- [ ] Verify notification created for seller
- [ ] Test as seller (should fail with 403)
- [ ] Test on own listing (should fail with 400)
- [ ] Test on reserved listing (should fail with 400)
- [ ] Test with missing fields (should fail)

### ✅ Accept Bid
- [ ] PUT `/api/bids/:id/accept` as listing owner
- [ ] Verify bid status updated to 'accepted'
- [ ] Verify listing status updated to 'reserved'
- [ ] Verify other bids declined
- [ ] Verify transaction created
- [ ] Verify message thread created
- [ ] Verify notification created for buyer
- [ ] Test as non-owner (should fail with 403)
- [ ] Test on already accepted bid (should fail)

### ✅ Decline Bid
- [ ] PUT `/api/bids/:id/decline` as listing owner
- [ ] Verify bid status updated to 'declined'
- [ ] Verify notification created for buyer
- [ ] Test as non-owner (should fail with 403)

## Test Message Endpoints

### ✅ Get Threads
- [ ] GET `/api/messages/threads`
- [ ] Verify threads returned with unread counts
- [ ] Test without authentication (should fail)

### ✅ Get Thread Messages
- [ ] GET `/api/messages/threads/:threadId` as participant
- [ ] Test as non-participant (should fail with 403)
- [ ] Test with invalid thread ID (should return 404)

### ✅ Create Thread
- [ ] POST `/api/messages/threads` with valid data
- [ ] Verify thread created in MongoDB
- [ ] Test with existing thread (should return existing thread)
- [ ] Test with missing otherUserId (should fail)

### ✅ Send Message
- [ ] POST `/api/messages` in valid thread
- [ ] Verify message created in MongoDB
- [ ] Verify thread lastMessage updated
- [ ] Verify notification created for other participant
- [ ] Test as non-participant (should fail with 403)
- [ ] Test with missing threadId/body (should fail)

### ✅ Mark Thread as Read
- [ ] PUT `/api/messages/threads/:threadId/read`
- [ ] Verify messages marked as read
- [ ] Test as non-participant (should fail with 403)

## Test Transaction Endpoints

### ✅ Get Transactions
- [ ] GET `/api/transactions`
- [ ] Verify only user's transactions returned
- [ ] Test without authentication (should fail)

### ✅ Get Transaction by ID
- [ ] GET `/api/transactions/:id` as participant
- [ ] Test as non-participant (should fail with 403)
- [ ] Test with invalid ID (should return 404)

### ✅ Update Transaction Stage
- [ ] PUT `/api/transactions/:id/stage` as participant
- [ ] Verify stage updated in MongoDB
- [ ] Verify notification created for other party
- [ ] Test with invalid stage (should fail)
- [ ] Test as non-participant (should fail with 403)

### ✅ Add Transaction Document
- [ ] POST `/api/transactions/:id/documents` as participant
- [ ] Verify document added to transaction
- [ ] Test as non-participant (should fail with 403)

## Test Notification Endpoints

### ✅ Get Notifications
- [ ] GET `/api/notifications`
- [ ] Test pagination with page/limit
- [ ] Verify only user's notifications returned

### ✅ Get Unread Count
- [ ] GET `/api/notifications/unread-count`
- [ ] Verify count matches unread notifications

### ✅ Mark as Read
- [ ] PUT `/api/notifications/:id/read`
- [ ] Verify notification marked as read
- [ ] Test with other user's notification (should fail with 403)

### ✅ Mark All as Read
- [ ] PUT `/api/notifications/read-all`
- [ ] Verify all notifications marked as read

### ✅ Delete Notification
- [ ] DELETE `/api/notifications/:id`
- [ ] Verify notification deleted
- [ ] Test with other user's notification (should fail with 403)

## Test Analytics Endpoints

### ✅ Get KPIs
- [ ] GET `/api/analytics/kpis`
- [ ] Verify KPIs calculated correctly
- [ ] Test with user with no transactions

### ✅ Get Impact Metrics
- [ ] GET `/api/analytics/impact`
- [ ] Verify metrics calculated correctly

### ✅ Get Diversion Trend
- [ ] GET `/api/analytics/diversion-trend`
- [ ] Test with months parameter
- [ ] Verify trend data formatted correctly

## Test File Endpoints

### ✅ Upload File
- [ ] POST `/api/files/upload` with valid file
- [ ] Verify file saved to uploads directory
- [ ] Verify response includes file path
- [ ] Test with invalid file type (should fail)
- [ ] Test with file too large (should fail)

### ✅ Upload Multiple Files
- [ ] POST `/api/files/upload-multiple` with multiple files
- [ ] Verify all files saved
- [ ] Test with more than 10 files (should fail)

### ✅ Delete File
- [ ] DELETE `/api/files/:filename`
- [ ] Verify file deleted from filesystem
- [ ] Test with non-existent file (should return 404)

### ✅ Serve Uploaded File
- [ ] GET `/uploads/:filename`
- [ ] Verify file served correctly

## Test KYC Endpoint

### ✅ Submit KYC
- [ ] POST `/api/kyc` with valid KYC data
- [ ] Verify KYC data saved to user
- [ ] Verify user marked as verified
- [ ] Test with missing required fields (should fail)

## Integration Tests

### ✅ Complete Flow: Listing → Bid → Transaction
1. Seller creates listing
2. Buyer places bid
3. Seller accepts bid
4. Verify transaction created
5. Verify message thread created
6. Verify notifications sent
7. Update transaction stage
8. Complete transaction

### ✅ Complete Flow: Messaging
1. Create message thread
2. Send messages back and forth
3. Verify notifications
4. Mark thread as read

## Security Tests

### ✅ Authentication
- [ ] All protected endpoints require valid token
- [ ] Invalid tokens return 401/403
- [ ] Expired tokens handled correctly

### ✅ Authorization
- [ ] Users can only access their own resources
- [ ] Role-based access control works
- [ ] Ownership checks work correctly

### ✅ Input Validation
- [ ] Required fields validated
- [ ] Invalid data types rejected
- [ ] SQL injection attempts blocked (MongoDB handles this)
- [ ] XSS attempts sanitized

## Performance Tests

### ✅ Response Times
- [ ] All endpoints respond in < 500ms
- [ ] Database queries optimized
- [ ] Pagination works correctly

### ✅ Concurrent Requests
- [ ] Multiple simultaneous requests handled
- [ ] No race conditions in bid acceptance
- [ ] Transaction isolation works

## Notes

- MongoDB connection must be configured with IP whitelist
- Test with both buyer and seller accounts
- Test edge cases (empty results, invalid IDs, etc.)
- Verify data consistency across related collections

