# Quick Start Guide - Mandi Prices

## ⚠️ Important: Run Both Servers

The Market Prices feature requires **both** the frontend and backend servers to be running.

## Step 1: Install Dependencies

```bash
# Install frontend dependencies (if not already done)
npm install

# Install backend dependencies
cd server
npm install axios cheerio node-cron
cd ..
```

## Step 2: Start Backend Server

In one terminal:
```bash
node server.js
```

You should see:
```
✅ Server running on http://localhost:5000
📊 Mandi prices API: http://localhost:5000/api/live-mandi-prices
```

## Step 3: Start Frontend Server

In another terminal:
```bash
npm run dev
```

The Vite dev server will start (usually on http://localhost:5173)

## Step 4: Test the API

Open your browser and go to:
- Frontend: http://localhost:5173
- Navigate to "Market Prices" page
- Or test API directly: http://localhost:5000/api/live-mandi-prices

## Troubleshooting

### Error: "Unexpected token '<', "<!DOCTYPE "..."
**Cause:** Backend server is not running or not accessible

**Solution:**
1. Make sure `node server.js` is running
2. Check that port 5000 is not in use by another application
3. Verify the server shows the startup messages

### Error: "Cannot connect to server"
**Cause:** Backend server is not running or proxy not configured

**Solution:**
1. Ensure backend is running on port 5000
2. Restart the Vite dev server after adding proxy config
3. Check `vite.config.js` has the proxy configuration

### No Data Showing
**Cause:** Scraper might be using fallback sample data

**Solution:**
- This is normal - the scraper includes sample data as fallback
- Check server console for scraping logs
- Sample data ensures the page always works

## Development Workflow

1. **Terminal 1:** `node server.js` (Backend - port 5000)
2. **Terminal 2:** `npm run dev` (Frontend - port 5173)
3. Open browser to frontend URL
4. Navigate to Market Prices page

## API Endpoint

- **URL:** `GET http://localhost:5000/api/live-mandi-prices`
- **Response:** JSON with `{ success: true, data: [...], cached: false, timestamp: "..." }`

