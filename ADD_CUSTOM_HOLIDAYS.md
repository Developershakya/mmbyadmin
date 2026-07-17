# How to Add Custom Holiday Packages

After seeding, you can add more holiday packages in multiple ways:

---

## Method 1: Direct Database Query

### Using MySQL Client

```sql
INSERT INTO holidays (
  title,
  description,
  destination,
  duration,
  price,
  originalPrice,
  discount,
  image,
  images,
  category,
  difficulty,
  rating,
  reviewCount,
  itinerary,
  inclusions,
  exclusions,
  cancellationPolicy,
  bestTimeToVisit,
  maxGroupSize,
  isActive,
  createdAt,
  updatedAt
) VALUES (
  'Andaman Island Paradise',
  'Explore pristine beaches, water sports, and coral reefs in Andaman',
  'Andaman',
  '5 Days 4 Nights',
  18999,
  24999,
  24,
  'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg',
  JSON_ARRAY(
    'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg',
    'https://images.pexels.com/photos/1559827/pexels-photo-1559827.jpeg'
  ),
  'Beach',
  'Easy',
  4.7,
  123,
  JSON_ARRAY(
    JSON_OBJECT('day', 1, 'title', 'Arrival in Port Blair', 'activities', JSON_ARRAY('Airport pickup', 'Hotel check-in', 'Evening at Cellular Jail')),
    JSON_OBJECT('day', 2, 'title', 'Island Hopping', 'activities', JSON_ARRAY('Neil Island tour', 'Beach visit', 'Water sports')),
    JSON_OBJECT('day', 3, 'title', 'Snorkeling & Diving', 'activities', JSON_ARRAY('Snorkeling trip', 'Coral reef exploration', 'Sunset cruise')),
    JSON_OBJECT('day', 4, 'title', 'Adventure Activities', 'activities', JSON_ARRAY('Para-sailing', 'Jet skiing', 'Beach bonfire')),
    JSON_OBJECT('day', 5, 'title', 'Departure', 'activities', JSON_ARRAY('Shopping', 'Airport transfer'))
  ),
  JSON_ARRAY(
    '5 nights accommodation',
    'Daily breakfast and dinner',
    'All activities mentioned',
    'Airport transfers',
    'Island tour guide'
  ),
  JSON_ARRAY(
    'Flights',
    'Personal items',
    'Tips and gratuities',
    'Travel insurance'
  ),
  'Free cancellation till 45 days before travel. 50% charges for 15-44 days. 100% charges for less than 15 days.',
  'December to April',
  20,
  1,
  NOW(),
  NOW()
);
```

---

## Method 2: Using Node.js Script

Create `scripts/add-holiday.js`:

```javascript
import sequelize from '../config/sequelize.js';
import Holiday from '../models/Holiday.js';

async function addHoliday() {
  try {
    await sequelize.sync();

    const newHoliday = await Holiday.create({
      title: "Andaman Island Paradise",
      description: "Explore pristine beaches, water sports, and coral reefs in Andaman",
      destination: "Andaman",
      duration: "5 Days 4 Nights",
      price: 18999,
      originalPrice: 24999,
      discount: 24,
      image: "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg",
      images: [
        "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg",
        "https://images.pexels.com/photos/1559827/pexels-photo-1559827.jpeg"
      ],
      category: "Beach",
      difficulty: "Easy",
      rating: 4.7,
      reviewCount: 123,
      itinerary: [
        {
          day: 1,
          title: "Arrival in Port Blair",
          activities: ["Airport pickup", "Hotel check-in", "Evening at Cellular Jail"]
        },
        {
          day: 2,
          title: "Island Hopping",
          activities: ["Neil Island tour", "Beach visit", "Water sports"]
        },
        {
          day: 3,
          title: "Snorkeling & Diving",
          activities: ["Snorkeling trip", "Coral reef exploration", "Sunset cruise"]
        },
        {
          day: 4,
          title: "Adventure Activities",
          activities: ["Para-sailing", "Jet skiing", "Beach bonfire"]
        },
        {
          day: 5,
          title: "Departure",
          activities: ["Shopping", "Airport transfer"]
        }
      ],
      inclusions: [
        "5 nights accommodation",
        "Daily breakfast and dinner",
        "All activities mentioned",
        "Airport transfers",
        "Island tour guide"
      ],
      exclusions: [
        "Flights",
        "Personal items",
        "Tips and gratuities",
        "Travel insurance"
      ],
      cancellationPolicy: "Free cancellation till 45 days before travel. 50% charges for 15-44 days. 100% charges for less than 15 days.",
      bestTimeToVisit: "December to April",
      maxGroupSize: 20,
      isActive: true
    });

    console.log("✅ Holiday added successfully!");
    console.log(newHoliday.toJSON());

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addHoliday();
```

Run with:
```bash
node scripts/add-holiday.js
```

---

## Method 3: Bulk Upload from JSON

Create `bulk-holidays.json`:

```json
[
  {
    "title": "Darjeeling Tea Plantations Tour",
    "description": "Experience tea gardens, mountain views, and local culture in Darjeeling",
    "destination": "Darjeeling",
    "duration": "4 Days 3 Nights",
    "price": 11999,
    "originalPrice": 14999,
    "discount": 20,
    "image": "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
    "images": ["https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg"],
    "category": "Mountain",
    "difficulty": "Easy",
    "rating": 4.6,
    "reviewCount": 156,
    "itinerary": [
      {"day": 1, "title": "Arrival", "activities": ["Pickup", "Hotel check-in"]},
      {"day": 2, "title": "Tea Garden Tour", "activities": ["Tea plantation visit", "Tea tasting"]},
      {"day": 3, "title": "Tiger Hill & Valley", "activities": ["Sunrise at Tiger Hill", "Valley walk"]},
      {"day": 4, "title": "Departure", "activities": ["Shopping", "Departure"]}
    ],
    "inclusions": ["Accommodation", "Breakfast", "Tours", "Guide"],
    "exclusions": ["Flights", "Insurance"],
    "cancellationPolicy": "Free till 30 days",
    "bestTimeToVisit": "September to May",
    "maxGroupSize": 25,
    "isActive": true
  },
  {
    "title": "Kashmir Valley Romance Package",
    "description": "Paradise on earth - lakes, gardens, and snow-capped mountains",
    "destination": "Kashmir",
    "duration": "5 Days 4 Nights",
    "price": 16999,
    "originalPrice": 21999,
    "discount": 23,
    "image": "https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg",
    "images": ["https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg"],
    "category": "Mountain",
    "difficulty": "Easy",
    "rating": 4.9,
    "reviewCount": 342,
    "itinerary": [
      {"day": 1, "title": "Arrival in Srinagar", "activities": ["Pickup", "Shikara ride on Dal Lake"]},
      {"day": 2, "title": "Srinagar City Tour", "activities": ["Mughal Gardens", "Old City walk"]},
      {"day": 3, "title": "Gulmarg Adventure", "activities": ["Ropeway ride", "Meadow walk"]},
      {"day": 4, "title": "Pahalgam Valley", "activities": ["Valley tour", "River trekking"]},
      {"day": 5, "title": "Departure", "activities": ["Return flight"]}
    ],
    "inclusions": ["5 nights", "All meals", "Tours", "Shikara ride"],
    "exclusions": ["Flights", "Activities not in itinerary"],
    "cancellationPolicy": "Free till 60 days",
    "bestTimeToVisit": "May to August",
    "maxGroupSize": 30,
    "isActive": true
  }
]
```

Create `scripts/bulk-import.js`:

```javascript
import sequelize from '../config/sequelize.js';
import Holiday from '../models/Holiday.js';
import fs from 'fs';

async function bulkImport() {
  try {
    await sequelize.sync();

    const data = JSON.parse(fs.readFileSync('./bulk-holidays.json', 'utf8'));
    
    const created = await Holiday.bulkCreate(data);
    console.log(`✅ Added ${created.length} holidays!`);

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

bulkImport();
```

Run with:
```bash
node scripts/bulk-import.js
```

---

## Method 4: Using a Management API

Create an admin endpoint `/src/pages/api/admin/holidays/create.js`:

```javascript
import Holiday from '../../../../models/Holiday.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  // Add authentication here
  // if (!isAdmin(req)) return res.status(403).json({ success: false });

  try {
    const holiday = await Holiday.create(req.body);
    return res.status(201).json({ success: true, result: holiday });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
```

Usage:
```bash
curl -X POST http://localhost:3000/api/admin/holidays/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Package",
    "destination": "New Place",
    ...
  }'
```

---

## Quick Reference: Sample Package Template

```json
{
  "title": "Package Title",
  "description": "Short description",
  "destination": "City Name",
  "duration": "X Days Y Nights",
  "price": 10000,
  "originalPrice": 12000,
  "discount": 16,
  "image": "https://image-url.jpg",
  "images": ["https://url1.jpg", "https://url2.jpg"],
  "category": "Beach|Mountain|Adventure|Heritage|Nature",
  "difficulty": "Easy|Moderate|Difficult",
  "rating": 4.5,
  "reviewCount": 100,
  "itinerary": [
    {
      "day": 1,
      "title": "Day Title",
      "activities": ["Activity 1", "Activity 2"]
    }
  ],
  "inclusions": ["What's included"],
  "exclusions": ["What's not included"],
  "cancellationPolicy": "Policy text",
  "bestTimeToVisit": "Season",
  "maxGroupSize": 30,
  "isActive": true
}
```

---

## Update Existing Package

### Method 1: Direct SQL

```sql
UPDATE holidays 
SET price = 13999, discount = 25
WHERE id = 1;
```

### Method 2: JavaScript

```javascript
await Holiday.update(
  { price: 13999, discount: 25 },
  { where: { id: 1 } }
);
```

---

## Delete Package

### Method 1: Hard Delete

```javascript
await Holiday.destroy({ where: { id: 1 } });
```

### Method 2: Soft Delete (Recommended)

```javascript
await Holiday.update(
  { isActive: false },
  { where: { id: 1 } }
);
```

---

## Verify Added Packages

```sql
SELECT COUNT(*) as total FROM holidays;
SELECT id, title, destination, price FROM holidays;
SELECT * FROM holidays WHERE destination = 'Goa';
```

Or via API:
```bash
curl -X POST http://localhost:3000/api/holiday/search \
  -H "Content-Type: application/json" \
  -d '{"destination": "Goa", "limit": 100}'
```

---

## Tips & Best Practices

✅ Always use HTTPS URLs for images  
✅ Keep descriptions under 200 chars  
✅ Set realistic prices  
✅ Provide at least 3-5 images  
✅ Write detailed itinerary  
✅ Include cancellation policy  
✅ Set best time to visit accurately  
✅ Test on website before publishing  

---

Now you can easily add unlimited holiday packages to your database! 🎉
