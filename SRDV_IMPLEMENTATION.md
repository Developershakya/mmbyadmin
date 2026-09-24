# SRDV Implementation Status

This document records the current state of the SRDV implementation as it exists in the codebase right now, after inspection of the active files in this workspace.

## 1) Project architecture related to SRDV

Current architecture is intentionally split into:

- Backend direct routes under `src/app/api/admin-srdv/**`
- Frontend package-builder UI under `src/components/package-builder/**`
- Package persistence under `src/lib/api/packages.js`
- Legacy SRDV helper code remains in old files, but the active implementation no longer depends on it for the admin-srdv routes.

Important rules implemented in the active SRDV route layer:

- Every active SRDV route uses direct `fetch()` to the supplier URL.
- No generic `callSrdv()` or `srdvClient()` style wrapper is used in the active route layer.
- No shared SRDV request wrapper is used for admin-srdv routes.
- Backend returns the supplier payload as-is via `Response.json(data)` or `NextResponse.json(data)` after parsing JSON from the upstream response.
- Frontend adapts to the actual SRDV response shape instead of assuming a DTO layer.
- Official SRDV documentation is treated as source of truth; endpoint names and payload keys are built from the route contract rather than guessed.
- Booking endpoints remain dummy-only for now. Real SRDV booking APIs are not active in this build.

Relevant active route groups:

- `src/app/api/admin-srdv/flights/**`
- `src/app/api/admin-srdv/hotels/**`
- `src/app/api/admin-srdv/buses/**`
- `src/app/api/admin-srdv/cars/**`
- `src/app/api/admin-srdv/dummy-supplier/**`

Relevant frontend consumer files:

- `src/components/package-builder/SearchModals.jsx`
- `src/components/package-builder/FlightResultCard.jsx`
- `src/components/package-builder/FareCalendarStrip.jsx`
- `src/components/package-builder/HotelInfoModal.jsx`
- `src/components/package-builder/HotelRoomModal.jsx`
- `src/components/package-builder/BusSeatModal.jsx`
- `src/app/admin/packages/builder/page.jsx`

## 2) All `/api/admin-srdv/**` routes

### Flight routes

| Route | Purpose |
| --- | --- |
| `POST /api/admin-srdv/flights/search` | Search flights by origin/destination/date/pax |
| `POST /api/admin-srdv/flights/fare-calendar` | Fetch fare calendar for a route/date range |
| `POST /api/admin-srdv/flights/fare-rule` | Fetch fare rules for selected result |
| `POST /api/admin-srdv/flights/fare-quote` | Fetch fare quote for selected result |
| `POST /api/admin-srdv/flights/ssr` | Fetch baggage/meal SSR data |
| `POST /api/admin-srdv/flights/seat-map` | Fetch seat map |
| `POST /api/admin-srdv/flights/book` | Dummy booking endpoint; not live SRDV booking |

### Hotel routes

| Route | Purpose |
| --- | --- |
| `POST /api/admin-srdv/hotels/search` | Search hotels by destination/check-in/check-out |
| `POST /api/admin-srdv/hotels/info` | Fetch hotel info |
| `POST /api/admin-srdv/hotels/room` | Fetch room availability for a hotel |
| `POST /api/admin-srdv/hotels/rooms` | Duplicate room fetch route |
| `POST /api/admin-srdv/hotels/block-room` | Block room at supplier level |
| `POST /api/admin-srdv/hotels/book` | Dummy booking endpoint; not live SRDV booking |

### Bus routes

| Route | Purpose |
| --- | --- |
| `POST /api/admin-srdv/buses/search` | Search buses by source/destination/date |
| `POST /api/admin-srdv/buses/seat-layout` | Fetch seat layout |
| `POST /api/admin-srdv/buses/boarding-points` | Fetch boarding points |
| `POST /api/admin-srdv/buses/block` | Block bus seats |
| `POST /api/admin-srdv/buses/block-seat` | Block a specific seat |
| `POST /api/admin-srdv/buses/book` | Dummy booking endpoint; not live SRDV booking |

