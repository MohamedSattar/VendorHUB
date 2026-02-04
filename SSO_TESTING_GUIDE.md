# SSO (Single Sign-On) Testing Guide

## Overview

This guide covers how to test your Azure B2C OAuth 2.0 integration with your application.

## Prerequisites

Before testing, ensure you have:

1. ✅ Azure B2C tenant configured
2. ✅ Application registered in Azure B2C
3. ✅ OAuth credentials (Client ID, Client Secret)
4. ✅ User flows configured (Sign-up/Sign-in)
5. ✅ Test user accounts created in Azure B2C
6. ✅ Environment variables set in your app:
   - `VITE_OAUTH_CLIENT_ID`
   - `VITE_OAUTH_AUTH_URL`
   - `VITE_OAUTH_TOKEN_URL`
   - `VITE_OAUTH_REDIRECT_URI`
   - `VITE_OAUTH_SCOPE`
   - `OAUTH_CLIENT_SECRET` (server-side)

---

## Phase 1: Local Development Testing

### Step 1: Start the Development Server

```bash
pnpm dev
```

The app should be running at `http://localhost:8080` (or the port shown in terminal).

**Expected Output:**
```
➜  Local:   http://localhost:8080/
```

### Step 2: Verify Azure B2C Configuration

Before testing OAuth flow, verify your environment variables are correct:

1. **Check Frontend Variables** (These are visible in browser dev tools - that's OK):
   ```bash
   # Open browser console and check:
   console.log(import.meta.env.VITE_OAUTH_CLIENT_ID)
   console.log(import.meta.env.VITE_OAUTH_AUTH_URL)
   ```

2. **Check Backend Variables**:
   - Open `server/routes/auth.ts`
   - Add temporary logging to verify environment is loaded:
   ```typescript
   console.log("OAuth Config:", {
     clientId: process.env.VITE_OAUTH_CLIENT_ID,
     tokenUrl: process.env.VITE_OAUTH_TOKEN_URL,
   });
   ```

### Step 3: Test the OAuth Flow

#### Test 1: Landing Page

1. Open http://localhost:8080 in browser
2. **Expected**: You should see the landing page with:
   - ECA Vendor Hub logo in header
   - "Login" button in top-right corner
   - Language toggle (العربية)

#### Test 2: Click Login Button

1. Click the blue **"Login"** button in the header
2. **Expected**: 
   - You'll be redirected to Azure B2C login page
   - URL will change to Azure B2C domain:
   ```
   https://ecab2cdev.b2clogin.com/20204571-3776-41c1-8358-b82ae0114e6e/b2c_1a_rg_dev_susi/oauth2/v2.0/authorize?...
   ```

3. **If this doesn't happen**:
   - Check browser console for errors (F12)
   - Verify `VITE_OAUTH_CLIENT_ID` is set correctly
   - Verify `VITE_OAUTH_AUTH_URL` is correct

#### Test 3: Log In with Test User

1. On Azure B2C login page:
   - Click "Sign up now" to create a test account, OR
   - Use existing test account if you have one
   
2. **If you see "Invalid client error"**:
   - Your `Client ID` is incorrect
   - Check Azure B2C app registration settings

3. **If you see "The redirect_uri value does not match a redirect uri configured in the application"**:
   - Your `VITE_OAUTH_REDIRECT_URI` doesn't match Azure B2C settings
   - Go to Azure Portal → Azure B2C → App registrations
   - Select your app → Authentication
   - Add/verify Redirect URI: `http://localhost:8080/auth/callback`

#### Test 4: OAuth Callback

1. After successful login at Azure B2C, you'll be redirected to:
   ```
   http://localhost:8080/auth/callback?code=...&state=...
   ```

2. **Expected**:
   - Loading spinner shows "Signing you in..."
   - This page exchanges the authorization code for access token

3. **If stuck on callback page**:
   - Check browser console (F12) for errors
   - Open Network tab to see if `/api/auth/exchange-token` request succeeds
   - Verify server-side `OAUTH_CLIENT_SECRET` is correct

#### Test 5: Dashboard Access

1. After callback completes, you should be redirected to `/dashboard`

2. **Expected**:
   - User email appears in header (e.g., "user@example.com")
   - "Logout" button appears instead of "Login"
   - Dashboard content loads without "unauthorized" errors

3. **If redirected back to home**:
   - User might not be authenticated
   - Check localStorage: `localStorage.getItem('accessToken')`
   - Should not be empty

### Step 4: Test Protected Routes

Protected routes require authentication:
- `/dashboard`
- `/contracts`
- `/engagements`
- `/resources`
- `/add-resource`
- `/profile`

**Test:**
1. While logged in, navigate to `/dashboard`
   - **Expected**: Dashboard loads successfully
   
2. Log out by clicking "Logout" button
   - **Expected**: User info cleared from localStorage
   
3. Try to access `/dashboard` directly
   - **Expected**: Redirected to home page
   - This confirms `ProtectedRoute` is working

### Step 5: Test Authenticated API Calls

#### Using Browser DevTools

1. Open DevTools (F12) → Network tab
2. Make an authenticated API call
3. Check the request headers:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Test Endpoints

**Test User Profile Endpoint:**
```javascript
// In browser console after login:
const token = localStorage.getItem('accessToken');

fetch('/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('User Profile:', data))
.catch(err => console.error('Error:', err));
```

**Expected Output:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "vendor",
  "organization": "Example Company"
}
```

**Test User Resources Endpoint:**
```javascript
const token = localStorage.getItem('accessToken');

