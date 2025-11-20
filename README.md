# Indie Copilot

A full-stack AI-powered application with a Next.js frontend and Express backend.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Setup

1. Install dependencies for both frontend and backend:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

## Running the Application

You need to run both the frontend and backend servers:

### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will start on http://localhost:4000

### Start the Frontend Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:3000

## Environment Variables

The frontend requires the following environment variables, which are set in `frontend/.env`:

- `NEXT_PUBLIC_BACKEND_URL`: The URL of the backend server (default: http://localhost:4000)
- `NEXT_PUBLIC_WORKSPACE_ID`: The workspace ID (default: ws-demo)

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/v1/workspaces/:workspaceId/sessions` - List sessions
- `POST /api/v1/workspaces/:workspaceId/sessions` - Create a new session
- `GET /api/v1/sessions/:sessionId` - Get a specific session
- `GET /api/v1/workspaces/:workspaceId/agents` - List agents
- `GET /api/v1/workspaces/:workspaceId/tools` - List tools
- And more...

## Troubleshooting

If you encounter a "fetch failed" error:

1. Make sure the backend server is running on http://localhost:4000
2. Check that the frontend environment variables are correctly set in `frontend/.env`
3. Verify that there are no network or firewall issues blocking the connection