### Car routes

| Route | Purpose |
| --- | --- |
| `POST /api/admin-srdv/cars/search` | Search cars by pickup/drop/date/time |
| `POST /api/admin-srdv/cars/book` | Dummy booking endpoint; not live SRDV booking |

### Dummy-supplier routes

| Route | Purpose |
| --- | --- |
| `POST /api/admin-srdv/dummy-supplier/flight/book` | Dummy flight booking payload |
| `POST /api/admin-srdv/dummy-supplier/hotel/book` | Dummy hotel booking payload |
| `POST /api/admin-srdv/dummy-supplier/bus/book` | Dummy bus booking payload |
| `POST /api/admin-srdv/dummy-supplier/car/book` | Dummy car booking payload |

## 3) What each route does

### Flight search

File: `src/app/api/admin-srdv/flights/search/route.js`

- Reads JSON body.
- Validates `origin`, `destination`, `departureDate`, passenger numbers.
- Builds a POST payload to `${SRDV_FLIGHT_BASE_URL || SRDV_FLIGHT_URL || 'https://flight.srdvapi.com/v8/rest'}/Search`.
- Sends headers with `Content-Type`, `Accept`, optional `Api-Token`, `ClientId`, `UserName`, `Password`, `EndUserIp`.
- Returns raw JSON result from SRDV.

### Flight fare calendar

File: `src/app/api/admin-srdv/flights/fare-calendar/route.js`

- Validates origin, destination, date.
- Calls `${...}/GetCalendarFare`.
- Payload includes `JourneyType`, `FareType`, `Segments[]` with `Origin`, `Destination`, `FlightCabinClass`, `PreferredDepartureTime`.
- Returns raw JSON from SRDV.

### Flight fare rule

File: `src/app/api/admin-srdv/flights/fare-rule/route.js`

- Validates `srdvType`, `srdvIndex`, `traceId`, `resultIndex`.
- Calls `${...}/GetFareRule`.
- Payload is `{ SrdvType, SrdvIndex, TraceId, ResultIndex }`.
- Returns raw JSON.

### Flight fare quote

File: `src/app/api/admin-srdv/flights/fare-quote/route.js`

- Same validation as fare rule.
- Calls `${...}/GetFareQuote`.
- Returns raw JSON.

### Flight SSR

File: `src/app/api/admin-srdv/flights/ssr/route.js`

- Validates same identifiers.
- Calls `${...}/GetSSR`.
- Returns raw JSON.

### Flight seat map

File: `src/app/api/admin-srdv/flights/seat-map/route.js`

- Validates same identifiers.
- Calls `${...}/GetSeatMap`.
- Returns raw JSON.

### Flight booking dummy

File: `src/app/api/admin-srdv/flights/book/route.js`

- Returns a dummy success record, not a live SRDV booking.
- Message explicitly says live SRDV flight booking is intentionally disabled.

### Hotel search

File: `src/app/api/admin-srdv/hotels/search/route.js`

- Validates destination, checkIn, checkOut.
- Builds hotel payload with `Destination`, `CheckInDate`, `CheckOutDate`, `NoOfRooms`, `RoomGuests`, `GuestNationality`, `Rating`.
- Calls `${...}/Search`.
- Returns raw JSON.

### Hotel info

File: `src/app/api/admin-srdv/hotels/info/route.js`

- Validates `hotelCode`.
- Calls `${...}/GetHotelInfo`.
- Payload includes `HotelCode`, optional `TraceId`, optional `ResultIndex`.
- Returns raw JSON.

### Hotel room(s)

Files:

- `src/app/api/admin-srdv/hotels/room/route.js`
- `src/app/api/admin-srdv/hotels/rooms/route.js`

- Validate hotelCode, checkIn, checkOut.
- Calls `${...}/GetHotelRoom`.
- Payload includes `HotelCode`, `CheckInDate`, `CheckOutDate`, `NoOfRooms`, `RoomGuests`, `GuestNationality`.
- Returns raw JSON.

### Hotel block room

