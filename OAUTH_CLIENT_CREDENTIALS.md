# OAuth 2.0 Client Credentials Flow - Dataverse Authentication

This document describes the implementation of OAuth 2.0 Client Credentials Flow for service-to-service authentication with Microsoft Dynamics 365 Dataverse.

## Overview

The Client Credentials Flow is used for server-to-server authentication where the application itself (not a user) authenticates to Azure AD and Dataverse. This is ideal for backend services, batch jobs, and daemon applications.

## Architecture

### Components

1. **Azure Auth Service** (`server/services/azureAuth.ts`)
   - Handles all OAuth authentication logic
   - Manages token caching and refresh
   - Supports both v1.0 and v2.0 token endpoints
   - Provides authenticated request headers

2. **OData Routes** (`server/routes/odata.ts`)
   - All Dataverse API requests use authenticated requests
   - Automatic 401 retry with token refresh
   - Clean separation of concerns

3. **Server Index** (`server/index.ts`)
   - Routes all `/api/odata/*` requests through authentication middleware

## Environment Variables

The following environment variables must be configured:

```bash
# Azure Tenant ID
AZURE_TENANT_ID=9bfb065d-cde3-4be3-8515-0b1c8fe6fc29

# Azure Application (Client) ID
AZURE_CLIENT_ID=02b145a5-cc87-408e-8333-71b77ce1d8c2

# Azure Application Secret (keep secure!)
AZURE_CLIENT_SECRET=yGu8Q~Ks0XIGCABfHaeJtfMnSlI8yY_2ejRgMczc

# Dataverse Organization URL (for API endpoint construction)
DATAVERSE_RESOURCE=https://org2a23f983.crm15.dynamics.com/.default

# Azure AD Token Endpoint (v1.0 or v2.0)
TOKEN_URL=https://login.microsoftonline.com/9bfb065d-cde3-4be3-8515-0b1c8fe6fc29/oauth2/token
```

### Security Best Practices

**⚠️ IMPORTANT: Keep the client secret secure!**

- **NEVER** commit `AZURE_CLIENT_SECRET` to version control
- Store in environment variables or CI/CD secrets
- Use DevServerControl `set_env_variable` tool to set locally
- Rotate client secret regularly
- Use separate credentials for dev/test/prod environments

## How It Works

### Token Request Flow

```
┌─────────────────────────────────────────────────┐
│  Backend Server (Your Application)              │
│  ────────────────────────────────────────────   │
│  1. Needs to call Dataverse API                 │
│  2. Calls getAccessToken()                      │
└─────────────────┬───────────────────────────────┘
                  │
                  ├─> Check token cache
                  │   ├─> Valid? Return cached token
                  │   └─> Expired? Request new token
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│  Azure Active Directory (Azure AD)              │
│  ────────────────────────────────────────────   │
│  POST /oauth2/token                             │
│  ├─ client_id                                   │
│  ├─ client_secret                               │
│  ├─ grant_type: client_credentials              │
│  └─ resource/scope                              │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
              Response
         ┌──────────────────┐
         │ access_token     │
         │ expires_in       │
         │ token_type       │
         └──────────────────┘
                  │
                  ↓
        ┌─────────────────────────┐
        │ Cache Token with expiry  │
        │ (5 min buffer added)     │
        └─────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│  Dataverse API                                  │
│  ────────────────────────────────────────────   │
│  Authorization: Bearer <access_token>           │
│  ├─> Request succeeds (200)                     │
│  └─> Request fails (401) → Refresh token & retry
└─────────────────────────────────────────────────┘
```

### Key Features

1. **Token Caching**
   - Access tokens are cached in memory
   - Automatic refresh before expiration
   - 5-minute safety buffer to prevent expired tokens

2. **Automatic Retry**
   - If a request returns 401 (Unauthorized)
   - Token cache is invalidated
   - New token is obtained and request is retried once

3. **Error Handling**
   - Detailed error messages from Azure AD
   - Comprehensive logging for debugging
   - Graceful fallback for configuration issues

## Usage in Routes

### Getting an Access Token

```typescript
import { getAccessToken } from "../services/azureAuth";

// In a route handler
const token = await getAccessToken();
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const response = await fetch(dataverseUrl, { headers });
```

### Using Authenticated Requests

```typescript
import { getAuthHeaders } from "../services/azureAuth";

// In a route handler - all headers are automatically added
const response = await makeAuthenticatedRequest(url, {
  method: "GET",
  headers: { Accept: "application/json" },
});
```

### Monitoring Token Status

```typescript
import { hasValidToken } from "../services/azureAuth";

// Check if a valid token is cached (useful for health checks)
if (hasValidToken()) {
  console.log("Token is cached and valid");
}
```

## Dataverse API Endpoint

The system automatically constructs the correct Dataverse API endpoint from `DATAVERSE_RESOURCE`:

**Input:** `https://org2a23f983.crm15.dynamics.com/.default`

**Constructed Endpoint:** `https://org2a23f983.crm15.dynamics.com/api/data/v9.2`

