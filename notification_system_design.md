# Notification System Design

## Stage 1 - REST API Design & Real-Time Mechanism

### Overview

The notification platform enables students to receive and manage notifications related to Placements, Events, and Results. The system supports fetching paginated notifications, filtering by type, viewing unread notifications, marking notifications as read, and receiving real-time updates via WebSockets.

---

### Base URL

```http
/api/v1
```

---

### 1.1 Get All Notifications (Paginated)

**Request**

```http
GET /notifications?page=1&limit=20&notification_type=Placement
```

| Query Param         | Type    | Required | Description                                  |
|---------------------|---------|----------|----------------------------------------------|
| page                | integer | No       | Page number (default: 1)                     |
| limit               | integer | No       | Items per page (default: 20)                 |
| notification_type   | string  | No       | Filter: "Placement", "Result", or "Event"    |

**Headers**

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <access_token>"
}
```

**Response (200)**

```json
{
  "success": true,
  "page": 1,
  "limit": 20,
  "total": 150,
  "data": [
    {
      "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
      "type": "Placement",
      "message": "Microsoft Hiring Drive",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:30Z"
    }
  ]
}
```

---

### 1.2 Get Unread Notifications

**Request**

```http
GET /notifications/unread
```

**Response (200)**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
      "type": "Placement",
      "message": "Microsoft Hiring Drive",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:30Z"
    }
  ]
}
```

---

### 1.3 Mark Single Notification as Read

**Request**

```http
PATCH /notifications/:id/read
```

**Response (200)**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 1.4 Mark All Notifications as Read

**Request**

```http
PATCH /notifications/read-all
```

**Response (200)**

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### 1.5 Create Notification (Admin/HR)

**Request**

```http
POST /notifications
```

**Body**

```json
{
  "type": "Placement",
  "message": "Amazon Hiring Drive",
  "targetStudentIds": ["all"]
}
```

**Response (201)**

```json
{
  "success": true,
  "notificationId": "n101",
  "message": "Notification created successfully"
}
```

---

### 1.6 Get Priority Inbox

**Request**

```http
GET /notifications/priority?limit=10
```

| Query Param | Type    | Required | Description                    |
|-------------|---------|----------|--------------------------------|
| limit       | integer | No       | Top N items (default: 10)      |

**Response (200)**

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "b283218f-ea5a-4b7c-93a9-1f2f240d64b0",
      "type": "Placement",
      "message": "CSX Corporation hiring",
      "priorityScore": 0.95,
      "createdAt": "2026-04-22T17:51:18Z"
    }
  ]
}
```

---

### 1.7 Real-Time Notification Mechanism

**Technology**: WebSockets (via Socket.IO or native WS)

**Connection**

```
ws://localhost:5000/ws/notifications
```

**Flow**

1. Student opens the application and the client establishes a WebSocket connection.
2. The server authenticates the connection using the Bearer token sent during the handshake.
3. When a new notification is created (e.g., HR clicks "Notify All"), the server pushes the notification payload to all connected clients.
4. The client receives the event and prepends the notification to the list without a page refresh.

**Event Structure**

```json
{
  "event": "NEW_NOTIFICATION",
  "data": {
    "id": "n101",
    "type": "Placement",
    "message": "Amazon Hiring Drive",
    "createdAt": "2026-04-22T18:00:00Z"
  }
}
```

**Why WebSockets over alternatives?**

| Approach        | Latency    | Server Load | Complexity |
|-----------------|------------|-------------|------------|
| Polling         | High       | High        | Low        |
| Long Polling    | Medium     | Medium      | Medium     |
| SSE             | Low        | Low         | Medium     |
| **WebSockets**  | **Lowest** | **Low**     | Medium     |

WebSockets provide full-duplex communication, making them ideal for real-time notification delivery where instant feedback matters. SSE is a viable alternative for unidirectional push, but WebSockets allow future extensibility (e.g., read receipts, typing indicators).

---

## Stage 2 - Database Schema & Storage

### Recommended Database: PostgreSQL

**Rationale**:
- Strong ACID compliance ensures notification delivery guarantees.
- Supports JSONB for flexible metadata storage (notification payloads may evolve).
- Excellent indexing support (B-tree, GIN, partial indexes) for query optimization.
- Robust support for full-text search if needed for notification filtering.
- Battle-tested at scale with partitioning, connection pooling, and replication.

---

### Schema Definition

```sql
CREATE TYPE notification_type AS ENUM ('Placement', 'Result', 'Event');