fetch('/api/user/resources', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('User Resources:', data))
.catch(err => console.error('Error:', err));
```

### Step 6: Test Logout

1. Click "Logout" button in header
2. **Expected**:
   - User email removed from header
   - "Login" button reappears
   - localStorage cleared:
     ```javascript
     localStorage.getItem('accessToken') // null
     localStorage.getItem('user') // null
     ```

3. Try to access protected route (e.g., `/dashboard`)
   - **Expected**: Redirected to home

---

## Phase 2: Token and Expiration Testing

### Test Token Refresh

Azure B2C tokens expire. Test automatic refresh:

1. Make a call to an authenticated endpoint:
   ```javascript
   const token = localStorage.getItem('accessToken');
   console.log('Token:', token.substring(0, 50) + '...');
   ```

2. Wait for token to expire (depends on your Azure B2C settings, usually 1 hour)

3. Make another authenticated API call
   - **Expected**: `useAuthenticatedFetch` automatically refreshes token
   - No 401 error should occur

4. Verify new token in localStorage:
   ```javascript
   const newToken = localStorage.getItem('accessToken');
   console.log('New Token:', newToken.substring(0, 50) + '...');
   ```

### Test Token Expiration Handling

To test what happens when refresh fails:

1. **Simulate expired refresh token**:
   ```javascript
   // In console:
   localStorage.setItem('refreshToken', 'invalid_token');
   ```

2. Make an authenticated API call
   - **Expected**: 
     - Request fails with 401
     - User is logged out
     - Redirected to home page

---

## Phase 3: Error Scenario Testing

### Test 1: Invalid Credentials

1. Go to Azure B2C login page
2. Enter wrong email/password
3. **Expected**: "Invalid username or password" error

### Test 2: Missing Redirect URI

1. Modify `VITE_OAUTH_REDIRECT_URI` to invalid value
2. Click Login
3. After Azure B2C login, **Expected**: Error about redirect URI mismatch

### Test 3: Invalid Client ID

1. Set `VITE_OAUTH_CLIENT_ID` to fake value
2. Click Login
3. **Expected**: Azure B2C shows "Invalid client error"

### Test 4: Invalid Client Secret

1. Change `OAUTH_CLIENT_SECRET` to wrong value
2. Click Login and log in at Azure B2C
3. At `/auth/callback`, **Expected**: Token exchange fails
   - Error message: "Failed to complete authentication"

### Test 5: Network Error

1. Disconnect from internet
2. Try to make authenticated API call
3. **Expected**: Network error in console, graceful error handling

### Test 6: 401 Unauthorized

1. Manually delete access token:
   ```javascript
   localStorage.removeItem('accessToken');
   ```

2. Try to access protected route
   - **Expected**: Redirected to home (ProtectedRoute protection)

3. Try to make API call without token
   - **Expected**: 401 error from server

---

## Phase 4: Browser DevTools Testing

### Check LocalStorage

After login, verify tokens are stored:

```javascript
// Console commands:
localStorage.getItem('accessToken')      // Should have JWT token
localStorage.getItem('refreshToken')     // Should have refresh token
localStorage.getItem('user')             // Should have user object
localStorage.getItem('tokenExpiresAt')   // Should have timestamp
```

### Check Network Requests

1. Open DevTools → Network tab
2. Click Login
3. You should see requests to:
   - `authorize` endpoint (redirects to Azure B2C)
   - `/api/auth/exchange-token` (POST after login)
   - `/api/auth/user-info` (POST to fetch user details)

### Check Application State

1. Open DevTools → Application tab
2. Go to LocalStorage
3. Select `http://localhost:8080`
4. Verify:
   - `accessToken` is populated
   - `user` contains user object
   - `language` may be "en" or "ar"

