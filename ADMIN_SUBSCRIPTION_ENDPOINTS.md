# Admin Subscription Grant/Extension Endpoints & Cron Job Notification Audit

## Overview

This document describes the implementation of admin subscription management endpoints and the comprehensive audit and improvement of cron job notification consistency for the Presence Eye backend.

---

## Subscription Admin Endpoint

### 1. Grant Subscription Endpoint

**Endpoint:** `POST /api/subscriptions/admin/grant`

**Authorization:** Admin only (requires `verifyAdminAccess` middleware)

**Request Body:**
```json
{
  "userId": "string (required) - MongoDB ObjectId of the user",
  "planId": "string (required) - MongoDB ObjectId of the plan",
  "durationMonths": "number (required) - Subscription duration in months",
  "country": "string (optional) - User's country for pricing (default: 'RW')",
  "reason": "string (optional) - Reason for granting the subscription"
}
```

**Response (201 - Success):**
```json
{
  "message": "Subscription granted successfully",
  "code": "SUBSCRIPTION_GRANTED",
  "subscription": {
    "id": "string - Subscription ID",
    "plan": "string - Plan name",
    "startDate": "Date - Subscription start date",
    "endDate": "Date - Subscription end date",
    "durationMonths": "number - Duration in months",
    "status": "active",
    "limits": {
      "maxDevices": "number",
      "maxShares": "number",
      "maxSessions": "number"
    },
    "pricing": {
      "country": "string",
      "currency": "string",
      "pricePerMonth": "number",
      "totalPaid": "number"
    }
  }
}
```

**Error Responses:**
- `400` - Validation error (invalid IDs, missing fields, plan inactive, etc.)
- `403` - Insufficient permissions (non-admin user)
- `404` - User or plan not found
- `500` - Server error

**Example Usage:**
```bash
curl -X POST https://api.presence-eye.byose.info/api/subscriptions/admin/grant \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "planId": "507f1f77bcf86cd799439012",
    "durationMonths": 12,
    "country": "RW",
    "reason": "Complimentary annual subscription for enterprise customer"
  }'
```

---

### 2. Extend Subscription Endpoint

**Endpoint:** `POST /api/subscriptions/admin/extend`

**Authorization:** Admin only (requires `verifyAdminAccess` middleware)

**Request Body:**
```json
{
  "subscriptionId": "string (required) - MongoDB ObjectId of the subscription",
  "extendDays": "number (required) - Number of days to extend (1-3650)",
  "reason": "string (optional) - Reason for extension"
}
```

**Response (200 - Success):**
```json
{
  "message": "Subscription extended successfully",
  "code": "SUBSCRIPTION_EXTENDED",
  "subscription": {
    "id": "string - Subscription ID",
    "plan": "string - Plan name",
    "previousEndDate": "Date - Previous expiration date",
    "newEndDate": "Date - New expiration date",
    "extendDays": "number - Days extended",
    "status": "active"
  }
}
```

**Error Responses:**
- `400` - Validation error (invalid ID, invalid extendDays range)
- `403` - Insufficient permissions (non-admin user)
- `404` - Subscription not found
- `500` - Server error

**Example Usage:**
```bash
curl -X POST https://api.presence-eye.byose.info/api/subscriptions/admin/extend \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "507f1f77bcf86cd799439013",
    "extendDays": 30,
    "reason": "Service outage compensation"
  }'
```

---

## Subscription Grant Flow

### How It Works

1. **Validation Phase:**
   - Validates required fields (userId, planId, durationMonths)
   - Validates MongoDB ObjectId formats
   - Checks if user exists
   - Checks if plan exists and is active
   - Validates plan pricing availability for user's country

2. **Subscription Creation:**
   - Uses existing `SubscriptionService.createSubscription()` to maintain business logic consistency
   - Passes `ADMIN_GRANT_<timestamp>` as payment reference
   - Passes `admin_grant` as payment method
   - Immediately sets status to `active` (bypasses payment gateway)

3. **Business Rules Followed:**
   - Respects existing subscription conflict rules (prevents duplicate active subscriptions)
   - Follows plan duration constraints (minDurationMonths, maxDurationMonths)
   - Uses correct pricing for user's country
   - Stores pricing snapshot and limits at time of grant
   - Prevents granting inactive plans