File: `src/app/api/admin-srdv/hotels/block-room/route.js`

- Validates `hotelCode` and `roomCode`.
- Calls `${...}/BlockRoom`.
- Returns raw JSON.

### Hotel booking dummy

File: `src/app/api/admin-srdv/hotels/book/route.js`

- Returns dummy success object.

### Bus search

File: `src/app/api/admin-srdv/buses/search/route.js`

- Validates `from`, `to`, `date`.
- Calls `${...}/Search`.
- Payload includes `Source`, `Destination`, `TravelDate`, `NoOfPassengers`.
- Returns raw JSON.

### Bus seat layout

File: `src/app/api/admin-srdv/buses/seat-layout/route.js`

- Validates `busId`.
- Calls `${...}/GetSeatLayout`.
- Payload includes `BusId`, `TraceId`, `ResultIndex`.
- Returns raw JSON.

### Bus boarding points

File: `src/app/api/admin-srdv/buses/boarding-points/route.js`

- Validates `busId`.
- Calls `${...}/GetBoardingPoints`.
- Payload includes `BusId`, `TraceId`, `ResultIndex`.
- Returns raw JSON.

### Bus block

Files:

- `src/app/api/admin-srdv/buses/block/route.js`
- `src/app/api/admin-srdv/buses/block-seat/route.js`

- Validates `busId`, `seatNumber`.
- Calls `${...}/BlockSeat`.
- Returns raw JSON.

### Bus booking dummy

File: `src/app/api/admin-srdv/buses/book/route.js`

- Returns dummy success object.

### Car search

File: `src/app/api/admin-srdv/cars/search/route.js`

- Validates `pickup`, `drop`, `date`, `time`.
- Calls `${...}/Search`.
- Payload includes `PickupLocation`, `DropLocation`, `PickupDate`, `PickupTime`, `PassengerCount`, `VehicleType`.
- Returns raw JSON.

### Car booking dummy

File: `src/app/api/admin-srdv/cars/book/route.js`

- Returns dummy success object.

## 4) Official SRDV documentation URLs being used

There are no doc-page URLs hardcoded in the repository itself. The active implementation uses the live base endpoint domains and route suffixes as the implementation source of truth:

- Flight base: `https://flight.srdvapi.com/v8/rest`
- Hotel base: `https://hotel.srdvapi.com/v5/rest`
- Bus base: `https://bus.srdvapi.com/v5/rest`
- Car base: `https://car.srdvapi.com/v8/rest`

The route suffixes appended to those bases are the documented SRDV method names used by the code: `Search`, `GetCalendarFare`, `GetFareRule`, `GetFareQuote`, `GetSSR`, `GetSeatMap`, `GetHotelInfo`, `GetHotelRoom`, `GetSeatLayout`, `GetBoardingPoints`, `BlockRoom`, `BlockSeat`.

The older repo also contains legacy references such as `flight.srdvtest.com`, `bus.srdvtest.com`, etc., but the currently active admin-srdv routes use the production-style base URLs from `SRDV_*_BASE_URL` / `SRDV_*_URL` variables and the route names above.

## 5) Exact documented endpoint used by each route

This is the concrete endpoint built by the current code:

- Flight Search: `${SRDV_FLIGHT_BASE_URL || SRDV_FLIGHT_URL || 'https://flight.srdvapi.com/v8/rest'}/Search`
- Flight Fare Calendar: `${...}/GetCalendarFare`
- Flight Fare Rule: `${...}/GetFareRule`
- Flight Fare Quote: `${...}/GetFareQuote`
- Flight SSR: `${...}/GetSSR`
- Flight Seat Map: `${...}/GetSeatMap`
- Hotel Search: `${SRDV_HOTEL_BASE_URL || SRDV_HOTEL_URL || 'https://hotel.srdvapi.com/v5/rest'}/Search`
- Hotel Info: `${...}/GetHotelInfo`
- Hotel Room: `${...}/GetHotelRoom`
- Bus Search: `${SRDV_BUS_BASE_URL || SRDV_BUS_URL || 'https://bus.srdvapi.com/v5/rest'}/Search`
- Bus Seat Layout: `${...}/GetSeatLayout`
- Bus Boarding Points: `${...}/GetBoardingPoints`
- Car Search: `${SRDV_CAR_BASE_URL || SRDV_CAR_URL || 'https://car.srdvapi.com/v8/rest'}/Search`

