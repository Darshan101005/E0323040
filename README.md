# Campus Notification Platform

A full-stack notification system where students receive real-time updates regarding Placements, Events, and Results.

## Project Structure

```
├── logging_middleware/      Reusable logging package (Node.js)
├── notification_app_be/     Backend API with priority inbox (Express)
├── notification_app_fe/     Frontend application (React + Vite + Material UI)
├── notification_system_design.md   System design document (Stages 1–6)
└── .gitignore
```

## Setup & Run

### Logging Middleware

```bash
cd logging_middleware
npm install
```

The middleware exports a `Log(stack, level, package, message)` function that sends structured logs to the evaluation server.

### Backend

```bash
cd notification_app_be
npm install
node priorityInbox.js
```

Runs on `http://localhost:5000`. Provides the priority inbox endpoint at `GET /api/priority-inbox`.

### Frontend

```bash
cd notification_app_fe
npm install
npm run dev
```

Runs on `http://localhost:3000`. Requires the backend to be running for the priority inbox page.

## Features

- Paginated notification feed with type-based filtering
- Priority inbox displaying top N notifications ranked by type weight and recency
- New vs viewed notification distinction using local storage
- Dark and light theme toggle
- Responsive layout for desktop and mobile
- Integrated logging middleware across all components

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 19, Vite, Material UI 9      |
| Backend   | Node.js, Express 5                  |
| Logging   | Custom middleware → Evaluation API  |
| Styling   | Material UI + Custom MUI Theme      |