---

## Phase 5: Production Testing

### Before Deploying to Production:

1. **Update Redirect URI**
   - Change from `http://localhost:5173/auth/callback`
   - To: `https://yourdomain.com/auth/callback`
   - Update in both app environment variables AND Azure B2C settings

2. **Use HTTPS Only**
   - OAuth must only work over HTTPS in production
   - Ensure your domain has valid SSL certificate

3. **Update Client Secret**
   - You shared your secret in plain text
   - Regenerate in Azure B2C before production
   - Update server environment variable

4. **Test with Production Tenant**
   - Don't use dev tenant in production
   - Create separate Azure B2C tenant for production

5. **Test User Flows**
   - Test sign-up flow
   - Test sign-in flow
   - Test password reset
   - Test MFA (if configured)

### Production Deployment Checklist

- [ ] Update `VITE_OAUTH_REDIRECT_URI` to production domain
- [ ] Update `VITE_OAUTH_AUTH_URL` to production tenant (if different)
- [ ] Update `VITE_OAUTH_TOKEN_URL` to production tenant (if different)
- [ ] Regenerate and update `OAUTH_CLIENT_SECRET`
- [ ] Test login on production domain
- [ ] Test protected routes on production
- [ ] Test token refresh on production
- [ ] Set up monitoring and logging
- [ ] Test logout and session cleanup
- [ ] Test with multiple users simultaneously

---

## Debugging Tools and Techniques

### 1. Browser Console Logging

Enable detailed logging in auth:

**client/contexts/AuthContext.tsx:**
```typescript
useEffect(() => {
  console.log('[Auth] State updated:', { user, isAuthenticated, accessToken: !!accessToken });
}, [user, isAuthenticated, accessToken]);
```

**client/pages/AuthCallback.tsx:**
```typescript
console.log('[AuthCallback] Code:', code);
console.log('[AuthCallback] User Info:', userInfo);
```

### 2. Network Tab Inspection

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Check requests to:
   - `/api/auth/exchange-token` - Status should be 200
   - `/api/auth/user-info` - Status should be 200
   - `/api/user/profile` - Status should be 200 (if authenticated)

### 3. Check Auth Headers

```javascript
// In console after login:
const token = localStorage.getItem('accessToken');
const decoded = atob(token.split('.')[1]); // Decode JWT payload
console.log('Token Payload:', JSON.parse(decoded));
```

