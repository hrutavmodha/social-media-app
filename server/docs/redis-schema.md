# Redis Schema Documentation

This document describes the key patterns and data structures used in Redis for the social media application.

## Key Patterns

### 1. Refresh Tokens (Sessions)
- **Key Pattern:** `session:<token_hash>`
- **Value:** JSON object containing `user_id` and `expiry`.
- **Description:** Stores session information associated with a refresh token hash. Tokens are validated against this store.
- **Example:** `session:abc123hash` -> `{"user_id": "uuid-123", "expiry": "2026-03-28T12:00:00Z"}`

### 2. Online Presence
- **Key Pattern:** `presence:<user_id>`
- **Value:** Timestamp (integer or ISO string).
- **Description:** Tracks the last time a user was seen online.
- **Example:** `presence:uuid-123` -> `1740744000`

### 3. Unread Notification Count
- **Key Pattern:** `notif_count:<user_id>`
- **Value:** Integer.
- **Description:** Tracks the number of unread notifications for a specific user.
- **Example:** `notif_count:uuid-123` -> `5`
