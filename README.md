# Olive & Thyme Backend Specification

This document is the backend handoff for the restaurant admin dashboard and customer ordering app in this repository.

The frontend currently uses local fixture data and component state. The backend should provide the persistent, authenticated API described below. The API should be tenant-aware because one backend may serve multiple restaurants.

## Product Scope

The system has two clients:

- **Admin app**: restaurant owner and staff login, dashboard, menu management, order management, table management, and restaurant settings.
- **Customer app**: a customer scans a table QR code, views the restaurant menu, customizes items, places an order, and tracks its status.

The primary flow is:

1. Admin creates a restaurant account and tables.
2. Admin publishes menu categories, items, and add-ons.
3. Backend generates a QR URL for each table.
4. Customer opens the QR URL and receives restaurant and table context.
5. Customer creates an order for that table without creating an account.
6. Admin confirms and progresses the order.
7. Customer sees live order status until the order is served or cancelled.

## Recommended Stack

The backend technology is not prescribed. A practical implementation is:

- Node.js with TypeScript
- Express, Fastify, or NestJS
- PostgreSQL
- Prisma, Drizzle, or another migration-based ORM
- JWT access tokens with refresh tokens for admin users
- Argon2id or bcrypt for password hashing
- S3-compatible object storage for uploaded images
- WebSocket or Server-Sent Events for live order updates

## Environment Variables

Provide a `.env.example` with at least:

```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/restaurant
JWT_ACCESS_SECRET=replace-me
JWT_REFRESH_SECRET=replace-me
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d
CLIENT_ADMIN_URL=http://localhost:5173
CLIENT_CUSTOMER_URL=http://localhost:5174
UPLOAD_PROVIDER=local
UPLOAD_BASE_URL=http://localhost:4000/uploads
```

Never return password hashes, refresh token values, or private account fields in API responses.

## Authentication and Authorization

Admin endpoints require `Authorization: Bearer <access-token>`.

Recommended roles:

- `OWNER`: restaurant account owner; can manage settings, staff, menu, tables, and orders.
- `MANAGER`: can manage menu, tables, and orders.
- `STAFF`: can view and update orders and tables but cannot manage users or restaurant billing settings.

Customer ordering is anonymous. The QR token identifies a table, not a customer. The backend must validate that the token is active and belongs to the requested restaurant before accepting an order.

Use generic login errors such as `Invalid email or password` so the API does not reveal whether an email exists.

## Data Model

All primary keys should be UUIDs. Store money as integer minor units, such as paise or cents, rather than floating point numbers. The frontend currently displays numeric prices; the API may return `priceMinor` and a currency field, or return a decimal string consistently.

### Restaurant

```text
id             uuid primary key
name           string
tagline        string nullable
email          string unique
phone          string nullable
address        string nullable
city           string nullable
logoUrl        string nullable
currency       string, default INR
timezone       string, default Asia/Kolkata
createdAt      timestamp
updatedAt      timestamp
```

### User

```text
id             uuid primary key
restaurantId   uuid foreign key
name           string
email          string
phone          string nullable
passwordHash   string
role           OWNER | MANAGER | STAFF
photoUrl       string nullable
isActive       boolean
createdAt      timestamp
updatedAt      timestamp
```

### Menu Category

```text
id             uuid primary key
restaurantId   uuid foreign key
name           string
sortOrder      integer
isActive       boolean
createdAt      timestamp
updatedAt      timestamp
```

Category names must be stored once and shared by both clients. Do not hard-code separate values such as `Mains` and `Main Course` in the clients.

### Menu Item

```text
id             uuid primary key
restaurantId   uuid foreign key
categoryId     uuid foreign key
name           string
description    string nullable
priceMinor     integer
imageUrl       string nullable
isAvailable    boolean
sortOrder      integer
createdAt      timestamp
updatedAt      timestamp
```

An unavailable item must not be addable to a new customer order. Existing order lines must retain their historical name and price.

### Add-on

```text
id             uuid primary key
restaurantId   uuid foreign key
name           string
priceMinor     integer
isAvailable    boolean
createdAt      timestamp
updatedAt      timestamp
```