This endpoint is used for all OData queries to Dataverse.

## Token Endpoint Versions

The implementation supports both Azure AD token endpoint versions:

### v1.0 Endpoint
```
POST https://login.microsoftonline.com/{tenant}/oauth2/token
```
- Uses `resource` parameter
- Older but still widely supported
- Example: `TOKEN_URL=https://login.microsoftonline.com/9bfb065d-cde3-4be3-8515-0b1c8fe6fc29/oauth2/token`

### v2.0 Endpoint
```
POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
```
- Uses `scope` parameter
- Newer endpoint with additional features
- Example: `TOKEN_URL=https://login.microsoftonline.com/9bfb065d-cde3-4be3-8515-0b1c8fe6fc29/oauth2/v2.0/token`

The system automatically detects which version is being used and applies the correct parameter (`resource` vs `scope`).

## Error Handling

### Common Errors

1. **Missing Environment Variables**
   ```
   Error: Missing required Azure authentication environment variables
   ```
   - Solution: Ensure all required env vars are set via DevServerControl

2. **Invalid Client Secret**
   ```
   Error: Failed to obtain access token: invalid_client
   ```
   - Solution: Verify the AZURE_CLIENT_SECRET is correct

3. **Invalid Resource/Scope**
   ```
   Error: Failed to obtain access token: invalid_resource
   ```
   - Solution: Verify DATAVERSE_RESOURCE format is correct

4. **Dataverse API 401 Unauthorized**
   - System automatically retries with fresh token
   - Check server logs for details

## Logging and Debugging

The implementation includes comprehensive logging:

```typescript
// Token acquisition logging
[Azure Auth] Requesting new access token from: https://login.microsoftonline.com/.../oauth2/token
[Azure Auth] Using v1.0 endpoint with resource parameter
[Azure Auth] Successfully obtained access token { expiresIn: 3600, expiresAt: '2024-01-20T...' }

// Request logging
[OData] Making authenticated request to: https://org.crm15.dynamics.com/api/data/v9.2/...
[OData Proxy] Fetching Engagements from Power Apps

// Error logging
[Azure Auth] Token request failed: { status: 400, error: 'invalid_client' }
[OData] Got 401 Unauthorized, invalidating token cache and retrying...
```

Enable detailed logging in development:
```bash
# All [Azure Auth] and [OData] logs will appear in console
```

## Testing

### Manual Test with curl

```bash
# Get an access token
TOKEN=$(curl -X POST \
  "https://login.microsoftonline.com/9bfb065d-cde3-4be3-8515-0b1c8fe6fc29/oauth2/token" \
  -d "grant_type=client_credentials" \
  -d "client_id=02b145a5-cc87-408e-8333-71b77ce1d8c2" \
  -d "client_secret=yGu8Q~Ks0XIGCABfHaeJtfMnSlI8yY_2ejRgMczc" \
  -d "resource=https://org2a23f983.crm15.dynamics.com" | jq -r '.access_token')

# Use token to call Dataverse API
curl -H "Authorization: Bearer $TOKEN" \
  "https://org2a23f983.crm15.dynamics.com/api/data/v9.2/prmtk_engagements?$top=5"
```

### Test Through Frontend

1. Navigate to any page that calls OData endpoints
2. Check browser developer tools → Network tab
3. Verify requests to `/api/odata/*` are succeeding
4. Check server logs for token acquisition messages

## Troubleshooting

### Token Not Being Cached

**Symptom:** New token requested on every API call

**Solutions:**
1. Check `console.log` for "[Azure Auth] Using cached access token"
2. Verify token expiration is being set correctly
3. Check if 401 errors are triggering cache invalidation

### 401 Unauthorized Errors Persisting

**Symptom:** Even after retry, still getting 401

**Solutions:**
1. Verify Azure credentials are correct
2. Check Dataverse org permissions for the service principal
3. Verify resource/scope format matches token endpoint version

### Slow API Responses

**Symptom:** First request takes 3-5 seconds

**Solutions:**
1. This is normal - first request needs to acquire token from Azure AD
2. Subsequent requests use cached token (instant)
3. Token refreshes happen in background before expiration

## Security Considerations

1. **Client Secret Rotation**
   - Plan to rotate credentials every 90 days
   - Create new secret before deleting old one
   - Update environment variables atomically

2. **Token Exposure**
   - Never log access tokens
   - Never expose tokens to frontend code
   - Use HTTPS for all communications

3. **Least Privilege**
   - Grant application only required Dataverse permissions
   - Use role-based security in Dataverse
   - Audit access regularly

4. **Rate Limiting**
   - Dataverse has API throttling limits
   - Monitor logs for 429 (Too Many Requests) responses
   - Implement request queuing if needed

## References

- [Microsoft Identity Platform - Client Credentials Flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow)
- [Dataverse Web API Authentication](https://docs.microsoft.com/en-us/power-apps/developer/data-platform/webapi/authenticate-web-api)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
