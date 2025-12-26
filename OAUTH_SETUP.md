# GitHub OAuth Authentication Setup

## Quick Start

To run the application with GitHub OAuth:

### 1. Start the Backend Server (Terminal 1)
```bash
npm run dev:server
```

### 2. Start the Frontend (Terminal 2)
```bash
npm run dev
```

### 3. Access the Application
Open your browser to: http://localhost:8080

## Environment Variables

### Frontend (.env)
```
VITE_GITHUB_CLIENT_ID=Iv23liPsiwK9ZtFne8Hv
VITE_BACKEND_URL=http://localhost:3001
```

### Backend (server/.env)
```
GITHUB_CLIENT_ID=Iv23liPsiwK9ZtFne8Hv
GITHUB_CLIENT_SECRET=3d11452ad3c8edc05e380048f2e27af0dae0f7ad
PORT=3001
```

## OAuth Flow

1. User clicks "Continue with GitHub" on login page
2. User is redirected to GitHub authorization page
3. User authorizes the application
4. GitHub redirects to backend callback: `http://localhost:3001/auth/github/callback`
5. Backend exchanges code for access token
6. Backend fetches user data from GitHub API
7. Backend redirects to frontend: `http://localhost:8080/auth/callback?user={userData}`
8. Frontend stores user data and redirects to dashboard/onboarding

## Troubleshooting

- **Port already in use**: Make sure ports 3001 and 8080 are available
- **OAuth fails**: Verify your GitHub OAuth App settings match the callback URL
- **CORS errors**: Ensure backend is running on port 3001