## 6) HTTP method

Every real SRDV route in `src/app/api/admin-srdv/**` uses:

- `POST` for all production SRDV calls

Dummy booking endpoints also use `POST`.

## 7) Required headers/authentication

The active routes use this header pattern:

```js
{
  'Content-Type': 'application/json',
  Accept: 'application/json',
  ...(process.env.SRDV_API_TOKEN ? { 'Api-Token': process.env.SRDV_API_TOKEN } : {}),
  ...(process.env.SRDV_CLIENT_ID ? { ClientId: process.env.SRDV_CLIENT_ID } : {}),
  ...(process.env.SRDV_USERNAME ? { UserName: process.env.SRDV_USERNAME } : {}),
  ...(process.env.SRDV_PASSWORD ? { Password: process.env.SRDV_PASSWORD } : {}),
  ...(process.env.SRDV_END_USER_IP ? { EndUserIp: process.env.SRDV_END_USER_IP } : {}),
}
```

This is the real pattern used by all direct routes.

## 8) Request payload structure

### Flight Search payload

```json
{
  "AdultCount": 1,
  "ChildCount": 0,
  "InfantCount": 0,
  "JourneyType": 1,
  "DirectFlight": false,
  "Segments": [
    {
      "Origin": "DEL",
      "Destination": "BOM",
      "FlightCabinClass": 1,
      "PreferredDepartureTime": "2026-10-15T00:00:00"
    }
  ]
}
```

### Flight Fare Calendar payload

```json
{
  "JourneyType": 1,
  "FareType": "Published",
  "Segments": [
    {
      "Origin": "DEL",
      "Destination": "BOM",
      "FlightCabinClass": 1,
      "PreferredDepartureTime": "2026-10-15T00:00:00"
    }
  ]
}
```

### Flight follow-up identifiers payloads

```json
{ "SrdvType": "...", "SrdvIndex": "...", "TraceId": "...", "ResultIndex": "..." }
```

Used for:

- `GetFareRule`
- `GetFareQuote`
- `GetSSR`
- `GetSeatMap`

### Hotel Search payload

```json
{
  "Destination": "Manali",
  "CheckInDate": "2026-10-15T00:00:00",
  "CheckOutDate": "2026-10-17T00:00:00",
  "NoOfRooms": 1,
  "RoomGuests": [
    { "NoOfAdults": 2, "NoOfChild": 0, "ChildAge": [] }
  ],
  "GuestNationality": "IN",
  "Rating": 0
}
```

### Hotel Info payload

```json
{
  "HotelCode": "...",
  "TraceId": "...",
  "ResultIndex": "..."
}
```

### Hotel Room payload

```json
{
  "HotelCode": "...",
  "CheckInDate": "2026-10-15T00:00:00",
  "CheckOutDate": "2026-10-17T00:00:00",
  "NoOfRooms": 1,
  "RoomGuests": [
    { "NoOfAdults": 2, "NoOfChild": 0, "ChildAge": [] }
  ],
  "GuestNationality": "IN"
}
```

### Bus Search payload

```json
{
  "Source": "DELHI",
  "Destination": "MANALI",
  "TravelDate": "2026-10-15T00:00:00",
  "NoOfPassengers": 1
}
```

### Bus seat/boarding payload

```json
{
  "BusId": "...",
  "TraceId": "...",
  "ResultIndex": "..."
}
```

### Car Search payload

```json
{
  "PickupLocation": "Delhi",
  "DropLocation": "Manali",
  "PickupDate": "2026-10-15T00:00:00",
  "PickupTime": "09:00",
  "PassengerCount": 1,
  "VehicleType": "Any"
}
```

