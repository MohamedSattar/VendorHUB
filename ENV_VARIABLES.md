# Environment Variables Reference

This document describes all environment variables required for the Supplier Registration system and Dataverse integration.

## Quick Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values with your Azure AD and Dataverse credentials

3. For sensitive values (secrets), use environment variables instead of .env file:
   ```bash
   # macOS/Linux
   export AZURE_CLIENT_SECRET="your-secret"
   npm run dev
   
   # Windows PowerShell
   $env:AZURE_CLIENT_SECRET = "your-secret"
   npm run dev
   ```

---

## Required Variables

### Azure AD Authentication

These variables are required for server-to-server authentication with Dataverse.

#### `AZURE_TENANT_ID`
- **Type:** String (GUID)
- **Required:** Yes
- **Description:** Azure Active Directory Tenant ID
- **Example:** `9bfb065d-cde3-4be3-8515-0b1c8fe6fc29`
- **How to get it:**
  1. Go to [Azure Portal](https://portal.azure.com)
  2. Open Azure Active Directory
  3. Click Properties
  4. Copy "Directory (tenant) ID"

#### `AZURE_CLIENT_ID`
- **Type:** String (GUID)
- **Required:** Yes
- **Description:** Application (Client) ID of your Azure AD app registration
- **Example:** `02b145a5-cc87-408e-8333-71b77ce1d8c2`
- **How to get it:**
  1. Go to [Azure Portal](https://portal.azure.com)
  2. Open Azure Active Directory
  3. Go to App Registrations
  4. Select your application
  5. Copy "Application (client) ID"

#### `AZURE_CLIENT_SECRET`
- **Type:** String
- **Required:** Yes
- **Description:** Client secret for authentication
- **Example:** `yGu8Q~Ks0XIGCABfHaeJtfMnSlI8yY_2ejRgMczc`
- **Security:** 🔒 **NEVER commit to version control**
- **How to get it:**
  1. Go to [Azure Portal](https://portal.azure.com)
  2. Open Azure Active Directory
  3. Go to App Registrations > Your App
  4. Click Certificates & secrets
  5. Click "+ New client secret"
  6. Copy the secret value (NOT the ID)
  7. Set via environment variable, not in .env file

#### `TOKEN_URL`
- **Type:** URL
- **Required:** Yes
- **Description:** Azure AD OAuth 2.0 v2.0 token endpoint
- **Format:** `https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token`
- **Example:** `https://login.microsoftonline.com/9bfb065d-cde3-4be3-8515-0b1c8fe6fc29/oauth2/v2.0/token`
- **Note:** Must use `/v2.0/` for DATAVERSE_RESOURCE with `/.default` scope

#### `DATAVERSE_RESOURCE`
- **Type:** URL
- **Required:** Yes
- **Description:** Dataverse/Power Apps organization resource URL
- **Format:** `https://{org}.crm{region}.dynamics.com/.default`
- **Example:** `https://org2a23f983.crm15.dynamics.com/.default`
- **How to get it:**
  1. Log into [Power Apps](https://make.powerapps.com)
  2. Select your environment
  3. Click Settings ⚙️
  4. Click Organization
  5. Copy the "Organization URL"
  6. Append `/.default` to the URL
- **Note:** The `/.default` scope is required for OAuth 2.0 v2.0

---

## Optional Variables

### Power Apps Basic Auth (Fallback)

These are optional and only used as a fallback if Azure AD authentication fails.

#### `POWER_APPS_USERNAME`
- **Type:** String
- **Required:** No
- **Description:** Username for Power Apps basic authentication
- **Security:** ⚠️ Not recommended for production

#### `POWER_APPS_PASSWORD`
- **Type:** String
- **Required:** No
- **Description:** Password for Power Apps basic authentication
- **Security:** 🔒 Never commit to version control

### Configuration Flags

#### `FORWARD_CLIENT_AUTH`
- **Type:** Boolean (true/false)
- **Default:** `true`
- **Description:** Whether to forward client's Authorization header or use server credentials
- **Values:**
  - `true`: Use client-provided tokens
  - `false`: Use server-side client credentials

---

## Frontend-only Variables

These variables are prefixed with `VITE_` and are available to the client-side code.

### Frontend API Configuration

#### `VITE_PUBLIC_API_BASE_URL`
- **Type:** URL
- **Required:** No
- **Description:** Base URL for API calls from frontend
- **Example:** `https://ecavendorhubspa.powerappsportals.com/`
- **Note:** Used in client code for non-authenticated API calls

#### `VITE_PUBLIC_BUILDER_KEY`
- **Type:** String
- **Required:** No
- **Description:** Builder.io API key for frontend content
- **Note:** Can be public (prefixed with VITE_PUBLIC_)

### B2C Configuration (Optional)

These are for client-side Azure B2C authentication flows.

#### `VITE_B2C_CLIENT_ID`
- **Type:** String (GUID)
- **Required:** No
- **Description:** Azure B2C Application ID for client-side auth

#### `VITE_B2C_TOKEN_URL`
- **Type:** URL
- **Required:** No
- **Description:** B2C Token endpoint for client-side auth
- **Format:** `https://login.microsoftonline.com/{TENANT_ID}/oauth2/token`

#### `VITE_B2C_SCOPES`
- **Type:** String (space-separated)
- **Required:** No
- **Default:** `openid offline_access`
- **Description:** OAuth scopes for B2C authentication

#### `VITE_B2C_CLIENT_SECRET`
- **Type:** String
- **Required:** No
- **Security:** 🔒 Never commit to version control
- **Note:** Should be set via environment variable only

---

## Miscellaneous

#### `PING_MESSAGE`
- **Type:** String
- **Default:** `"ping pong"`
- **Description:** Response message for `/api/ping` endpoint
- **Used for:** Health checks and testing

---

## Security Best Practices

### ✅ DO:
- Store secrets in environment variables (not in .env)
- Use CI/CD pipeline secret management in production
- Use Azure AD Client Credentials flow for server-to-server auth
- Rotate client secrets regularly
- Use separate credentials for dev, staging, and production

### ❌ DON'T:
- Commit `AZURE_CLIENT_SECRET` or `VITE_B2C_CLIENT_SECRET` to Git
- Share credentials in Slack, email, or chat
- Use basic auth (`POWER_APPS_USERNAME`/`POWER_APPS_PASSWORD`) in production
- Commit `.env` file with real values
- Use the same credentials across environments

---

## Setting Environment Variables

### Development (Local)

**Option 1: Temporary (shell session only)**
```bash
# macOS/Linux
export AZURE_CLIENT_SECRET="your-secret"
npm run dev

# Windows PowerShell
$env:AZURE_CLIENT_SECRET = "your-secret"
npm run dev
```

**Option 2: Using .env file (only public variables)**
```bash
# Add non-secret variables to .env
# For secrets, use environment variables from your shell
cp .env.example .env
# Edit .env and set only public variables
# Then set secrets via environment variables before running
```

### Production (CI/CD)

**GitHub Actions Example:**
```yaml
- name: Run build
  env:
    AZURE_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
    VITE_B2C_CLIENT_SECRET: ${{ secrets.VITE_B2C_CLIENT_SECRET }}
  run: npm run build
```

**Vercel/Netlify:**
Use the platform's environment variable management UI:
1. Go to Settings
2. Environment Variables
3. Add your secrets
4. Redeploy

---

## Troubleshooting

### "Missing required Azure authentication environment variables"

**Cause:** One or more required variables are not set
**Solution:**
1. Check that all required variables are set:
   - `TOKEN_URL`
   - `AZURE_CLIENT_ID`
   - `AZURE_CLIENT_SECRET`
   - `DATAVERSE_RESOURCE`
2. Verify the values are correct (copy-paste from Azure Portal)
3. Check that variables are accessible from the server (use `console.log` in code)

### "401 Unauthorized"

**Cause:** Invalid credentials or wrong secret
**Solution:**
1. Verify `AZURE_CLIENT_SECRET` is correct (re-copy from Azure Portal)
2. Verify `AZURE_CLIENT_ID` matches the app registration
3. Verify `AZURE_TENANT_ID` is correct
4. Check that the app registration has API permissions for Dataverse

### "404 Not Found for segment 'prmtk_supplierregistration'"

**Cause:** Wrong Dataverse resource URL or table doesn't exist
**Solution:**
1. Verify `DATAVERSE_RESOURCE` points to the correct organization
2. Verify the table name exists in your Dataverse instance
3. Check Dataverse URL format: `https://{org}.crm{region}.dynamics.com/.default`

---

## Related Files

- `.env` - Actual environment variables (DO NOT COMMIT secrets)
- `.env.example` - Template for environment variables
- `.env.local` - Local overrides (add to .gitignore)
- `.gitignore` - Should exclude .env files