Use a join table such as `menu_item_add_ons` to define which add-ons are valid for each menu item.

### Table

```text
id             uuid primary key
restaurantId   uuid foreign key
number         integer unique per restaurant
capacity       integer
status         AVAILABLE | OCCUPIED | RESERVED
qrToken        string unique
isActive       boolean
createdAt      timestamp
updatedAt      timestamp
```

The admin currently expects a table object with `id`, `number`, `capacity`, `status`, and optional current order information. The API can provide `currentOrderNumber` and `currentOrderTotal` as computed fields.

### Order

```text
id             uuid primary key
restaurantId   uuid foreign key
tableId        uuid foreign key
orderNumber    integer, unique per restaurant per day
status         PENDING | CONFIRMED | PREPARING | READY | SERVED | CANCELLED
subtotalMinor  integer
taxMinor       integer
discountMinor  integer
totalMinor     integer
customerNote   string nullable
placedAt       timestamp
confirmedAt    timestamp nullable
servedAt       timestamp nullable
cancelledAt    timestamp nullable
createdAt      timestamp
updatedAt      timestamp
```

### Order Item

```text
id             uuid primary key
orderId        uuid foreign key
menuItemId     uuid foreign key nullable
nameSnapshot   string
unitPriceMinor integer
quantity       integer
lineTotalMinor integer
createdAt      timestamp
```

### Order Item Add-on

```text
id             uuid primary key
orderItemId    uuid foreign key
nameSnapshot   string
priceMinor     integer
quantity       integer
createdAt      timestamp
```

Snapshots are required so menu edits do not change historical orders.

## Order Status Rules

The normal state transition is:

```text
PENDING -> CONFIRMED -> PREPARING -> READY -> SERVED
```

`PENDING` may transition to `CANCELLED`. A `CONFIRMED` order may also be cancelled if the restaurant permits it. `SERVED` and `CANCELLED` are terminal states.

Reject invalid transitions with `409 Conflict`. Every status change should create an `order_status_events` record containing the previous status, new status, actor, and timestamp.

The customer status UI should map these states to four visible steps:

1. Order received (`PENDING`)
2. Order confirmed (`CONFIRMED`)
3. Preparing (`PREPARING`)
4. Ready or served (`READY`, `SERVED`)

## API Conventions

Base URL: `/api/v1`

Use JSON for normal requests and responses. Use `multipart/form-data` or a pre-signed upload flow for images. Dates must be ISO 8601 UTC strings.

