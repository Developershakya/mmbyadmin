# Holiday API Implementation - Complete Guide

## Overview
Holiday packages system is now fully functional with API integration, just like flights and hotels. The system fetches holiday packages from the database and displays them with filtering, sorting, and detailed package information.

## Database Structure

### Holiday Model (`/models/Holiday.js`)
- **id**: Primary key (auto-increment)
- **title**: Package title
- **description**: Package description
- **destination**: Destination name (searchable)
- **duration**: Duration (e.g., "4 Days 3 Nights")
- **price**: Price per person
- **originalPrice**: Original price (for discount calculation)
- **discount**: Discount percentage
- **image**: Featured image URL
- **images**: Array of image URLs
- **itinerary**: Array of day-wise plans with activities
- **inclusions**: Array of what's included
- **exclusions**: Array of what's NOT included
- **cancellationPolicy**: Cancellation policy text
- **bestTimeToVisit**: Best season to visit
- **maxGroupSize**: Maximum group size
- **difficulty**: Easy/Moderate/Difficult
- **category**: Beach/Mountain/Adventure/Heritage/Nature
- **rating**: Package rating (0-5)
- **reviewCount**: Number of reviews
- **isActive**: Availability status

## API Endpoints

### 1. Search Holidays
**Endpoint**: `POST /api/holiday/search`

**Request Body**:
```json
{
  "destination": "Goa",
  "category": "Beach",
  "minPrice": 5000,
  "maxPrice": 50000,
  "difficulty": "Easy",
  "sortBy": "recommended",  // or "price_low", "price_high", "rating"
  "limit": 20,
  "offset": 0
}
```

**Response**:
```json
{
  "success": true,
  "results": [...holidays],
  "totalCount": 10,
  "pageInfo": {
    "limit": 20,
    "offset": 0,
    "totalPages": 1
  }
}
```

### 2. Get Holiday Details
**Endpoint**: `GET /api/holiday/[id]`

**Response**:
```json
{
  "success": true,
  "result": {...holiday object}
}
```

## Frontend Pages

### 1. Holiday Search Results
**File**: `/src/pages/holiday/search.jsx`
- Search holiday packages by destination
- Filter by category, difficulty level, price
- Sort by recommended, price, rating
- View package cards with price and basic info

**Usage**:
```
/holiday/search?destination=Goa&startDate=2025-10-21&guests=2%20Adults
```

### 2. Holiday Package Details
**File**: `/src/pages/holiday/[id].jsx`
- Full package details with hero image
- Itinerary with day-wise breakdown
- Cancellation policy, inclusions, exclusions
- Pricing, discount, booking button
- Responsive design for mobile and desktop

**Usage**:
```
/holiday/1
/holiday/2
```

## Setting Up Sample Data

### Step 1: Ensure Database is Connected
Make sure your `.env` file has:
```
DB_NAME=your_database_name
DB_USER=your_db_user
PASSWORD=your_db_password
DB_HOST=localhost
```

### Step 2: Run the Seed Script
```bash
node scripts/seed-holidays.js
```

This will:
- Create the `holidays` table if it doesn't exist
- Clear existing holiday data
- Insert 6 sample holiday packages:
  1. Goa Hero Package - Beach
  2. Manali Adventure & Nature Retreat - Mountain
  3. Kerala Backwaters & Houseboat - Beach
  4. Rajasthan Royal Heritage Tour - Heritage
  5. Himalayan Trekking Expedition - Adventure
  6. Coorg Coffee Plantation - Nature

### Step 3: Verify in Database
```sql
SELECT COUNT(*) FROM holidays;
SELECT * FROM holidays LIMIT 5;
```

## Integration with SearchBar

The SearchBar component in `/src/components/SearchBar.jsx` now:
1. Accepts destination, travel date, and guest count
2. Calls the holiday search API
3. Redirects to `/holiday/search` with parameters
4. Filters and displays matching packages

**Example**: Searching for "Goa" for "2 Adults" will show all active Goa holiday packages sorted by recommended.

## File Structure
```
/models/
  └─ Holiday.js          # Holiday model definition
/src/pages/
  ├─ /api/holiday/
  │  ├─ search.js        # Search API endpoint
  │  └─ [id].js          # Individual package API
  ├─ /holiday/
  │  ├─ search.jsx       # Search results page
  │  ├─ [id].jsx         # Package details page
  │  ├─ index.jsx        # Package listing page (old)
  │  ├─ pages.jsx        # Package details page (old)
  │  └─ grid.jsx         # Grid display (old)
  └─ /components/
     └─ SearchBar.jsx    # Updated with holiday search
/scripts/
  └─ seed-holidays.js    # Database seed script
```

## Key Features

✅ **API-Driven**: All data from database, no hardcoding
✅ **Filtering**: By destination, category, difficulty, price
✅ **Sorting**: By recommended, price, rating
✅ **Pagination**: Supports limit and offset
✅ **Responsive**: Mobile and desktop friendly
✅ **Detailed Pages**: Full itinerary, policies, reviews
✅ **Search Integration**: Connected to main SearchBar
✅ **Error Handling**: Graceful error messages in Hinglish

## Similar to Flights & Hotels

The holiday API follows the same pattern as:
- **Flights** (`/api/flights/search`) - Call external SRDV API
- **Hotels** (`/api/hotels/search`) - Call external SRDV API

But holidays use the **local database** for data, making it:
- Faster (no external API calls)
- More controlled (add/edit packages in DB)
- Fully customizable

## Next Steps

1. **Add to Database Directly**:
   ```sql
   INSERT INTO holidays (...) VALUES (...);
   ```

2. **Update Package Data**:
   - Edit itinerary, pricing, policies
   - Upload new images
   - Adjust categories and difficulty

3. **Add More Features**:
   - Booking system
   - User reviews and ratings
   - Payment gateway integration
   - Email notifications

4. **Optimize**:
   - Add caching for popular searches
   - Image optimization
   - SEO optimization

## Troubleshooting

### "Holiday nahi mila" error in search
- Run the seed script: `node scripts/seed-holidays.js`
- Check if holidays table exists in database
- Verify database connection in `.env`

### API returns empty results
- Ensure sample data is seeded
- Check destination spelling in search
- Verify active status of holidays

### Images not loading
- Check image URLs are accessible
- Update image URLs in the database
- Use absolute URLs (https://...)

## Testing

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to home page
3. Search for "Goa" in the holiday search box
4. Should see all Goa packages
5. Click on any package for detailed view
6. Try filters and sorting

---

**Created**: 2024
**Type**: Full API Implementation with Database
**Similar to**: Flights & Hotels APIs