## 9) Frontend payload → SRDV payload mapping

This is the actual mapping used by the frontend package-builder.

### Flight Search mapping

Source: `src/components/package-builder/SearchModals.jsx`

Frontend request body:

```json
{
  "origin": "DEL",
  "destination": "BOM",
  "departureDate": "2026-10-15",
  "adultCount": 2,
  "childCount": 0,
  "infantCount": 0,
  "directFlight": false,
  "flightCabinClass": 2
}
```

SRDV route builds:

```json
{
  "AdultCount": 2,
  "ChildCount": 0,
  "InfantCount": 0,
  "JourneyType": 1,
  "DirectFlight": false,
  "Segments": [{ "Origin": "DEL", "Destination": "BOM", "FlightCabinClass": 2, "PreferredDepartureTime": "2026-10-15T00:00:00" }]
}
```

### Hotel Search mapping

Frontend request body can be an object with `destination`, `checkIn`, `checkOut`, etc., and the route transforms it to SRDV form:

```json
{
  "Destination": "Manali",
  "CheckInDate": "2026-10-15T00:00:00",
  "CheckOutDate": "2026-10-17T00:00:00",
  "NoOfRooms": 1,
  "RoomGuests": [{ "NoOfAdults": 2, "NoOfChild": 0, "ChildAge": [] }],
  "GuestNationality": "IN",
  "Rating": 0
}
```

### Bus Search mapping

```json
{
  "Source": "Delhi",
  "Destination": "Manali",
  "TravelDate": "2026-10-15T00:00:00",
  "NoOfPassengers": 1
}
```

### Car Search mapping

```json
{
  "PickupLocation": "Delhi",
  "DropLocation": "Manali",
  "PickupDate": "2026-10-15T00:00:00",
  "PickupTime": "09:00",
  "PassengerCount": 1,
  "VehicleType": "Any"
}
```

## 10) Actual SRDV response structure

The backend routes do not transform SRDV responses. They return the JSON body returned by the supplier as-is. In practice, the frontend reads arrays by searching object keys like `Results`, `SearchResults`, `Flights`, `Hotels`, `Buses`, etc. using `normalizeApiResults()` in `SearchModals.jsx`.

Examples of what the frontend expects from live SRDV:

- Flight search: `SearchResults`, `results`, or flattened arrays inside response object
- Hotel search: `HotelResults`, `Results`, or nested `data` arrays
- Bus search: `SearchResults` or nested `data`
- Car search: route-level search results object for `Search`

The route layer itself does not enforce a DTO, and the UI later normalizes the returned object to find arrays.

## 11) How the frontend consumes the response

### Flight result consumption

- `SearchModals.jsx` calls `/api/admin-srdv/flights/search`.
- Parses JSON and calls `normalizeApiResults(flightData, ["Results", "results"])`.
- Sets `results` state to the normalized array.
- `FlightResultCard.jsx` renders the selected result.

### Fare calendar consumption

- `FareCalendarStrip.jsx` reads `data?.SearchResults || data?.data?.SearchResults || data?.fares || []`.
- Extracts `DepartureDate`, `TotalFare`, `AirlineCode`.
- Shows the cheap fare strip.

### Fare rule consumption

- `FlightResultCard.jsx` calls `fetchFareRuleApi()`.
- Reads raw rule text from:
  - `res?.FareRules?.[0]?.FareRuleDetail`
  - `res?.data?.FareRules?.[0]?.FareRuleDetail`
  - `res?.fareRuleDetail`
- Parses it into a UI-friendly object in `parseFareRulesText()`.

### Hotel info consumption

- `HotelInfoModal.jsx` reads `res?.HotelDetails || res?.data?.HotelDetails || res?.hotel`
- Extracts `HotelName`, `StarRating`, `Address`, `Facilities`, `Images`

### Hotel room consumption

- `HotelRoomModal.jsx` reads `res?.GetHotelRoomResult?.HotelRoomsDetails || res?.data?.GetHotelRoomResult?.HotelRoomsDetails || res?.rooms`
- Displays room options and calculates total fare per room quantity.