Successful collection response:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "fields": {
      "email": "Enter a valid email address."
    },
    "requestId": "request-id"
  }
}
```

Use these status codes: `200` for reads and updates, `201` for creation, `204` for successful deletion with no body, `400` for malformed input, `401` for missing or invalid authentication, `403` for insufficient role, `404` for missing resources, `409` for conflicts, and `422` for validation failures.

## Authentication Endpoints

### `POST /auth/register`

Creates a restaurant and its owner in one transaction.

Request:

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

Validate password confirmation in the client or accept `confirmPassword` and discard it after validation. The backend must still validate the password itself.

### `POST /auth/login`

Request:

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
    "refreshToken": "opaque-or-jwt-refresh-token",
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

Also implement `POST /auth/refresh`, `POST /auth/logout`, and `GET /auth/me`.

## Admin Endpoints

All endpoints in this section require admin authentication and are scoped to the authenticated user's restaurant.

### Restaurant settings

- `GET /restaurant`
- `PATCH /restaurant`
- `POST /restaurant/logo/upload`

Supported settings include name, tagline, email, phone, address, city, logo URL, currency, and timezone.

### Categories

- `GET /menu/categories`
- `POST /menu/categories`
- `PATCH /menu/categories/:categoryId`
- `DELETE /menu/categories/:categoryId`
- `POST /menu/categories/reorder`

Do not delete a category that still contains items unless the request includes a valid replacement category.

### Menu items

- `GET /menu/items?categoryId=&search=&available=&page=&pageSize=`
- `GET /menu/items/:itemId`
- `POST /menu/items`
- `PATCH /menu/items/:itemId`
- `DELETE /menu/items/:itemId`
- `PATCH /menu/items/:itemId/availability`
- `POST /menu/items/:itemId/image/upload`

Create item request:

```json
{
  "name": "Chicken Tikka",
  "description": "Char-grilled chicken with spices",
  "categoryId": "category-uuid",
  "priceMinor": 35000,
  "imageUrl": "https://cdn.example.com/chicken-tikka.jpg",
  "isAvailable": true,
  "addOnIds": ["addon-uuid"]
}
```

The current admin UI supports search, category filtering, availability toggling, adding items, and editing/removing items. These operations must persist after a reload.

### Add-ons

- `GET /menu/add-ons`
- `POST /menu/add-ons`
- `PATCH /menu/add-ons/:addOnId`
- `DELETE /menu/add-ons/:addOnId`

The current customer fixtures include Extra Parmesan, Truffle Oil, and Garlic Bread. These should be normal database records rather than hard-coded frontend data.

### Tables and QR codes

- `GET /tables?search=&status=`
- `GET /tables/:tableId`
- `POST /tables`
- `PATCH /tables/:tableId`
- `DELETE /tables/:tableId`
- `POST /tables/:tableId/regenerate-qr`
- `GET /tables/:tableId/qr`

Create table request:

```json
{
  "number": 12,
  "capacity": 4
}
```

Response fields should include:

```json
{
  "id": "uuid",
  "number": 12,
  "capacity": 4,
  "status": "AVAILABLE",
  "qrUrl": "https://customer.example.com/t/table-token"
}
```

The customer app must read the table token from `/t/:tableToken` and call the public table-context endpoint. The current customer app uses a hard-coded table number, so this integration is required when connecting the real API.

### Orders

- `GET /orders?status=&search=&from=&to=&page=&pageSize=`
- `GET /orders/:orderId`
- `PATCH /orders/:orderId/status`
- `POST /orders/:orderId/cancel`

Status update request:

```json
{
  "status": "PREPARING"
}
```

The admin UI needs order number, table number, status, item names, quantities, prices, total, and timestamps. Return both unit prices and line totals so the UI does not need to infer them.

### Dashboard

- `GET /dashboard/summary`
- `GET /dashboard/sales?from=&to=&interval=day`
- `GET /dashboard/live-orders`

Summary response should include current pending/preparing/ready order counts, today sales, today order count, and active table count. Sales data should be grouped by the requested interval.

## Public Customer Endpoints

These endpoints do not require an admin JWT. They require a valid table token where noted.

### `GET /public/tables/:tableToken/context`

Returns:

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

### `GET /public/tables/:tableToken/menu`

Return only active categories, available menu items, and available add-ons. Preserve category sort order and item sort order.

Example item:

```json
{
  "id": "uuid",
  "name": "Chicken Tikka",
  "description": "Char-grilled chicken with spices",
  "priceMinor": 35000,
  "currency": "INR",
  "category": {
    "id": "uuid",
    "name": "Starters"
  },
  "imageUrl": "https://cdn.example.com/chicken-tikka.jpg",
  "addOns": [
    {
      "id": "uuid",
      "name": "Extra Parmesan",
      "priceMinor": 4000
    }
  ]
}
```

### `POST /public/tables/:tableToken/orders`

Request:

```json
{
  "items": [
    {
      "menuItemId": "menu-item-uuid",
      "quantity": 2,
      "addOnIds": ["add-on-uuid"]
    }
  ],
  "customerNote": "Less spicy"
}
```

The backend must load current prices from the database, validate availability and add-on relationships, calculate totals server-side, and create the order in a transaction. Never trust totals, names, or prices sent by the browser.

Response:

```json
{
  "data": {
    "id": "order-uuid",
    "orderNumber": 1042,
    "tableNumber": 12,
    "status": "PENDING",
    "totalMinor": 74000,
    "currency": "INR",
    "createdAt": "2026-09-25T10:30:00.000Z"
  }
}
```

Use an idempotency key. The customer client should send `Idempotency-Key: <random-uuid>` so retries do not create duplicate orders.

### `GET /public/orders/:orderId`

Return the order status, order number, table number, items, totals, and timestamps. For stronger privacy, require a short-lived order access token returned by the create-order endpoint.

### Live updates

Provide either:

- `GET /public/orders/:orderId/events` using Server-Sent Events, or
- `WS /api/v1/orders/:orderId` using WebSocket.

Publish an event whenever order status changes:

```json
{
  "type": "ORDER_STATUS_CHANGED",
  "orderId": "order-uuid",
  "status": "READY",
  "updatedAt": "2026-09-25T10:45:00.000Z"
}
```

The frontend should fall back to polling every 10 to 15 seconds if live updates are unavailable.

## Validation and Business Rules

- Restaurant email and user email must be normalized to lowercase.
- Table numbers must be positive integers and unique within a restaurant.
- Capacity must be a positive integer.
- Menu prices must be zero or greater; reject floating point money values if the API uses minor units.
- Quantities must be positive integers with a reasonable maximum, such as 99.
- Menu item and add-on IDs must belong to the same restaurant as the table token.
- Only available menu items and add-ons can be ordered.
- An order must contain at least one item.
- Recalculate every subtotal, tax, discount, and total on the server.
- Prevent duplicate orders using the idempotency key.
- Mark a table `OCCUPIED` when it has an active order. Return it to `AVAILABLE` after the active order is served or cancelled, unless it is reserved.
- Do not expose one restaurant's records to another restaurant's authenticated user.
- Rate-limit login and public order creation.
- Log authentication failures, status changes, and order creation with a request ID.

## Frontend Integration Changes

The current frontend is a prototype. The following changes are needed when wiring it to this API:

1. Replace `customer/src/data/menu.js` with `GET /public/tables/:tableToken/menu`.
2. Parse the QR URL `/t/:tableToken`; remove the hard-coded table `12`.
3. Replace random client-side order numbers with `POST /public/tables/:tableToken/orders`.
4. Initialize customer order status from the API response instead of local status `0`.
5. Replace local admin fixtures with authenticated API queries and mutations.
6. Store add-ons per cart line. Cart identity should include the menu item and selected add-on IDs, not only the menu item ID.
7. Use one backend category record so admin and customer category names cannot diverge.
8. Store uploaded images through the backend or object storage rather than sending large browser data URLs in normal JSON requests.
9. Add loading, empty, unauthorized, validation, and server-error states to each API-backed screen.

## CORS and Security

Allow only configured admin and customer origins. Enable HTTPS in production, secure and httpOnly cookies if refresh tokens are cookie-based, CSRF protection for cookie-authenticated mutations, request body limits, schema validation, and security headers.

Public table tokens should be long, random, and revocable. Do not use sequential table IDs as secrets. Do not allow a public user to enumerate tables or orders.

## Database and Background Jobs

Use migrations and seed data for development. Recommended indexes:

- `users(restaurant_id, email)` unique
- `menu_categories(restaurant_id, sort_order)`
- `menu_items(restaurant_id, category_id, is_available)`
- `tables(restaurant_id, number)` unique
- `orders(restaurant_id, status, created_at)`
- `orders(table_id, created_at)`
- `order_status_events(order_id, created_at)`

Optional jobs include expiring old refresh tokens, removing abandoned carts if carts are persisted, generating daily sales summaries, and cleaning unused uploaded images.

## Testing Requirements

At minimum, add:

- Unit tests for order total calculation and status transition rules.
- Integration tests for registration, login, tenant isolation, menu CRUD, table QR context, and order creation.
- Tests proving prices sent by the client are ignored.
- Tests proving unavailable items and invalid add-ons cannot be ordered.
- Tests proving an idempotency key does not create duplicate orders.
- Tests for every allowed and rejected order status transition.
- API schema or contract tests consumed by both frontend apps.
- An end-to-end test: create restaurant, create table, create menu item, scan table context, place order, update status, and read customer status.

## Definition of Done

The backend is ready for frontend integration when:

- Admin can register and log in.
- All menu, table, settings, and order changes persist after reload.
- A QR code opens the correct restaurant and table context.
- A customer can place an order without an account.
- Server-calculated totals and historical order snapshots are correct.
- Admin status changes are reflected in the customer order status.
- Tenant isolation, authentication, validation, rate limiting, and error responses are tested.
- OpenAPI documentation is available for every endpoint in this document.
