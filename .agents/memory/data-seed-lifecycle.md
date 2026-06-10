---
name: Data seed lifecycle
description: How product/category data is reset on startup vs. what persists
---

# Product seed reset on every startup

`server/storage.ts` `initializeData()` runs on every server start and DELETEs all
products + categories, then re-inserts from the in-code seed arrays (`cafeProducts`,
`cafeCategories`).

**Why it matters:** any admin edit to a product (price, photo, `featured`, etc.) is
LOST on the next restart unless the change is also made in the seed array. Defaults
that must survive restarts belong in the seed data, not just the DB.

**How to apply:**
- Persistent per-product defaults → edit the `cafeProducts` seed array.
- For data that must NOT be wiped on restart, use a separate table seeded with
  idempotent SQL. Example: the `settings` table (key/value, holds `popular_mode`)
  is created `IF NOT EXISTS` and seeded with `INSERT ... ON CONFLICT DO NOTHING`,
  so admin changes to it persist across restarts.
- `orders`/`tables` use raw `pool.query`; `products`/`categories`/`settings`-reads
  use Drizzle. New durable columns can be added safely at the top of
  `initializeData()` via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` before reseed.