### 4. Server-Side Logging

Add logging to server routes:

**server/routes/auth.ts:**
```typescript
console.log('[Auth] Exchange token request:', { code, clientId: OAUTH_CONFIG.clientId });
console.log('[Auth] Token response:', { accessToken: !!accessToken, expiresIn });
```

**server/routes/user.ts:**
```typescript
console.log('[User] Getting profile, token:', token.substring(0, 20) + '...');
```

### 5. Test Different Browsers

- Chrome/Edge
- Firefox
- Safari
- Mobile browsers

Different browsers handle cookies/storage differently.

---

## Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **Login button does nothing** | `VITE_OAUTH_CLIENT_ID` not set | Check environment variables are loaded |
| **"Invalid client error" at Azure B2C** | Wrong Client ID | Verify in Azure Portal app registration |
| **"Redirect URI mismatch" error** | `VITE_OAUTH_REDIRECT_URI` incorrect | Add correct URI to Azure B2C app settings |
| **Stuck on `/auth/callback` page** | Token exchange fails | Check server logs, verify `OAUTH_CLIENT_SECRET` |
| **"401 Unauthorized" on API calls** | Missing Bearer token | Verify token in localStorage, check `useAuthenticatedFetch` |
| **User not persisting after refresh** | localStorage issue | Check browser privacy settings, allow localStorage |
| **Token not refreshing automatically** | Refresh token expired | User needs to log in again |
| **CORS errors** | Cross-origin request blocked | Check server CORS configuration |

---

## Testing Checklist

Before deploying, verify all these work:

### Authentication
- [ ] Login button works
- [ ] Redirects to Azure B2C
- [ ] Can log in with credentials
- [ ] Redirected back to dashboard
- [ ] User email shows in header
- [ ] Logout button works
- [ ] Logout clears tokens and user info

### Protected Routes
- [ ] Can access `/dashboard` when logged in
- [ ] Redirected to home when not logged in
- [ ] Can access `/profile` when logged in
- [ ] Can access `/resources` when logged in

### API Calls
- [ ] `/api/user/profile` returns user data
- [ ] `/api/user/resources` returns resources list
- [ ] `Authorization` header included in requests
- [ ] 401 errors handled gracefully

### Token Management
- [ ] Access token stored in localStorage
- [ ] Refresh token stored in localStorage
- [ ] Token expires properly
- [ ] Automatic refresh works
- [ ] Expired refresh token logs out user

### Error Handling
- [ ] Invalid credentials show error
- [ ] Network errors handled
- [ ] API errors show to user
- [ ] Graceful degradation on failure

### Multi-language
- [ ] Login page works in both English and Arabic
- [ ] Protected pages work in both languages
- [ ] Language toggle works after login
- [ ] RTL layout correct in Arabic

---

## Quick Test Script

Run this in browser console to test the full flow programmatically:

```javascript
// Get auth status
console.log('Auth Status:', {
  token: !!localStorage.getItem('accessToken'),
  user: localStorage.getItem('user'),
  isAuthenticated: !!localStorage.getItem('accessToken')
});

// Test API call
async function testAPI() {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('/api/user/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  console.log('API Test:', data);
}

// Run test
testAPI().catch(err => console.error('Test failed:', err));
```

---

## Getting Help

If tests fail:

1. **Check browser console** (F12) for JavaScript errors
2. **Check Network tab** (F12) to see failed requests
3. **Check server logs** to see backend errors
4. **Check Azure B2C logs** in Azure Portal
5. **Verify environment variables** are set correctly
6. **Review the OAUTH_INTEGRATION.md** and API_ENDPOINTS.md documents

## References

- [Azure B2C Documentation](https://learn.microsoft.com/en-us/azure/active-directory-b2c/)
- [OAuth 2.0 Debugging Tools](https://tools.ietf.org/html/rfc6749)
- [JWT.io - Decode JWTs](https://jwt.io)