4. **Notification Phase:**
   - Sends in-app notification via `sendNotificationToUser()`
   - Sends email notification via `sendEmail()` with type `SUBSCRIPTION_GRANTED`
   - Both notifications include plan details, dates, and reason
   - Email failures don't block the grant operation

5. **Response:**
   - Returns complete subscription details with populated plan
   - Includes all relevant metadata for audit trail

---

## Subscription Extension Flow

### How It Works

1. **Validation Phase:**
   - Validates required fields (subscriptionId, extendDays)
   - Validates MongoDB ObjectId format
   - Validates extendDays range (1-3650 days, approximately 10 years max)

2. **Subscription Lookup:**
   - Finds subscription by ID with populated plan and user
   - Stores previous expiration date for notification

3. **Extension Logic:**
   - Calculates new expiration date by adding extendDays to current endDate
   - Updates subscription.endDate
   - Reactivates expired/cancelled subscriptions (sets status to `active`)
   - Preserves all other subscription state (limits, pricing, etc.)

4. **Notification Phase:**
   - Sends in-app notification via `sendNotificationToUser()`
   - Sends email notification via `sendEmail()` with type `SUBSCRIPTION_EXTENDED`
   - Both notifications include previous date, new date, extension duration, and reason
   - Email failures don't block the extension operation

5. **Response:**
   - Returns subscription details with before/after dates
   - Includes extension metadata for audit trail

### Expiration Calculation Logic

```javascript
const newEndDate = new Date(subscription.endDate);
newEndDate.setDate(newEndDate.getDate() + extendDays);
```

- Extension is calculated from the current `endDate`, not from today
- This allows extending subscriptions that are already expired
- Day-based extension provides flexibility (7 days, 30 days, 90 days, custom)
- Maximum limit of 3650 days prevents accidental excessive extensions

---

## Cron Job Audit
ht for 1s
6 / 14 t
### Audit Summary

All cron jobs were audited for notification consistency. Previously, cron jobs only sent in-app notifications. Email notifications have been added to ensure users receive communication through all intended channels.

---

### 1. checkExpired.js

**Purpose:** Processes subscription expirations and grace period transitions

**Existing Behavior:**
- Calls `expireGracePeriodSubscriptions()` - Moves grace_period → expired
- Calls `moveActiveSubscriptionsToGracePeriod()` - Moves active → grace_period
- Calls `sendGracePeriodReminders()` - Sends reminders during grace period
- Only sent in-app notifications

**Improvements Made:**
- Added email notification for subscription expiration (`SUBSCRIPTION_EXPIRED`)
- Added email notification for grace period start (`GRACE_PERIOD_STARTED`)
- Added email notification for grace period reminders (`SUBSCRIPTION_EXPIRING_SOON`)

**Email Notifications Added:**

| Function | Email Type | Trigger |
|----------|------------|---------|
| `expireGracePeriodSubscriptions()` | `SUBSCRIPTION_EXPIRED` | When grace period ends and subscription expires |
| `moveActiveSubscriptionsToGracePeriod()` | `GRACE_PERIOD_STARTED` | When active subscription moves to grace period |
| `sendGracePeriodReminders()` | `SUBSCRIPTION_EXPIRING_SOON` | At 7, 3, and 1 days remaining in grace period |

---

### 2. checkPending.js

**Purpose:** Processes pending subscription payments via payment gateway

**Existing Behavior:**
- Calls `processPendingPayments()` - Checks payment status with Xentripay gateway
- Activates subscriptions on successful payment
- Marks subscriptions as failed on payment failure/timeout
- Only sent in-app notifications

**Improvements Made:**
- Added email notification for payment success (`PAYMENT_SUCCESS`)
- Added email notification for payment failure (`PAYMENT_FAILED`)

**Email Notifications Added:**

| Function | Email Type | Trigger |
|----------|------------|---------|
| `activateSubscription()` | `PAYMENT_SUCCESS` | When payment gateway confirms successful payment |
| `failSubscription()` | `PAYMENT_FAILED` | When payment fails, times out, or is declined |

---

### 3. sendReminders.js

**Purpose:** Sends pre-expiry reminders for active subscriptions

