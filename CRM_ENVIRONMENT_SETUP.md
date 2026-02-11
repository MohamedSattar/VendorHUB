# CRM Environment Switching Guide

This application supports seamless switching between different CRM (Dynamics 365) environments. You can easily toggle between Stage and DEV environments without restarting the application.

## Configured Environments

### Stage Environment
- **URL:** https://org2a23f983.crm15.dynamics.com/
- **Default:** Yes
- **Usage:** Production-like staging environment

### DEV Environment  
- **URL:** https://org8b20ca8a.crm15.dynamics.com/
- **Default:** No
- **Usage:** Development environment for testing

## How to Switch Environments

### Method 1: UI Switcher (Recommended)

1. Look for the **CRM Environment Switcher** button in the top-right corner of the header
2. It shows the current environment (e.g., "STAGE" or "DEV") with a blue dot indicator
3. Click the button to open the environment selector
4. Choose the target environment from the list
5. The application will automatically switch to the new environment
6. All subsequent API calls will use the new CRM instance

### Method 2: API Endpoint

You can also switch environments programmatically:

```bash
# Get current environment info
curl http://localhost:8080/api/config/crm-environment

# Switch to DEV environment
curl -X POST http://localhost:8080/api/config/crm-environment/switch \
  -H "Content-Type: application/json" \
  -d '{"environment":"DEV"}'

# Switch back to STAGE environment
curl -X POST http://localhost:8080/api/config/crm-environment/switch \
  -H "Content-Type: application/json" \
  -d '{"environment":"STAGE"}'
```

### Method 3: Environment Variable

You can set the default environment when starting the application:

```bash
CRM_ENVIRONMENT=DEV npm run dev
```

## Adding New Environments

To add a new CRM environment:

1. Edit `server/config/crmEnvironments.ts`
2. Add a new entry to the `CRM_ENVIRONMENTS` object:

```typescript
export const CRM_ENVIRONMENTS: Record<string, CRMEnvironment> = {
  STAGE: { /* existing config */ },
  DEV: { /* existing config */ },
  // Add your new environment:
  CUSTOM: {
    name: "CUSTOM",
    label: "Custom Environment",
    dataverseResource: "https://yourorg.crm15.dynamics.com/",
    description: "Your custom CRM environment",
  },
};
```

3. The new environment will automatically appear in the UI switcher

## Important Notes

- **Authentication:** The same Azure AD credentials work for all configured environments (assuming they use the same tenant)
- **Cache Invalidation:** When switching environments, any cached data is still valid for the new environment (no automatic cache clearing)
- **Session State:** The application maintains the current user session across environment switches
- **OData Queries:** All OData API calls automatically use the currently selected environment
- **Real-time Updates:** The environment switcher is available on all pages and updates are applied immediately

## Troubleshooting

### Environment Switch Not Working
1. Check browser console for errors
2. Verify the new environment URL is correct
3. Ensure Azure AD credentials are valid for the target environment
4. Check network tab to confirm API calls are using the correct CRM URL

### Cached Data Issues
If you see stale data after switching environments:
1. Clear browser cache (Ctrl+Shift+Delete / Cmd+Shift+Delete)
2. Force refresh the page (Ctrl+F5 / Cmd+Shift+R)
3. Data will be fetched fresh from the new environment

### Authentication Errors
If you get 401 errors after switching:
1. The authentication token may have expired
2. Log out and log back in
3. Or wait a few minutes as the token may refresh automatically

## Architecture

- **Configuration Layer:** `server/config/crmEnvironments.ts`
- **API Routes:** `server/routes/config.ts`
- **UI Component:** `client/components/CRMEnvironmentSwitcher.tsx`
- **Integration Points:**
  - `server/routes/odata.ts` - Uses `getODataBaseUrl()`
  - `server/routes/auth.ts` - Uses `getApiEndpoint()`

All core API services dynamically fetch the current environment configuration, ensuring all requests use the correct CRM instance.
