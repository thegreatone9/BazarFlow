# 🛒 BazarFlow

**Real-time street vendor map for Dhaka, Bangladesh.**

BazarFlow helps you find small street vendors (vegetables, fruits, eggs, chicken) near you in real time. Vendors check in with their location and what they're selling — the marker appears on your map and disappears when they're no longer active.

---

## The Problem

In Dhaka, millions of people buy daily groceries from small, informal street vendors — pushcarts, bicycle sellers, and sidewalk stands. These vendors have no fixed location. They move through neighborhoods at different times of the day, and customers rely on word of mouth or luck to find them.

**BazarFlow** makes this discoverable. If a vendor checks in, anyone nearby can see what's available and where.

## How It Works

1. **Vendor checks in** — submits their location + what they're selling (potato, onion, egg, chicken, greens, fruit).
2. **Marker appears** — an emoji marker pops up on the map at their coordinates.
3. **Live only** — markers expire after 4 hours. If a vendor hasn't refreshed, they disappear automatically.
4. **Search & browse** — users can search for any area, or use GPS to center the map on their current location.

---

## Features

| Feature | Description |
|---------|-------------|
| 🗺️ **Interactive Map** | Leaflet.js map centered on Dhaka with a ~5km max viewing area |
| 🔍 **Location Search** | Nominatim-powered geocoding — search any area and fly there |
| 📍 **GPS Locate** | One-tap GPS positioning with blue pulsing dot |
| 🎯 **Recenter** | Fly back to your last searched location |
| 🥔🧅🥚🍗🥬🥭 **Category Legend** | Six vendor categories with emoji markers |
| 🌐 **Bilingual** | Toggle between English and Bangla (বাংলা) for all UI labels |
| ⚡ **Real-time Updates** | Supabase real-time subscriptions for new vendor check-ins |
| ⏰ **Auto-expiry** | Stale markers pruned every 60 seconds |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7 |
| **State Management** | Redux Toolkit (markers, location, UI slices) |
| **Map** | Leaflet.js with OpenStreetMap tiles |
| **Geocoding** | OpenStreetMap Nominatim API (free, no key required) |
| **Backend** | Supabase (PostgreSQL + real-time subscriptions) |
| **Styling** | Tailwind CSS v4 + custom CSS (glassmorphism, dark theme) |

---

## Project Structure

```
BazarFlow/
├── index.html                  # Entry HTML
├── package.json
├── vite.config.js
├── sample_data/
│   └── vendors.json            # Mock vendor data (edit to test)
└── src/
    ├── main.jsx                # React root + Redux Provider
    ├── App.jsx                 # Component tree layout
    ├── store.js                # Redux store (markers, location, ui)
    ├── map.js                  # Leaflet setup, categories, markers
    ├── supabase.js             # Supabase client (currently mocked)
    ├── index.css               # All styles, design tokens, animations
    └── components/
        ├── MapView.jsx         # Map container + marker sync
        ├── SearchBar.jsx       # Location search with Nominatim
        ├── Legend.jsx          # Category legend (EN/BN)
        ├── BottomBar.jsx       # Category filter chips
        ├── FloatingButtons.jsx # FABs: language, recenter, locate
        ├── StatusBar.jsx       # Live/Offline indicator
        └── Toast.jsx           # Toast notifications
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Install & Run

```bash
# Clone the repo
git clone <repo-url>
cd BazarFlow

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Mock Data (Development Mode)

The app currently runs with **mock data** instead of a live Supabase backend. Vendor markers are loaded from:

```
sample_data/vendors.json
```

Each vendor entry looks like this:

```json
{
    "id": "v001",
    "lat": 23.8103,
    "lng": 90.4125,
    "category": "potato",
    "vendor_name": "Karim Alu Wala",
    "created_at": "2026-02-28T06:00:00Z",
    "valid_until": "2026-12-31T23:59:59Z",
    "status": "active"
}
```

**To experiment:** edit `vendors.json`, change coordinates or categories, save, and refresh the browser.

---

## Connecting to Supabase (Production)

When ready to go live, open `src/supabase.js` and:

1. Uncomment the original Supabase code at the bottom of the file.
2. Remove or comment out the mock functions at the top.
3. Replace the placeholder credentials:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### Required Table Schema

Create a `markers` table in Supabase with:

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key, auto-generated |
| `lat` | `float8` | Latitude |
| `lng` | `float8` | Longitude |
| `category` | `text` | One of: `potato`, `onion`, `egg`, `chicken`, `greens`, `fruit` |
| `vendor_name` | `text` | Display name |
| `created_at` | `timestamptz` | Auto-set on insert |
| `valid_until` | `timestamptz` | Expiry time (typically +4 hours from `created_at`) |
| `status` | `text` | `active` or `inactive` |

Enable **real-time** on the `markers` table for live updates.

---

## State Architecture

The Redux store has three slices:

### `markers`
- `items` — map of vendor markers by ID
- `loading` / `error` — fetch status

### `location`
- `coords` — user's GPS position `{ lat, lng }`
- `mapCenter` — current "home" center (updated by search or GPS)
- `tracking` / `followMode` — GPS state flags

### `ui`
- `connected` — live/offline status
- `toast` — notification state
- `selectedCategory` — active category filter
- `language` — `'en'` or `'bn'`

---

## Environment & Configuration

| Setting | Value | Where |
|---------|-------|-------|
| Default center | `23.8103, 90.4125` (Dhaka) | `src/map.js` |
| Default zoom | `15` | `src/map.js` |
| Min zoom (max ~5km view) | `14` | `src/map.js` |
| Marker expiry check | Every 60 seconds | `MapView.jsx` |
| Search debounce | 400ms | `SearchBar.jsx` |
| Categories | potato, onion, egg, chicken, greens, fruit | `src/map.js` |

---

## License

This project is private and not yet licensed for distribution.
