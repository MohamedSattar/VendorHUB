# Authenticated API Endpoints Documentation

## Overview

This document describes the authenticated API endpoints that require users to be logged in via Azure B2C OAuth 2.0.

## Authentication

All protected endpoints require an `Authorization` header with a Bearer token:

```
Authorization: Bearer <access_token>
```

The access token is automatically obtained during the OAuth login flow and should be included in all authenticated API requests using the `useAuthenticatedFetch` hook.

## API Endpoints

### Authentication Endpoints (Public)

These endpoints do not require authentication but are used as part of the OAuth flow.

#### Exchange Authorization Code for Access Token

**POST** `/api/auth/exchange-token`

Exchanges the authorization code for access and refresh tokens.

**Request:**
```json
{
  "code": "authorization_code_from_azure_b2c"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "M.R3_BAY...",
  "expiresIn": 3600
}
```

---

#### Refresh Access Token

**POST** `/api/auth/refresh-token`

Gets a new access token using a refresh token.

**Request:**
```json
{
  "refreshToken": "M.R3_BAY..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

---

#### Get User Information

**POST** `/api/auth/user-info`

Fetches user profile information from Azure B2C.

**Request:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "id": "user-oid-from-azure",
  "email": "user@example.com",
  "name": "John Doe",
  "givenName": "John",
  "familyName": "Doe",
  "raw": { ... }
}
```

---

### User Endpoints (Protected)

All user endpoints require authentication via Bearer token.

#### Get User Profile

**GET** `/api/user/profile`

Returns the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "givenName": "John",
  "familyName": "Doe",
  "role": "vendor",
  "organization": "Example Company",
  "joinDate": "2024-01-15"
}
```

**Example Usage:**
```typescript
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";

function ProfileComponent() {
  const authenticatedFetch = useAuthenticatedFetch();

  const fetchProfile = async () => {
    const response = await authenticatedFetch("/api/user/profile");
    const profile = await response.json();
    console.log("User profile:", profile);
  };

  return <button onClick={fetchProfile}>Load Profile</button>;
}
```

---

#### Update User Profile

**PUT** `/api/user/profile`

Updates the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Jane Doe",
  "organization": "New Company"
}
```

**Response:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "Jane Doe",
  "organization": "New Company",
  "updatedAt": "2024-01-20T10:30:00Z"
}
```

**Example Usage:**
```typescript
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";

function EditProfileComponent() {
  const authenticatedFetch = useAuthenticatedFetch();

  const updateProfile = async () => {
    const response = await authenticatedFetch("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify({
        name: "Jane Doe",
        organization: "New Company",
      }),
    });
    const updated = await response.json();
    console.log("Profile updated:", updated);
  };

  return <button onClick={updateProfile}>Update Profile</button>;
}
```

---

#### Get User Resources

**GET** `/api/user/resources`

Returns a list of resources uploaded by the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Response:**
```json
[
  {
    "id": "resource-1",
    "title": "Annual Report 2024",
    "category": "report",
    "uploadedAt": "2024-01-15",
    "size": "2.5 MB"
  },
  {
    "id": "resource-2",
    "title": "Vendor Guidelines",
    "category": "guide",
    "uploadedAt": "2024-01-10",
    "size": "1.2 MB"
  }
]
```

**Example Usage - See UserResourcesList Component:**
```typescript
// client/components/UserResourcesList.tsx
import UserResourcesList from "@/components/UserResourcesList";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <UserResourcesList />
    </div>
  );
}
```

---

#### Delete User Resource

**DELETE** `/api/user/resources/:resourceId`

Deletes a resource belonging to the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
- `resourceId` (string, required) - The ID of the resource to delete

**Response:**
```json
{
  "success": true,
  "message": "Resource deleted successfully"
}
```

**Example Usage:**
```typescript
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";