### Bus seating consumption

- `BusSeatModal.jsx` reads `layoutRes.value?.SeatLayout?.Seats || layoutRes.value?.data?.SeatLayout?.Seats`.
- Reads boarding/dropping points from `BoardingPoints` / `DroppingPoints` fields.
- Allows seat selection and save-back to package data.

## 12) Error handling

The active implementation includes several error patterns:

- Validation errors: missing required fields return `400` with JSON like `{ error: 'Missing required field: origin' }`
- Invalid date format returns `400`
- Fetch errors catch and return `500` with `{ error: 'SRDV request failed', message: ... }`
- If the upstream fetch fails or the response is not valid JSON, the route returns an error JSON object
- `FlightSearchModal` also shows the special IP issue handling for SRDV Error 900, where it sets `ipErrorInfo` and shows a whitelist request message

Current front-end known issue text in the app:

- `SRDV Error 900: Server IP (34.34.254.22) not in SRDV whitelist`
- `Server Outbound IP to Whitelist: 34.34.254.22`
- `Registered Office IP: 122.161.76.198`

This is not a fake/mock error; it is a real handling path in the app.

## 13) Required identifiers such as TraceId, SrdvType, SrdvIndex, ResultIndex, HotelCode, RouteId, etc.

These are required in follow-up calls per current route implementation:

- Flight continuation calls require:
  - `srdvType`
  - `srdvIndex`
  - `traceId`
  - `resultIndex`

- Hotel room/info calls require:
  - `hotelCode`
  - optional `traceId`
  - optional `resultIndex`

- Bus seat/boarding calls require:
  - `busId`
  - optional `traceId`
  - optional `resultIndex`

- Hotel block room requires:
  - `hotelCode`
  - `roomCode`

- Bus block seat requires:
  - `busId`
  - `seatNumber`

## 14) Flight Search → Fare Calendar → Fare Rule → Fare Quote → SSR → Seat Map flow

This is the current intended flow:

1. `FlightSearchModal` searches with `/api/admin-srdv/flights/search`
2. Result card can fetch `/api/admin-srdv/flights/fare-calendar` for nearby date fare comparison
3. When user opens fare details, `FlightResultCard` requests `/api/admin-srdv/flights/fare-rule`
4. Fare quote can be requested via `/api/admin-srdv/flights/fare-quote`
5. Fare/seat options can request baggage and meal data via `/api/admin-srdv/flights/ssr`
6. Seat selection calls `/api/admin-srdv/flights/seat-map`

Required identifiers are passed from the selected search result into subsequent calls.

## 15) Hotel Search → Hotel Info → Hotel Rooms flow

Current flow:

1. `HotelSearchModal` searches with `/api/admin-srdv/hotels/search`
2. User picks a hotel
3. `HotelInfoModal` calls `/api/admin-srdv/hotels/info` with `hotelCode`
4. `HotelRoomModal` calls `/api/admin-srdv/hotels/room` or `/api/admin-srdv/hotels/rooms` with `hotelCode`, dates, guests
5. Room selection gets saved to the itinerary service data

## 16) Bus Search → Seat Layout → Boarding Points flow

Current flow:

1. `BusSearchModal` searches with `/api/admin-srdv/buses/search`
2. `BusSeatModal` calls `fetchBusSeatLayoutApi()` and `fetchBusBoardingDetailsApi()` in parallel
3. Seat selection is saved to the builder state
4. Boarding point and dropping point are stored with the selected service data

## 17) Car Search flow

Current flow:

1. `CabSearchModal` searches with `/api/admin-srdv/cars/search`
2. Selected car is stored as service data in the package builder state
3. Car booking remains dummy-only; no live SRDV booking route is active

## 18) Package Builder save/edit/re-save data flow

This is the actual general flow in the package builder:

- `src/app/admin/packages/builder/page.jsx` owns package state
- `handleSavePackage()` builds a payload and calls `savePackage(payload)` from `src/lib/api/packages.js`
- `savePackage()` uses `fetch('/api/packages'...)` or `fetch(`/api/packages/${id}`, { method: 'PUT' })`
- The saved JSON includes package-level metadata plus itinerary data and pricing breakdown
- Re-open or edit flows call `fetchPackageById()` and restore state via `parsePackageIntoState()`

The actual save payload includes fields like:

- `title`, `city`, `destination`, `originCity`, `travelers`
- `days`, `itineraryData`, `pricingBreakdown`
- `status`, `policyVisibility`, `priceBreakdownVisibility`
- `inclusions`, `exclusions`, `terms`, `cancellationPolicy`, `dateChangePolicy`
- `customization`, `referenceId`, `tripId`

## 19) Which SRDV data is persisted in the package

The package stores service objects selected from SRDV results, not the complete raw supplier payload in a normalized DTO layer. The actual persisted selections generally include:

- flight object: airline, airport codes, departure time, fare, taxes, airline code, flight number, etc.
- hotel object: hotel name, hotel code, star rating, room details, price, meal plan, policy text
- bus object: route, operator name, bus type, travel date, seat selection, boarding/dropping point
- cab object: car name/category, pickup/drop fields, price and trip data

The exact fields are preserved in the selected service `data` object for each day/service entry, then saved as part of the package JSON.

The raw upstream SRDV response is not persisted as a single opaque blob; instead, the builder stores the fields it needs for display and later re-rendering.

## 20) Current implementation status

### Completed

- Route-layer cleanup for admin-srdv direct fetch pattern
- Direct routes for flight/hotel/bus/car search and follow-up calls exist
- Frontend package-builder calls directly to `/api/admin-srdv/**` routes
- Response parsing and array normalization exists in `SearchModals.jsx`
- PDF import path fix applied for package builder files
- Route-specific validation checks added for required fields and dates

### In Progress

- Live SRDV route validation against real credentials and upstream responses
- Full end-to-end package-builder validation for flight, hotel, bus, car flows
- Final verification of build/runtime state after the earlier environment-specific build issue

### Pending

- Real SRDV live successful responses for all core route flows
- Validation that each supplier API returns the exact documented payload names for this client account
- Final confirmation of IP whitelist status for production SRDV access
- Real booking flow activation

### Known Errors

- Build had a missing import issue: `../../lib/pdfGenerator.js` did not exist; actual file is `src/lib/pdf/pdfGenerator.js`.
- After fixing those imports, the build hit a Windows/OneDrive filesystem permission issue when Next.js tried to write `.next/trace` (`EPERM: operation not permitted`).
- SRDV Error 900 is a real operational issue in the current code path when the server outbound IP is not whitelisted by SRDV.
- Dummy booking endpoints exist and return dummy data, but they are intentionally not real SRDV booking APIs.

### Next Exact Step

1. Remove stale `.next` artifacts and rerun the production build on the current machine to confirm whether the `EPERM` issue is filesystem-specific or resolved.
2. Test each route with a real request using the configured SRDV credentials and the live account.
3. Verify actual response shape for each supplier route before adjusting frontend assumptions.
4. Only after a successful live response for each route should any frontend response adaptation be considered final.

## 21) Successfully tested APIs

At the code level, the following were verified structurally in the repo:

- Route files exist and use direct `fetch()`
- Response object is returned to frontend as JSON
- Build-level import resolution for the PDF helper was fixed

At the live SRDV level, there is no confirmed successful supplier response recorded in the current session. No production SRDV API call is documented as successfully validated in this file.

## 22) APIs that still need testing

These are still unverified live calls:

- `POST /api/admin-srdv/flights/search`
- `POST /api/admin-srdv/flights/fare-calendar`
- `POST /api/admin-srdv/flights/fare-rule`
- `POST /api/admin-srdv/flights/fare-quote`
- `POST /api/admin-srdv/flights/ssr`
- `POST /api/admin-srdv/flights/seat-map`
- `POST /api/admin-srdv/hotels/search`
- `POST /api/admin-srdv/hotels/info`
- `POST /api/admin-srdv/hotels/room`
- `POST /api/admin-srdv/hotels/rooms`
- `POST /api/admin-srdv/buses/search`
- `POST /api/admin-srdv/buses/seat-layout`
- `POST /api/admin-srdv/buses/boarding-points`
- `POST /api/admin-srdv/cars/search`