**Existing Behavior:**
- Calls `sendExpiryReminderForDays(7)` - 7 days before expiry
- Calls `sendExpiryReminderForDays(1)` - 1 day before expiry
- Only sent in-app notifications

**Improvements Made:**
- Added email notification for 7-day expiry reminder (`SUBSCRIPTION_EXPIRING_SOON`)
- Added email notification for 1-day expiry reminder (`SUBSCRIPTION_EXPIRING_SOON`)

**Email Notifications Added:**

| Function | Email Type | Trigger |
|----------|------------|---------|
| `sendExpiryReminderForDays(7)` | `SUBSCRIPTION_EXPIRING_SOON` | 7 days before subscription expires |
| `sendExpiryReminderForDays(1)` | `SUBSCRIPTION_EXPIRING_SOON` | 1 day before subscription expires |

---

## Notification Consistency

### Email Templates Added to Mailer.js

The following email types were added to `utils/Mailer.js`:

1. **SUBSCRIPTION_GRANTED** - Admin grant notification
2. **SUBSCRIPTION_EXTENDED** - Admin extension notification
3. **PAYMENT_SUCCESS** - Payment success confirmation
4. **PAYMENT_FAILED** - Payment failure notification
5. **SUBSCRIPTION_EXPIRING_SOON** - Expiry reminder (used for both pre-expiry and grace period reminders)
6. **SUBSCRIPTION_EXPIRED** - Subscription expiration notice
7. **GRACE_PERIOD_STARTED** - Grace period activation notice

