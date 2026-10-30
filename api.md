# Restaurant API

Base URL:

```text
http://localhost:4000/api/v1
```

Production base URL:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/v1
```

Interactive documentation is available at `/docs/`. The raw OpenAPI document is available at `/docs.json`.

## Conventions

- Send JSON with `Content-Type: application/json`.
- Dates are ISO 8601 strings.
- Money fields ending in `Minor` are integers in the restaurant currency. For INR, `35000` means Rs 350.00 when the UI formats paise.
- Admin routes require `Authorization: Bearer ACCESS_TOKEN`.
- Every success response uses `{ "data": ... }`, except collection responses, which use `{ "data": [], "pagination": ... }`.
- Errors use `{ "error": { "code", "message", "fields?", "requestId" } }`.
- Customer order creation requires a unique `Idempotency-Key` header.

## Authentication

### Register

`POST /auth/register`

```json
{
  "restaurantName": "Olive & Thyme",
  "restaurantEmail": "restaurant@example.com",
  "phone": "+919999999999",
  "ownerName": "Owner Name",
  "ownerEmail": "owner@example.com",
  "ownerPassword": "strong-password",
  "address": "12 Main Street",
  "city": "Mumbai"
}
```

Returns `201` with the created restaurant and owner. The password is never returned.

### Login

`POST /auth/login`

```json
{
  "email": "owner@example.com",
  "password": "strong-password"
}
```

Response:

```json
{
  "data": {
    "accessToken": "jwt",
    "refreshToken": "opaque-token",
    "user": {
      "id": "uuid",
      "name": "Owner Name",
      "email": "owner@example.com",
      "role": "OWNER",
      "restaurantId": "uuid"
    }
  }
}
```

Use `accessToken` in the `Authorization` header. Store refresh tokens in a secure, httpOnly cookie when possible. Do not expose refresh tokens in logs.

### Refresh, logout, current user

- `POST /auth/refresh` body: `{ "refreshToken": "..." }`; returns a new access and refresh token.
- `POST /auth/logout` body: `{ "refreshToken": "..." }`; returns `204`.
- `GET /auth/me`; returns the authenticated user.

## Restaurant settings

All routes require authentication. `PATCH` requires `OWNER` or `MANAGER`.

- `GET /restaurant`: returns the restaurant object.
- `PATCH /restaurant`: accepts any of `name`, `tagline`, `email`, `phone`, `address`, `city`, `currency`, `timezone`.
- Local-context settings also accept `latitude` and `longitude` as numbers (or both `null` to clear location), and `contextRadiusKm` as an integer from 1 to 50. Coordinates must be a pair within valid geographic bounds. `timezone` must be a valid IANA timezone.
- `POST /restaurant/logo/upload`: multipart form field `file`; returns the updated restaurant with `logoUrl`.

## Menu

All menu routes require authentication. Create/update/delete operations require `OWNER` or `MANAGER`, except availability updates, which are available to authenticated staff.

### Categories

- `GET /menu/categories`
- `POST /menu/categories` body: `{ "name": "Starters", "sortOrder": 0 }`
- `PATCH /menu/categories/:categoryId` body: any of `name`, `sortOrder`, `isActive`
- `DELETE /menu/categories/:categoryId`: only empty categories can be deleted
- `POST /menu/categories/reorder` body: `{ "categoryIds": ["uuid", "uuid"] }`

### Add-ons

- `GET /menu/add-ons`
- `POST /menu/add-ons` body: `{ "name": "Extra Cheese", "priceMinor": 500, "isAvailable": true }`
- `PATCH /menu/add-ons/:addOnId`: accepts any of `name`, `priceMinor`, `isAvailable`
- `DELETE /menu/add-ons/:addOnId`

### Menu items

`POST /menu/items` body:

```json
{
  "name": "Chicken Tikka",
  "description": "Char-grilled chicken with spices",
  "categoryId": "category-uuid",
  "priceMinor": 35000,
  "imageUrl": "https://cdn.example.com/chicken-tikka.jpg",
  "isAvailable": true,
  "sortOrder": 0,
  "variants": [
    { "name": "Small", "priceMinor": 35000 },
    { "name": "Large", "priceMinor": 55000 }
  ],
  "addOnIds": ["add-on-uuid"]
}
```

Endpoints:

- `GET /menu/items?categoryId=&search=&available=&page=1&pageSize=20`
- `GET /menu/items/:itemId`
- `POST /menu/items`
- `POST /menu/items/bulk`: accepts `{ "items": [...] }` with 1–100 standard menu item payloads and creates them transactionally.
- `POST /menu/items/bulk`: accepts `{ "items": [ ... ] }` with 1–100 standard menu item payloads; validates all rows and creates them transactionally.
- `PATCH /menu/items/:itemId`: accepts the menu item fields; `addOnIds` is not changed by this endpoint.
- `DELETE /menu/items/:itemId`
- `PATCH /menu/items/:itemId/availability` body: `{ "isAvailable": false }`
- `POST /menu/items/:itemId/image/upload`: multipart form field `file`; returns `{ "data": { "url": "..." } }`.

A menu item response includes its `category`, `addOns`, and ordered `variants` array. Each variant has an `id`, `name`, `priceMinor`, and `sortOrder`. Customer menus include only active categories, available items, available add-ons, and their variants.

## Tables and QR codes

All routes require authentication. Mutations require `OWNER` or `MANAGER`.

- `GET /tables?search=12&status=AVAILABLE`
- `GET /tables/:tableId`
- `POST /tables` body: `{ "number": 12, "capacity": 4 }`
- `PATCH /tables/:tableId` body: any of `number`, `capacity`, `status`, `isActive`
- `DELETE /tables/:tableId`
- `POST /tables/:tableId/regenerate-qr`
- `GET /tables/:tableId/qr`: returns a QR data URL as plain text

Table responses include `qrToken` and a `qrUrl` similar to:

```text
https://YOUR-CUSTOMER-FRONTEND.vercel.app/t/TABLE_TOKEN
```

## Admin orders

All routes require authentication. Status changes require an authenticated restaurant user.

- `GET /orders?status=&search=&page=1&pageSize=20`
- `GET /orders/:orderId`
- `PATCH /orders/:orderId/status` body: `{ "status": "CONFIRMED" }`
- `POST /orders/:orderId/cancel`

Allowed status transitions:

```text
PENDING -> CONFIRMED -> PREPARING -> READY -> SERVED
PENDING -> CANCELLED
CONFIRMED -> CANCELLED
```

`SERVED` and `CANCELLED` are terminal. Invalid transitions return `409`.

## Dashboard

All routes require authentication.

- `GET /dashboard/summary`: returns pending, preparing, ready counts, today sales, today order count, and active table count.
- `GET /dashboard/sales?from=ISO_DATE&to=ISO_DATE&interval=day`: returns daily sales entries with `date`, `totalMinor`, and `orderCount`.
- `GET /dashboard/live-orders`: returns active orders.
- `GET /dashboard/product-analytics`: returns last-seven-day product sellers, six months of product sales, and a next-day prep estimate based on the previous four matching weekdays. Cancelled orders are excluded.
- `GET /dashboard/insights`: returns the signed-in admin's latest saved assistant messages and whether Gemini is configured.
- `GET /dashboard/insights/summary`: returns restaurant intelligence: seven-day best sellers, thirty-day most/least ordered products, daily sales, yesterday's same-weekday comparison, customer star ratings, prep starting quantities, promotion candidates and demand-decline warnings. No model request is needed.
- `POST /dashboard/insights` body: `{ "question": "Which products are trending this week?" }`; returns a grounded analytics answer, a refreshed `intelligence` summary, and its mode (`gemini`, `local`, or `local-fallback`). Questions are limited to 500 characters and rate-limited.

The assistant summarizes non-cancelled orders from the last 60 days, stores restaurant-scoped evidence and per-admin chat history in Postgres, and uses pgvector cosine retrieval when Gemini is configured. Apply the backend migrations before using the assistant; the migration enables the `vector` extension and adds its context and chat tables. Set `GEMINI_API_KEY` in the backend environment to enable Gemini embeddings and chat. `GEMINI_CHAT_MODEL` and `GEMINI_EMBEDDING_MODEL` can optionally override the defaults. Without a key, or during provider failures, the API responds with question-specific deterministic insights. Unchanged evidence reuses its existing embeddings.

### Intelligence Evidence

- Sales comparisons use complete calendar days in the restaurant timezone and exclude cancelled orders. Order sales include order-level adjustments; product sales use recorded line totals.
- The prep plan uses up to six prior matching weekdays with recorded restaurant trading activity. Dates before an item's introduction and days without any restaurant orders are excluded; zero item sales on a recorded trading day are included. At least three samples are required for a quantity recommendation. The average is rounded up without an invented growth buffer. Low/high values describe observed history, not a prediction interval. The dashboard uses this plan instead of the legacy four-weekday estimate.
- Least-ordered candidates must be currently available and at least 30 days old. Demand-decline warnings require a decrease of at least 30% from a previous week with at least five units. These are batch-size review signals, not measured food waste.
- Promotion candidates require availability, recorded sales, and at least three product ratings averaging 4/5 or higher. This does not establish profitability or guarantee promotion uplift.
- Reviews currently contain star ratings only. Written reviews, stable customer identities, inventory, prepared/leftover quantities, costs, opening schedules, and historical stockouts are not recorded. The assistant must not invent retention lists, actual waste savings, profit, or causal explanations.
- The dashboard refreshes its evidence every minute, on window focus, after a question, or manually. Each question recomputes evidence and updates changed vector documents. More recorded orders and ratings improve the rolling samples; Gemini is not automatically retrained and its forecasts are not guaranteed to become more accurate.

### Weather, Events And Nearby Promotions

The `localContext` field in intelligence summaries includes restaurant location/radius, sourced weather, event-provider coverage, nearby activities, and the latest 100 owner-recorded activities. Set the restaurant coordinates, radius and timezone in Admin Settings. Location is explicit; neither a city name nor the browser's location is silently treated as the restaurant location.

- Open-Meteo supplies daily temperature highs, precipitation and weather codes for the past eight days and next eight days. Past dates are labeled model estimates, not on-site observations. Results use restaurant-local dates. The public endpoint is suitable for local/non-commercial use under the provider's terms; commercial deployments need the appropriate Open-Meteo plan. Set backend `OPEN_METEO_API_KEY` to use its customer endpoint. Attribution is shown in the dashboard.
- Optional backend `TICKETMASTER_API_KEY` enables event discovery using the configured radius and geohash. Get a key at https://developer.ticketmaster.com/. Listed venue coordinates are checked against the radius; cancelled/postponed events and out-of-window listings are excluded. The first 100 provider listings are considered. Coverage varies, particularly for community events and historical dates; an empty feed is not proof that no event occurred.
- Nearby promotions and community events can be owner-recorded with an inclusive start/end date, place, coordinates and optional HTTPS source URL. Their source is labeled `Owner recorded`, not automatically verified. No competing-business offers are fabricated or scraped.
- Provider snapshots are persisted and reused for up to 30 minutes, with failed fetches retried after 5 minutes. Coordinate, radius, timezone or date-window changes invalidate the cache. Source timestamps and unavailable/unconfigured states remain visible.
- The sales explanation compares context for yesterday and its previous matching weekday. Evidence also reaches the assistant's vector context. Weather and overlapping activity are possible associations, not proven causes; they do not add unsupported demand multipliers to prep recommendations.

All activity endpoints require authentication and enforce restaurant isolation. Writes require `OWNER` or `MANAGER`:

- `GET /dashboard/insights/local-activities`: latest 100 owner-recorded entries.
- `POST /dashboard/insights/local-activities`: create an entry.
- `PATCH /dashboard/insights/local-activities/:activityId`: replace the entry's editable fields.
- `DELETE /dashboard/insights/local-activities/:activityId`: delete an entry.

Create/update body:

```json
{
  "kind": "PROMOTION",
  "scope": "nearby",
  "title": "Lunch offer",
  "placeName": "Neighbor cafe",
  "startsOn": "2026-10-23",
  "endsOn": "2026-10-25",
  "latitude": 19.077,
  "longitude": 72.878,
  "sourceUrl": "https://example.com/offer"
}
```

`kind` is `EVENT` or `PROMOTION`; `scope` is `restaurant` or `nearby`. Nearby entries require venue coordinates. `sourceUrl` is optional or null. Apply backend migration `20261023120000_local_context` before using these fields and tables. Provider keys belong only in the backend environment.

## Public customer ordering

These routes do not require an admin token. The customer app gets `tableToken` from the QR URL `/t/:tableToken`.

### Context and menu

- `GET /public/tables/:tableToken/context`
- `GET /public/tables/:tableToken/menu`
- `GET /public/tables/:tableToken/trending`: returns up to five available items with the highest order quantities from the previous 30 days.
- `GET /public/tables/:tableToken/orders`: returns the latest 20 orders for that table, including server-side status and item snapshots.

Context response:

```json
{
  "data": {
    "restaurant": {
      "id": "uuid",
      "name": "Olive & Thyme",
      "tagline": "Kitchen",
      "currency": "INR"
    },
    "table": {
      "id": "uuid",
      "number": 12,
      "capacity": 4
    }
  }
}
```

Menu item responses contain `id`, `name`, `description`, `priceMinor`, `currency`, `imageUrl`, `category`, `addOns`, `rating`, and `ratingCount`. `rating` is the average of ratings on served order lines, or `null` when unrated.

### Create an order

`POST /public/tables/:tableToken/orders`

Headers:

```text
Content-Type: application/json
Idempotency-Key: a-new-uuid-per-cart-submission
```

Body:

```json
{
  "items": [
    {
      "menuItemId": "menu-item-uuid",
      "quantity": 2,
      "variantId": "menu-item-variant-uuid",
      "addOnIds": ["add-on-uuid"]
    }
  ],
  "customerNote": "Less spicy"
}
```

The server loads current item, variant, and add-on prices, checks availability and ownership, calculates totals, creates historical snapshots, and marks the table occupied. `variantId` is required when the item has size variants. Never send or trust client totals, names, or prices.

### Rate a completed order

`POST /public/tables/:tableToken/orders/:orderId/rating` accepts `{ "rating": 5 }`. Ratings are integers from 1 to 5 and are accepted only after the order reaches `SERVED`.

`POST /public/tables/:tableToken/orders/:orderId/items/:orderItemId/rating` accepts the same body and stores a one-time rating for an individual product line. It is also available only after the order reaches `SERVED`.

### Read an order

- `GET /public/orders/:orderId`: returns status, items, totals, table number, and timestamps.
- `GET /public/orders/:orderId/events`: Server-Sent Events stream. The event name is `ORDER_STATUS_CHANGED`; poll every 10 to 15 seconds as a fallback.

Example event:

```text
event: ORDER_STATUS_CHANGED
data: {"type":"ORDER_STATUS_CHANGED","orderId":"uuid","status":"READY","updatedAt":"2026-09-25T10:45:00.000Z"}
```

## Frontend integration sequence

1. Admin calls `/auth/login` and stores the access token in memory.
2. Admin sends `Authorization: Bearer <accessToken>` with protected API calls.
3. On `401`, call `/auth/refresh`, replace both tokens, and retry once. On a second `401`, redirect to login.
4. Customer parses `/t/:tableToken`, calls context and menu, and stores the table token in page state.
5. Cart lines are identified by `menuItemId` plus sorted `addOnIds`.
6. Customer creates an order with a newly generated idempotency key and uses the returned order ID for status tracking.
7. Admin refreshes dashboard/order data after mutations; customer listens to SSE or polls order status.
8. Use `currency` and `priceMinor` from the API; do not hard-code categories, prices, table numbers, or order numbers.

## Error handling

Handle these statuses:

- `400`: malformed request
- `401`: missing or expired authentication
- `403`: role is not allowed
- `404`: resource or table token does not exist
- `409`: duplicate/conflicting data or invalid order transition
- `422`: validation or unavailable menu data
- `429`: rate limit exceeded
- `500`: unexpected server error
- `502`/`503`: storage or dependency unavailable

Use `error.code` for logic and `error.message` for display. Include `error.requestId` when reporting a support issue.
