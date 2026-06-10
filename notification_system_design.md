# Stage 1 - Notification System Design

## Overview

The notification platform allows students to receive and manage notifications related to:

* Placements
* Events
* Results

The system supports fetching notifications, viewing unread notifications, marking notifications as read, and receiving real-time updates.

---

## Base URL

```http
/api/v1
```

---

## 1. Get All Notifications

### Request

```http
GET /notifications?page=1&limit=20
```

### Headers

```json
{
  "Content-Type": "application/json"
}
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "n001",
      "type": "Placement",
      "message": "Microsoft Hiring Drive",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:30Z"
    }
  ]
}
```

---

## 2. Get Unread Notifications

### Request

```http
GET /notifications/unread
```

### Response

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "n001",
      "type": "Placement",
      "message": "Microsoft Hiring Drive",
      "isRead": false
    }
  ]
}
```

---

## 3. Mark Notification as Read

### Request

```http
PATCH /notifications/{id}/read
```

### Response

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 4. Mark All Notifications as Read

### Request

```http
PATCH /notifications/read-all
```

### Response

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 5. Create Notification (Admin/HR)

### Request

```http
POST /notifications
```

### Body

```json
{
  "type": "Placement",
  "message": "Amazon Hiring Drive"
}
```

### Response

```json
{
  "success": true,
  "message": "Notification created successfully"
}
```

---

## Real-Time Notification Mechanism

### Technology

WebSockets

### Flow

1. Student opens the application.
2. Client establishes a WebSocket connection.
3. When a new notification is created, the server pushes the notification instantly.
4. Notification appears without page refresh.

### Sample Event

```json
{
  "event": "NEW_NOTIFICATION",
  "data": {
    "id": "n101",
    "type": "Placement",
    "message": "Amazon Hiring Drive"
  }
}
```

## Benefits

* Instant delivery
* Reduced API polling
* Better user experience
* Lower server load

```
```
