# Azure B2C OAuth 2.0 Integration Guide

## Overview

This application now includes full Azure B2C OAuth 2.0 authentication using the Authorization Code grant flow. The integration provides:

- Secure OAuth authentication flow
- Automatic token management with refresh capability
- Protected routes requiring authentication
- Type-safe authentication context
- Authenticated API calls with automatic Bearer token injection

## Architecture

### Files Created

1. **client/services/oauth.ts**
   - OAuth service utilities
   - Functions: `getAuthorizationUrl()`, `exchangeCodeForToken()`, `refreshAccessToken()`
   - URL parameter extraction helpers

2. **client/contexts/AuthContext.tsx**
   - React Context for authentication state
   - `AuthProvider` component
   - `useAuth()` hook for consuming auth state
   - Manages user, tokens, and authentication status

3. **server/routes/auth.ts**
   - Express route handlers for token exchange
   - `POST /api/auth/exchange-token` - Exchange auth code for tokens
   - `POST /api/auth/refresh-token` - Refresh expired access tokens
   - **Important**: Client Secret is kept safe on server-side only

4. **client/pages/AuthCallback.tsx**
   - Handles OAuth redirect after user authentication
   - Exchanges authorization code for access token
   - Stores tokens and user info in localStorage
   - Shows loading state during processing
   - Redirects to dashboard on success

5. **client/components/AuthButtons.tsx**
   - Login/Logout button component
   - Shows user email when authenticated
   - Displays loading state during auth

6. **client/components/ProtectedRoute.tsx**
   - Wrapper component for authentication-required pages
   - Automatically redirects unauthenticated users to home

7. **client/hooks/useAuthenticatedFetch.ts**
   - Custom hook for making authenticated API calls
   - Automatically includes Bearer token in Authorization header
   - Handles token refresh on 401 responses
   - Automatic retry logic

## Configuration

### Environment Variables

The following environment variables are configured:

**Frontend (Vite)**:
```
VITE_OAUTH_CLIENT_ID=1dc49cf1-aa12-4bfb-bf9e-60ff6df8475e
VITE_OAUTH_AUTH_URL=https://ecab2cdev.b2clogin.com/20204571-3776-41c1-8358-b82ae0114e6e/b2c_1a_rg_dev_susi/oauth2/v2.0/authorize
VITE_OAUTH_TOKEN_URL=https://ecab2cdev.b2clogin.com/20204571-3776-41c1-8358-b82ae0114e6e/b2c_1a_rg_dev_susi/oauth2/v2.0/token
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_OAUTH_SCOPE=openid offline_access
```

**Backend (Node.js)**:
```
OAUTH_CLIENT_SECRET=<your-client-secret>
```

## Usage

### 1. Add AuthProvider to App

The AuthProvider is already wrapped in `client/App.tsx`. It provides authentication context to all child components.

### 2. Use Authentication in Components

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={login}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Add AuthButtons to Header

```typescript
import AuthButtons from "@/components/AuthButtons";

export default function Header() {
  return (
    <header>
      {/* ... other header content ... */}
      <AuthButtons />
    </header>
  );
}
```

### 4. Protect Routes

```typescript
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";

// Usage in Routes:
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### 5. Make Authenticated API Calls

```typescript
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";

function MyComponent() {
  const authenticatedFetch = useAuthenticatedFetch();

  const fetchData = async () => {
    const response = await authenticatedFetch("/api/my-endpoint");
    const data = await response.json();
    // Use data...
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

## OAuth Flow

1. **User clicks Login**
   - Button calls `login()` from `useAuth`
   - Redirects to Azure B2C authorization URL

2. **User Authenticates with Azure B2C**
   - User logs in with their credentials
   - Azure B2C validates and generates authorization code

3. **Redirect to Callback**
   - Azure B2C redirects to `/auth/callback` with authorization code

4. **Token Exchange**
   - AuthCallback component extracts code from URL
   - Calls `/api/auth/exchange-token` endpoint
   - Server securely exchanges code for access token using Client Secret
   - Tokens stored in localStorage

5. **User Authenticated**
   - AuthContext is updated with user info and tokens
   - User redirected to dashboard
   - Components can now use `useAuth()` to access authenticated state

## Security Considerations

### ✅ Best Practices Implemented

1. **Client Secret Never in Frontend**
   - Client Secret stored in server environment variables only
   - Token exchange happens server-to-server

2. **Secure Token Storage**
   - Tokens stored in localStorage
   - Can be upgraded to httpOnly cookies for additional security

3. **Token Refresh**
   - Automatic token refresh when access token expires
   - Prevents unauthorized access due to expired tokens

4. **Type Safety**
   - Full TypeScript support
   - Type-safe authentication context

### ⚠️ Security Recommendations

1. **Regenerate Client Secret**
   - You shared the Client Secret in plain text
   - Generate a new secret in Azure B2C dashboard
   - Update the environment variable

2. **Use HTTPS in Production**
   - OAuth should only work over HTTPS
   - Configure proper redirect URIs for production domain

3. **Secure Storage**
   - Consider using httpOnly cookies instead of localStorage
   - Cookies are protected from XSS attacks

4. **PKCE for SPA**
   - Consider implementing PKCE (Proof Key for Code Exchange)
   - Adds extra layer of security for public clients

5. **Token Expiration**
   - Monitor token expiration times
   - Implement proper refresh logic
   - Handle token refresh failures gracefully

## Token Management

### Access Token
- Stored in localStorage
- Included in Authorization header for API requests
- Automatically refreshed when expired

### Refresh Token
- Stored in localStorage
- Used to obtain new access token
- Can be revoked for logout

### Token Expiration
- Stored as timestamp in localStorage
- Check before making API calls
- Automatic refresh on 401 responses

## Troubleshooting

### Issue: Blank Page on Callback

**Cause**: Missing redirect URI in Azure B2C app configuration

**Solution**:
1. Go to Azure B2C app settings
2. Add redirect URI: `http://localhost:5173/auth/callback`
3. Restart dev server

### Issue: "Unauthorized" Errors on API Calls

**Cause**: Access token expired or not included in request

**Solution**:
1. Check token in localStorage: `localStorage.getItem('accessToken')`
2. Verify token refresh is working
3. Use `useAuthenticatedFetch` hook for automatic token handling

### Issue: CORS Errors

**Cause**: Browser blocking requests to Azure B2C

**Solution**:
1. CORS is handled by Azure B2C
2. Check browser console for specific error
3. Verify request URLs are correct

## Next Steps

1. **Fetch User Information**
   - Update AuthCallback to fetch user profile from Azure B2C or your API
   - Store user details (name, email, picture, etc.)

2. **Integrate with API**
   - Update all API endpoints to use `useAuthenticatedFetch`
   - Add authorization checks on backend routes

3. **Handle Token Refresh Failures**
   - Add logic to log user out if refresh fails
   - Show error messages to user

4. **Production Deployment**
   - Update redirect URIs to production domain
   - Use environment variables for production URLs
   - Implement PKCE for additional security
   - Use httpOnly cookies for token storage

## Reference

- [Azure B2C Documentation](https://learn.microsoft.com/en-us/azure/active-directory-b2c/)
- [OAuth 2.0 Authorization Code Flow](https://tools.ietf.org/html/rfc6749#section-1.3.1)
- [React Context Documentation](https://react.dev/reference/react/useContext)