Booking routes remain dummy-only and are not live SRDV booking tests.

## 23) Current errors/issues

- `.next/trace` write permission failure on this Windows/OneDrive environment
- Missing legacy PDF import path in package builder modules was fixed after inspection
- Live SRDV calls may fail with IP authorization errors (Error 900)
- Front-end assumes key names based on common supplier shape; this must be validated against the actual SRDV responses before finalizing UI behavior
- No verified live response contract for every route is yet recorded

## 24) Frontend components that were changed

- `src/components/package-builder/SearchModals.jsx`
- `src/components/package-builder/FlightResultCard.jsx`
- `src/components/package-builder/FareCalendarStrip.jsx`
- `src/components/package-builder/HotelInfoModal.jsx`
- `src/components/package-builder/HotelRoomModal.jsx`
- `src/components/package-builder/BusSeatModal.jsx`
- `src/app/admin/packages/builder/page.jsx`
- `src/components/package-builder/CustomerPreviewView.jsx`
- `src/components/package-builder/PublishView.jsx`
- `src/components/package-builder/TravelProPackageBuilder.jsx`

These were adjusted for actual SRDV response handling and package-builder usage.

## 25) Old/legacy SRDV code that was removed or not used

This project still contains legacy SRDV helpers in older files, but the active route layer was not allowed to rely on them. Examples include:

- `src/lib/srdvApi.js`
- `src/lib/srdvService.js`
- `src/lib/srdv/flightService.js`
- `src/lib/srdv/hotelService.js`
- `src/lib/srdv/busService.js`
- `src/lib/srdv/carService.js`

The active admin-srdv route layer is not built around these helpers. The legacy `callSrdvApi`, `callSrdvApiForm`, `srdvClient`, `srdvProvider`, `srdvService` style patterns are not the active implementation path for these routes.

## 26) Important constraints that MUST NOT be violated

The following rules are in effect for this implementation:

- Every SRDV route must use direct `fetch()`.
- No generic SRDV helper.
- No `callSrdv()`.
- No `srdvClient()`.
- No `srdvProvider()`.
- No `srdvService()`.
- No shared SRDV request wrapper.
- No response transformation.
- No DTO.
- No fake/mock SRDV data.
- Backend must return actual SRDV response unchanged.
- Frontend must adapt to actual SRDV response.
- Official SRDV documentation is source of truth.
- Never guess endpoint or payload.
- Search/selection APIs must use real SRDV.
- Booking may remain dummy for now.

# CURRENT STATUS

## Completed

- Direct fetch routes for all admin-srdv search/follow-up endpoints are in place.
- Frontend package-builder is wired to those routes.
- Legacy route-helper layer was not used in the active admin-srdv implementation.
- PDF import issue in the package builder was corrected.

## In Progress

- Live verification of each SRDV route against real supplier responses.
- Final frontend adaptation to actual SRDV objects from each supplier.
- Build validation in this environment.

## Pending

- Real SRDV supplier success proof for each route.
- Final production IP whitelist validation.
- Real booking activation.

## Known Errors

- `EPERM` while writing `.next/trace` on this machine.
- SRDV Error 900 due to server IP not whitelisted.
- Dummy booking endpoints are active by design; they are not real supplier booking APIs.

## Next Exact Step

After this handoff, the next exact step is:

1. Clear `.next` and rerun `npm run build` to isolate whether the `EPERM` issue is a local filesystem problem or a code build issue.
2. Run each SRDV admin route individually with the real SRDV credentials and confirm actual response structure, field names, and identifiers.
3. Compare every frontend consumer against the real response object before calling the flow complete.
4. Only then mark the live integration as validated and proceed to final booking activation if the docs and account allow it.
