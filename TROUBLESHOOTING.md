# Troubleshooting: "Failed to fetch contests" Error

## Problem

The application is showing an error "Failed to fetch contests" when trying to load contest data.

## Common Causes & Solutions

### 1. Missing Environment Variables

**Symptoms:** Database connection errors, 503 Service Unavailable
**Solution:** Create a `.env.local` file in your project root with:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
BETTER_AUTH_SECRET="your-secret-key-here"
```

### 2. Database Not Running

**Symptoms:** Connection refused errors
**Solution:**

- Ensure PostgreSQL is running
- Check if the database exists
- Verify connection credentials

### 3. Database Migrations Not Run

**Symptoms:** Table not found errors
**Solution:** Run database migrations:

```bash
npx drizzle-kit migrate
```

### 4. Authentication Issues

**Symptoms:** 401/403 Access Denied errors
**Solution:**

- Check if you're logged in
- Verify you have admin privileges for admin routes
- Check authentication configuration

## Debugging Steps

### 1. Test Database Connection

Visit `/api/test-db` in your browser to check database status.

### 2. Check Browser Console

Look for detailed error messages in the browser's developer console.

### 3. Check Network Tab

In browser dev tools, check the Network tab to see:

- HTTP status codes
- Response headers
- Response body for error details

### 4. Check Server Logs

Look at your terminal/server logs for backend errors.

## Quick Fixes

### Option 1: Use Public Endpoint

The hook now tries the public `/api/contests` endpoint first, which should work without authentication.

### Option 2: Check Database

Ensure your database is running and accessible:

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check if tables exist
psql $DATABASE_URL -c "\dt contest*;"
```

### Option 3: Restart Development Server

Sometimes a simple restart helps:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
# or
pnpm dev
```

## Still Having Issues?

1. Check the browser console for specific error messages
2. Verify your `.env.local` file exists and has correct values
3. Ensure PostgreSQL is running and accessible
4. Run `npx drizzle-kit studio` to inspect your database directly
5. Check if there are any firewall or network restrictions

## Support

If the issue persists, please provide:

- Browser console error messages
- Network tab response details
- Server terminal output
- Your environment configuration (without sensitive data)
