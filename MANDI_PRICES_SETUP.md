# Mandi Prices Scraper - Complete Setup Guide

## ✅ What Was Created

### 1. Scraper File
**Location:** `server/scrapers/mandiScraper.js`
- Scrapes live mandi prices from Agmarknet
- Uses Axios for HTTP requests and Cheerio for HTML parsing
- Includes fallback mechanisms (API → Scraping → Sample Data)
- Returns structured JSON with all required fields

### 2. Backend API Endpoint
**Location:** `server.js` (updated)
- **Endpoint:** `GET /api/live-mandi-prices`
- Implements 2-hour caching to reduce server load
- Returns cached data if scraping fails
- Handles errors gracefully

### 3. Frontend Integration
**Location:** `src/components/MarketPrices.jsx` (updated)
- Fetches data from `/api/live-mandi-prices`
- Displays data in a searchable, filterable table
- Includes State filter, Commodity filter, and Search bar
- Shows loading states and error messages

### 4. Optional Cron Scheduler
**Location:** `server/scrapers/cronScheduler.js`
- Automatic refresh every 2 hours (configurable)
- Can be enabled by uncommenting code in `server.js`

## 📦 Dependencies Added

Update `server/package.json` with:
```json
{
  "axios": "^1.6.0",
  "cheerio": "^1.0.0-rc.12",
  "node-cron": "^3.0.3"
}
```

## 🚀 Installation Steps

1. **Install dependencies:**
```bash
cd server
npm install axios cheerio node-cron
```

2. **Start the server:**
```bash
node server.js
```

3. **Access the API:**
```
GET http://localhost:5000/api/live-mandi-prices
```

4. **View in frontend:**
- Navigate to Market Prices page
- Data will load automatically
- Use filters to search by state, commodity, or text

## 🔧 How It Works

### Data Flow:
1. **Frontend** → Calls `/api/live-mandi-prices`
2. **Backend** → Checks cache (2-hour validity)
3. **If cache expired:**
   - Runs scraper (`mandiScraper.js`)
   - Fetches from Agmarknet
   - Updates cache
4. **Returns** JSON array of price records

### Caching Strategy:
- Cache duration: 2 hours
- If scraping fails → returns stale cache (if available)
- If no cache → returns error message

## 📊 Data Structure

Each record contains:
```javascript
{
  state: "Maharashtra",
  district: "Mumbai",
  market: "APMC",
  commodity: "Rice",
  variety: "Local",
  minPrice: 1500,
  maxPrice: 2000,
  modalPrice: 1750,
  date: "2024-01-15",
  scrapedAt: "2024-01-15T10:30:00.000Z"
}
```

## 🎯 Features

### Frontend Features:
- ✅ Search bar (commodity, market, district, state)
- ✅ State filter dropdown
- ✅ Commodity filter dropdown
- ✅ Responsive table display
- ✅ Loading states
- ✅ Error handling
- ✅ Cache indicator
- ✅ Last updated timestamp

### Backend Features:
- ✅ Automatic caching (2 hours)
- ✅ Fallback to stale cache on errors
- ✅ Sample data fallback
- ✅ Error logging
- ✅ Optional cron-based refresh

## 🔄 Enable Automatic Refresh (Optional)

Uncomment these lines in `server.js`:

```javascript
try {
  const { startCronScheduler } = await import('./server/scrapers/cronScheduler.js');
  startCronScheduler('0 */2 * * *'); // Every 2 hours
} catch (err) {
  console.log('⚠️  Cron scheduler not available:', err.message);
}
```

Cron schedule examples:
- Every 2 hours: `'0 */2 * * *'`
- Every 6 hours: `'0 */6 * * *'`
- Daily at 6 AM: `'0 6 * * *'`
- Every 30 minutes: `'*/30 * * * *'`

## 🐛 Troubleshooting

### Issue: "Cannot find module 'axios'"
**Solution:** Run `npm install` in the `server` directory

### Issue: Scraper returns sample data
**Solution:** This is expected fallback behavior. Check:
- Agmarknet website accessibility
- Network connectivity
- Scraper logs for specific errors

### Issue: Frontend shows "Live data unavailable"
**Solution:** 
- Check if server is running
- Verify API endpoint is accessible
- Check browser console for errors
- Verify CORS is enabled

## 📝 Notes

- The scraper includes delays between requests to be respectful
- Sample data ensures the frontend always has data to display
- Cache reduces load on Agmarknet servers
- All prices are in Indian Rupees (₹)

## ✅ Testing

1. **Test API directly:**
```bash
curl http://localhost:5000/api/live-mandi-prices
```

2. **Test in browser:**
- Open Market Prices page
- Verify data loads
- Test filters and search
- Check refresh button

3. **Verify caching:**
- Make first request (should fetch fresh data)
- Make second request within 2 hours (should return cached data)
- Check response for `cached: true` field

## 🎉 Complete!

Your mandi prices scraper is now fully integrated and ready to use!

