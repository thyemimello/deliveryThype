---
name: WhatsApp messaging constraints & patterns
description: How this app sends WhatsApp messages (wa.me click-to-chat) and the phone/image conventions that follow from its limits.
---

# WhatsApp messaging in this app

All outbound WhatsApp uses **wa.me click-to-chat links** (`https://wa.me/<number>?text=<encoded>`), opened in a new tab — there is no WhatsApp Business/Cloud API integration.

## Phone number format
- **Always prepend Brazil country code `55`** when building wa.me links, or the chat won't open.
- Heuristic used: digits-only; if `length <= 11` prepend `55`, else assume it already has the country code. This correctly handles DDD 55 (Rio Grande do Sul) 11-digit numbers.
- Contacts/orders may store phones with formatting; normalize to digits for both lookup/dedup and wa.me.

## Images cannot be attached
- **wa.me links cannot attach image files — only pre-filled text.**
- Workaround (used by the "Campanha" tab): host the uploaded image on the server and append its **absolute** URL (`window.location.origin + /uploads/<file>`) into the message text. WhatsApp renders a link preview; recipient taps to view.
- **Why:** the user asked to "send an image"; true auto-attach is impossible without the Business API (opt-in/templates/Meta setup) — disproportionate for a small café. The link-preview approach is the standard practical fallback.
- **Durability caveat:** uploaded images live on local disk under `<cwd>/uploads` served via `express.static` registered in `registerRoutes` (before the SPA catch-all). Replit deployment disk can be ephemeral across redeploys, so old campaign image links may break later. Acceptable because campaigns are sent immediately after upload.

## Body-size limit pattern
- Base64 image uploads need a larger JSON body limit, but raising it globally widens DoS surface on public endpoints.
- Pattern: global `express.json` middleware **skips** `/api/admin/upload` (`if (req.path === "/api/admin/upload") return next()`); the upload route adds its own `express.json({ limit: "12mb" })` **after** `requireAdmin`, so large bodies are only parsed for authenticated admins.

## Order status notifications to customer
- Customer order tracking page (`/pedido/:id`) polls every ~8s, so admin status changes appear automatically *if the page stays open* (customer is redirected there right after checkout).
- For a proactive nudge, the admin "advance status" / "cancel" buttons also open a wa.me link pre-filled with a friendly status message + the tracking link (delivery orders only; one click → opens WhatsApp + advances status, so no popup blocking).

## Perceived "data not saving" is usually refetch timing
- **Why:** orders DO persist and contacts DO auto-save (with digit-normalized dedup), but the admin panel felt "broken" because lists refetched slowly/never.
- **How to apply:** before debugging the backend for "order/contact didn't save", verify the DB directly (`node -e` + pg). If the row is there, the fix is React Query refetch config (`refetchInterval`, `refetchOnWindowFocus`, `refetchOnMount`) — admin orders 8s, contacts 15s (only enabled on contacts/campaign tab).