CREATE TABLE students (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    roll_no     VARCHAR(20) UNIQUE NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    notification_type notification_type NOT NULL,
    message           TEXT NOT NULL,
    is_read           BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_student_unread
    ON notifications (student_id, created_at DESC)
    WHERE is_read = FALSE;

CREATE INDEX idx_notifications_type
    ON notifications (notification_type);
```

---

### Queries Mapped to REST APIs

**GET /notifications (paginated, filtered)**

```sql
SELECT id, notification_type, message, is_read, created_at
FROM notifications
WHERE student_id = $1
  AND ($2::notification_type IS NULL OR notification_type = $2)
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;
```

**GET /notifications/unread**

```sql
SELECT id, notification_type, message, created_at
FROM notifications
WHERE student_id = $1 AND is_read = FALSE
ORDER BY created_at DESC;
```

**PATCH /notifications/:id/read**

```sql
UPDATE notifications SET is_read = TRUE WHERE id = $1 AND student_id = $2;
```

**PATCH /notifications/read-all**

```sql
UPDATE notifications SET is_read = TRUE WHERE student_id = $1 AND is_read = FALSE;
```

**POST /notifications**

```sql
INSERT INTO notifications (student_id, notification_type, message)
VALUES ($1, $2, $3)
RETURNING id;
```

---

### Scaling Challenges & Solutions

| Problem                        | Solution                                                    |
|--------------------------------|-------------------------------------------------------------|
| Table bloat at millions of rows| Partition by `created_at` (e.g., monthly range partitions)  |
| Slow read queries              | Composite & partial indexes (as defined above)              |
| High write throughput          | Batch inserts via COPY or multi-row INSERT                  |
| Connection exhaustion          | Connection pooling with PgBouncer                           |
| Global read latency            | Read replicas for geographically distributed students       |
| Old notification retrieval     | Archive old notifications to cold storage (S3 + Athena)     |

---

## Stage 3 - Query Analysis & Optimization

### Original Query

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

### Is this query accurate?

The query is functionally correct in intent — it retrieves all unread notifications for a given student sorted by creation time. However, sorting by `createdAt ASC` shows oldest first, which is typically not what users expect. `DESC` (newest first) would be more appropriate for a notification feed.

### Why is it slow?

With 50,000 students and 5,000,000 notifications, this query suffers from:

1. **Full table scan**: Without proper indexes, PostgreSQL scans all 5 million rows to filter by `studentID` and `isRead`.
2. **`SELECT *`**: Fetches all columns including potentially large `message` fields, increasing I/O and memory usage when only a subset may be needed.
3. **Sort operation**: Sorting without an index-backed order requires an in-memory or on-disk filesort, which is expensive at this volume.
4. **No pagination**: Returns all matching rows. A student with thousands of unread notifications would generate a massive result set.

### Recommended Improvements

```sql
SELECT id, notification_type, message, created_at
FROM notifications
WHERE student_id = 1042 AND is_read = FALSE
ORDER BY created_at DESC
LIMIT 50 OFFSET 0;
```

**Supporting Index**:

```sql
CREATE INDEX idx_student_unread_notifications
    ON notifications (student_id, created_at DESC)
    WHERE is_read = FALSE;
```

This is a **partial composite index** — it only indexes rows where `is_read = FALSE`, keeping the index small and fast. The computation cost drops from O(N) full scan to O(log N) index seek + O(K) for K returned rows.

### Should we add indexes on every column?

No. This is counterproductive because:

- Each index consumes disk space proportional to the table size.
- Every INSERT, UPDATE, and DELETE must update all indexes, degrading write performance significantly.
- The query planner may become confused with too many index choices, leading to suboptimal plans.
- Indexes on low-cardinality columns (e.g., `is_read` with only TRUE/FALSE) provide minimal selectivity as standalone indexes.

The correct strategy is to create **targeted composite and partial indexes** based on actual query patterns.

### Placement notifications in the last 7 days

```sql
SELECT DISTINCT s.id, s.name, s.email, s.roll_no
FROM students s
INNER JOIN notifications n ON s.id = n.student_id
WHERE n.notification_type = 'Placement'
  AND n.created_at >= NOW() - INTERVAL '7 days';
```

---

## Stage 4 - Caching & Performance Strategy

### Problem

Notifications are fetched on every page load for every student, overwhelming the database and causing poor user experience.

### Solution 1: Application-Level Caching (Redis)

Cache each student's notification feed in Redis with a TTL (Time-To-Live).

```
Key:   notifications:student:{studentId}:unread
Value: JSON array of unread notifications
TTL:   60 seconds
```

**Flow**:
1. On page load, check Redis for cached notifications.
2. If cache hit → return cached data (sub-millisecond response).
3. If cache miss → query PostgreSQL, populate Redis, return data.
4. On new notification → invalidate the affected student's cache key.

| Tradeoff       | Detail                                                         |
|----------------|----------------------------------------------------------------|
| Pros           | Drastically reduces DB load; sub-ms reads from Redis           |
| Cons           | Slight staleness (up to TTL duration); additional infra (Redis)|
| Mitigation     | Use cache invalidation on writes to minimize staleness         |

### Solution 2: HTTP-Level Caching (ETag / Last-Modified)

Return `ETag` headers with notification responses. On subsequent requests, the client sends `If-None-Match`. If nothing changed, the server responds with `304 Not Modified` (no body).

| Tradeoff       | Detail                                                         |
|----------------|----------------------------------------------------------------|
| Pros           | Reduces bandwidth; no extra infra needed                       |
| Cons           | Still hits the server for validation; less effective at scale   |

### Solution 3: Client-Side State + WebSocket Push

Instead of re-fetching on every page load, maintain notification state on the client and update it only when new notifications arrive via WebSocket.

| Tradeoff       | Detail                                                         |
|----------------|----------------------------------------------------------------|
| Pros           | Zero unnecessary API calls; instant updates                    |
| Cons           | Client state can drift if WebSocket disconnects; needs reconnect logic |
| Mitigation     | Periodic background sync every 5 minutes as a fallback         |

### Recommended Architecture

Combine all three strategies in layers:

1. **WebSocket** for real-time push (primary channel).
2. **Redis cache** for API fallback when WebSocket is unavailable.
3. **ETag headers** for bandwidth optimization on repeated fetches.

---

## Stage 5 - Bulk Notification System Redesign

### Original Pseudocode Analysis

```
function notify_all(student_ids, message):
   for student_id in student_ids:
       send_email(student_id, message)
       save_to_db(student_id, message)
       push_to_app(student_id, message)
```

### Shortcomings

1. **Sequential processing**: 50,000 students processed one at a time. If each email takes 200ms, the total time is ~2.8 hours.
2. **No fault tolerance**: If `send_email` fails for student #25,000, the remaining 25,000 students are never processed.
3. **No retry mechanism**: The 200 failed emails are permanently lost.
4. **Tight coupling**: Email, DB, and push are coupled in a single loop. A slow email API blocks DB writes.
5. **No idempotency**: If the function crashes and restarts, students may receive duplicate notifications.
6. **Single point of failure**: If the process crashes, there is no record of progress.

### What about the 200 failed emails?

Since there is no tracking of which students succeeded or failed, the only options are:

- Re-run the entire batch (causing duplicates for 49,800 students), or
- Manually investigate logs to identify the 200 students (time-consuming and error-prone).

Neither option is acceptable in production.

### Should DB save and email happen together?

No. They should be decoupled because:

- **Email is an external dependency** with unpredictable latency and failure rates.
- **DB writes are fast and reliable** in comparison.
- If they are coupled, a failed email would prevent the notification from being stored, and the student would have no record of it.
- Save to DB first (source of truth), then dispatch email asynchronously.

### Revised Design

```
function notify_all(student_ids, message):
    notification_id = generate_unique_id()

    batch_insert_to_db(student_ids, message, notification_id)

    for student_id in student_ids:
        enqueue_to_message_queue("email_queue", {
            student_id: student_id,
            message: message,
            notification_id: notification_id,
            attempt: 1
        })

        enqueue_to_message_queue("push_queue", {
            student_id: student_id,
            message: message,
            notification_id: notification_id
        })

function email_worker(job):
    try:
        send_email(job.student_id, job.message)
        mark_email_sent(job.notification_id, job.student_id)
    catch error:
        if job.attempt < MAX_RETRIES:
            enqueue_with_delay("email_queue", {
                ...job,
                attempt: job.attempt + 1
            }, exponential_backoff(job.attempt))
        else:
            move_to_dead_letter_queue(job)
            log_permanent_failure(job)

function push_worker(job):
    try:
        push_to_app(job.student_id, job.message)
    catch error:
        log_push_failure(job)
```

### Key Improvements

| Aspect            | Original                  | Redesigned                                    |
|-------------------|---------------------------|-----------------------------------------------|
| Processing        | Sequential                | Parallel via message queues (RabbitMQ/SQS)    |
| Fault tolerance   | None                      | Retry with exponential backoff + DLQ          |
| DB + Email        | Coupled                   | Decoupled (DB first, then async dispatch)     |
| Idempotency       | None                      | Unique notification_id prevents duplicates    |
| Observability     | None                      | Status tracking per student per notification  |
| Throughput        | ~18 students/sec          | 1000+ students/sec with concurrent workers    |

---

## Stage 6 - Priority Inbox Algorithm

### Approach

The priority inbox ranks unread notifications using a composite scoring function that combines **type weight** and **recency**.

### Scoring Formula

```
priority_score = (type_weight * W_TYPE) + (recency_score * W_RECENCY)
```

Where:
- `type_weight`: Placement = 3, Result = 2, Event = 1
- `recency_score`: Normalized timestamp value (newer = higher score)
- `W_TYPE = 0.6`, `W_RECENCY = 0.4` (type is weighted more heavily than recency)

### Data Structure

A **min-heap** of size N is used to efficiently maintain the top N priority notifications:

1. Fetch all notifications from the API.
2. Calculate the priority score for each notification.
3. Insert into a min-heap of size N.
4. If heap size exceeds N, remove the minimum element.
5. After processing all notifications, extract the heap in descending order.

### Complexity

| Operation                    | Cost       |
|------------------------------|------------|
| Initial build (N items)      | O(N log K) |
| Insert new notification      | O(log K)   |
| Extract top K                | O(K log K) |

Where K = top N limit (e.g., 10) and N = total notifications. This is optimal because we never sort the entire dataset — only maintain a small heap.

### Handling Incoming Notifications

When a new notification arrives (via WebSocket or polling):

1. Calculate its priority score.
2. Compare with the minimum element in the heap.
3. If the new score is higher, replace the minimum and re-heapify (O(log K)).
4. If lower, discard it from the priority inbox.

This ensures the top-N is always maintained in O(log K) per incoming notification, without re-sorting the entire list.

### Implementation

The implementation is located in `notification_app_be/priorityInbox.js`. It fetches notifications from the evaluation API, applies the scoring formula, sorts by priority, and exposes the top N via a REST endpoint at `GET /api/priority-inbox`.
