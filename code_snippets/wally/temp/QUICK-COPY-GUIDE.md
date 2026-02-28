# Quick Copy Guide

## Folders to Create

Run these commands in your project root:

```bash
cd src
mkdir -p api components contexts hooks pages/Login styles types utils
```

## File Mapping (Copy from outputs to your project)

| Output File | Destination in Your Project |
|-------------|----------------------------|
| auth.types.ts | src/types/auth.types.ts |
| config.ts | src/api/config.ts |
| storage.ts | src/utils/storage.ts |
| client.ts | src/api/client.ts |
| auth.service.ts | src/api/auth.service.ts |
| AuthContext.tsx | src/contexts/AuthContext.tsx |
| useAuth.ts | src/hooks/useAuth.ts |
| Login.tsx | src/pages/Login.tsx |
| Login.css | src/styles/Login.css |
| Dashboard.tsx | src/pages/Dashboard.tsx |
| ProtectedRoute.tsx | src/components/ProtectedRoute.tsx |
| App.tsx | src/App.tsx |
| main.tsx | src/main.tsx |
| globals.css | src/styles/globals.css |
| .env | .env (project root) |

## Important: Fix the Bug!

In `src/utils/storage.ts` line 18, change:
```typescript
return localStorage.setItem(API_CONFIG.STORAGE_KEYS.EXPIRES_AT);
```
to:
```typescript
return localStorage.getItem(API_CONFIG.STORAGE_KEYS.EXPIRES_AT);
```

## Quick Test

1. Copy all files
2. Fix the bug above
3. Add logo to `public/winstantpay-logo.png`
4. Update `.env` with your API URL
5. Run `npm run dev`
6. Go to http://localhost:5173
7. You should see the login page!