function DeleteResourceComponent({ resourceId }: { resourceId: string }) {
  const authenticatedFetch = useAuthenticatedFetch();

  const deleteResource = async () => {
    const response = await authenticatedFetch(
      `/api/user/resources/${resourceId}`,
      { method: "DELETE" }
    );
    const result = await response.json();
    console.log(result.message);
  };

  return <button onClick={deleteResource}>Delete</button>;
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

- **400 Bad Request** - Missing or invalid parameters
- **401 Unauthorized** - Missing or invalid authentication token
- **500 Internal Server Error** - Server-side error

**Error Response Format:**
```json
{
  "error": "Error description",
  "details": { ... }
}
```

**Example Error Handling:**
```typescript
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";

async function makeAuthenticatedCall() {
  const authenticatedFetch = useAuthenticatedFetch();
  
  try {
    const response = await authenticatedFetch("/api/user/profile");
    
    if (!response.ok) {
      const error = await response.json();
      console.error("API Error:", error.error);
      return;
    }
    
    const data = await response.json();
    console.log("Success:", data);
  } catch (error) {
    console.error("Network error:", error);
  }
}
```

## Components Using Authenticated APIs

### UserProfileCard

Displays the authenticated user's profile information.

```typescript
import UserProfileCard from "@/components/UserProfileCard";

export default function ProfilePage() {
  return (
    <div>
      <h1>My Profile</h1>
      <UserProfileCard />
    </div>
  );
}
```

**Features:**
- Auto-fetches user profile on load
- Shows loading and error states
- Displays user information from `/api/user/profile`

---

### UserResourcesList

Displays and manages user's uploaded resources.

```typescript
import UserResourcesList from "@/components/UserResourcesList";

export default function ResourcesPage() {
  return (
    <div>
      <h1>My Resources</h1>
      <UserResourcesList />
    </div>
  );
}
```

**Features:**
- Lists all user resources
- Allows deletion with confirmation
- Shows loading and error states
- Auto-refetch after delete

---

## Adding New Authenticated Endpoints

### 1. Create Server Route Handler

**server/routes/user.ts:**
```typescript
import { RequestHandler } from "express";
import { AuthenticatedRequest } from "@/middleware/auth";

export const handleGetData: RequestHandler = (req, res) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    // Access user token: authenticatedReq.token
    
    const data = { ... };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
```

### 2. Register Route in Server

**server/index.ts:**
```typescript
import { requireAuth } from "@/middleware/auth";
import { handleGetData } from "./routes/user";

app.get("/api/data", requireAuth, handleGetData);
```

### 3. Create OAuth Service Function

**client/services/oauth.ts:**
```typescript
export async function getData(): Promise<any> {
  const response = await fetch("/api/data");
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return await response.json();
}
```

### 4. Use in React Component

**client/components/DataComponent.tsx:**
```typescript
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";

export default function DataComponent() {
  const authenticatedFetch = useAuthenticatedFetch();
  
  const fetchData = async () => {
    const response = await authenticatedFetch("/api/data");
    const data = await response.json();
    // Use data...
  };
  
  return <button onClick={fetchData}>Load Data</button>;
}
```

## Security Best Practices

1. **Always Use HTTPS in Production**
   - OAuth and Bearer tokens must only be transmitted over HTTPS

2. **Token Validation**
   - Validate tokens with Azure B2C on every authenticated request
   - Check token expiration and refresh if needed

3. **Authorization Checks**
   - Verify user owns the resource they're accessing
   - Implement role-based access control

4. **Rate Limiting**
   - Implement rate limiting on authenticated endpoints
   - Prevent abuse and DoS attacks

5. **Logging and Monitoring**
   - Log all authentication failures
   - Monitor for suspicious access patterns

6. **CORS Configuration**
   - Restrict CORS to known domains in production
   - Avoid using wildcard `*` in production

## Testing Authenticated Endpoints

### Using cURL

```bash
# Get access token first (from localStorage after login)
TOKEN="your_access_token_here"

# Test protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8080/api/user/profile
```

### Using JavaScript

```javascript
const token = localStorage.getItem("accessToken");

fetch("/api/user/profile", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

## Troubleshooting

### 401 Unauthorized

**Cause:** Missing or expired access token

**Solution:**
1. Ensure user is logged in
2. Check token in localStorage: `localStorage.getItem('accessToken')`
3. Token may be expired - `useAuthenticatedFetch` handles automatic refresh

### 403 Forbidden

**Cause:** User doesn't have permission to access resource

**Solution:**
1. Verify user owns the resource
2. Check authorization middleware logic
3. Ensure user has correct role/permissions

### 500 Internal Server Error

**Cause:** Server-side error

**Solution:**
1. Check server logs
2. Verify all required environment variables are set
3. Ensure database connections are working

## Reference

- [useAuthenticatedFetch Hook Documentation](#)
- [AuthContext Documentation](#)
- [OAuth Integration Guide](./OAUTH_INTEGRATION.md)