All email templates:
- Follow the existing Presence Eye branding and design system
- Include relevant subscription details (plan name, dates, amounts)
- Include call-to-action buttons to dashboard or renewal page
- Handle errors gracefully (email failures don't block operations)

### Notification Channels

| Event | In-App | Email | Status |
|-------|--------|-------|--------|
| Admin Grant | ✅ | ✅ | Complete |
| Admin Extension | ✅ | ✅ | Complete |
| Payment Success | ✅ | ✅ | Complete |
| Payment Failure | ✅ | ✅ | Complete |
| Pre-Expiry Reminder (7 days) | ✅ | ✅ | Complete |
| Pre-Expiry Reminder (1 day) | ✅ | ✅ | Complete |
| Grace Period Start | ✅ | ✅ | Complete |
| Grace Period Reminder (7,3,1 days) | ✅ | ✅ | Complete |
| Subscription Expired | ✅ | ✅ | Complete |

---

## Testing Performed

### Scenarios Tested

#### 1. Admin Subscription Grant

**Test Case 1: Successful Grant**
- Input: Valid userId, planId, durationMonths
- Expected: Subscription created with status='active', notifications sent
- Result: ✅ Pass

**Test Case 2: Invalid User ID**
- Input: Invalid userId format
- Expected: 400 error with validation message
- Result: ✅ Pass

**Test Case 3: Inactive Plan**
- Input: planId for inactive plan
- Expected: 400 error with PLAN_INACTIVE code
- Result: ✅ Pass

**Test Case 4: Existing Active Subscription**
- Input: User with existing active subscription
- Expected: 400 error with ACTIVE_SUBSCRIPTION_EXISTS code
- Result: ✅ Pass

**Test Case 5: Plan Not Available in Country**
- Input: Country without pricing for selected plan
- Expected: 400 error with PLAN_NOT_AVAILABLE_IN_COUNTRY code
- Result: ✅ Pass

#### 2. Admin Subscription Extension

**Test Case 1: Successful Extension**
- Input: Valid subscriptionId, extendDays=30
- Expected: endDate extended by 30 days, notifications sent
- Result: ✅ Pass

**Test Case 2: Invalid Subscription ID**
- Input: Invalid subscriptionId format
- Expected: 400 error with validation message
- Result: ✅ Pass

**Test Case 3: Extend Expired Subscription**
- Input: subscriptionId for expired subscription
- Expected: Subscription reactivated and extended
- Result: ✅ Pass

**Test Case 4: Extend Days Out of Range**
- Input: extendDays=0 or extendDays=4000
- Expected: 400 error with validation message
- Result: ✅ Pass

#### 3. Notification Delivery

**Test Case 1: In-App Notification Sent**
- Action: Grant subscription
- Expected: Notification created in database
- Result: ✅ Pass

**Test Case 2: Email Notification Sent**
- Action: Grant subscription
- Expected: Email sent via SMTP
- Result: ✅ Pass

**Test Case 3: Email Failure Doesn't Block Operation**
- Action: Grant subscription with invalid email configuration
- Expected: Subscription granted despite email failure
- Result: ✅ Pass

#### 4. Cron Job Email Notifications

**Test Case 1: Payment Success Email**
- Action: Simulate successful payment in cron
- Expected: PAYMENT_SUCCESS email sent
- Result: ✅ Pass

**Test Case 2: Payment Failure Email**
- Action: Simulate failed payment in cron
- Expected: PAYMENT_FAILED email sent
- Result: ✅ Pass

**Test Case 3: Expiry Reminder Email**
- Action: Run sendReminders cron
- Expected: SUBSCRIPTION_EXPIRING_SOON email sent
- Result: ✅ Pass

**Test Case 4: Grace Period Email**
- Action: Run checkExpired cron
- Expected: GRACE_PERIOD_STARTED email sent
- Result: ✅ Pass

### Edge Cases Handled

1. **Concurrent Subscription Creation:** Service layer prevents duplicate active subscriptions
2. **Email Service Failures:** Email failures are caught and logged, don't block operations
3. **Invalid Date Calculations:** Extension uses robust date arithmetic
4. **Missing User Data:** Graceful handling of missing user email addresses
5. **Plan Pricing Changes:** Pricing snapshot stored at grant time
6. **Subscription Status Transitions:** Proper handling of all status transitions

---

## Security Considerations

### Authorization

- Both endpoints use `verifyAdminAccess` middleware
- Only users with `role: 'admin'` can access these endpoints
- Special users (`role: 'special'`) cannot access (read-only access only)
- JWT token validation ensures authenticated requests

### Input Validation

- All MongoDB ObjectId formats validated
- Duration ranges validated (1-3650 days for extension)
- Plan existence and active status validated
- User existence validated
- Country pricing availability validated

### Audit Trail

- Payment reference set to `ADMIN_GRANT_<timestamp>` for admin grants
- Payment method set to `admin_grant` for tracking
- All subscription changes include timestamps
- Notification failures logged for monitoring

---

## Files Modified

### New Endpoints
- `routes/admin/admin.subscriptions.route.js` - Added grant and extend endpoints

### Email Notifications
- `utils/Mailer.js` - Added 7 new email types for subscription events

### Cron Job Improvements
- `services/subscriptionCronService.js` - Added email notifications to all cron functions:
  - `activateSubscription()` - Payment success email
  - `failSubscription()` - Payment failure email
  - `expireGracePeriodSubscriptions()` - Expiration email
  - `moveActiveSubscriptionsToGracePeriod()` - Grace period start email
  - `sendGracePeriodReminders()` - Grace period reminder emails
  - `sendExpiryReminderForDays()` - Expiry reminder emails

---

## Deployment Notes

### Environment Variables Required

Ensure the following environment variables are configured:
- `MAILER` - SMTP email address
- `MAILER_PASSWORD` - SMTP password
- `JWT` - JWT secret for token verification
- `SERVER_URL` - Base URL for dashboard links in emails

### Cron Job Configuration

No changes to cron job scheduling are required. The existing cron endpoints remain:
- `/api/cron/check-expired` - Processes expirations
- `/api/cron/check-pending` - Processes pending payments
- `/api/cron/send-reminders` - Sends expiry reminders

### Database Changes

No database schema changes are required. All changes use existing models and indexes.

---

## Success Criteria

✅ Follows existing subscription architecture
✅ Avoids introducing duplicate subscription logic
✅ Uses existing services (SubscriptionService) wherever possible
✅ Maintains backward compatibility
✅ Delivers reliable notification and email behavior
✅ Requires no changes to unrelated systems
✅ Production-ready and fully documented
✅ All cron jobs now send both in-app and email notifications
✅ Email failures don't block critical operations
✅ Comprehensive audit trail for admin actions

---

## Support

For issues or questions related to these endpoints:
- Check server logs for detailed error messages
- Verify admin user role in database
- Confirm email service configuration
- Review cron job execution logs

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-18  
**Implementation Status:** Complete ✅
