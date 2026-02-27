import L from 'leaflet';

// ─── Category Config ───
export const CATEGORIES = {
    potato: { emoji: '🥔', color: '#C4A35A', label: 'Potato', labelBn: 'আলু' },
    onion: { emoji: '🧅', color: '#D4A574', label: 'Onion', labelBn: 'পেঁয়াজ' },
    egg: { emoji: '🥚', color: '#F5E6CC', label: 'Egg', labelBn: 'ডিম' },
    chicken: { emoji: '🍗', color: '#E8734A', label: 'Chicken', labelBn: 'মুরগি' },
    greens: { emoji: '🥬', color: '#5DBB63', label: 'Greens', labelBn: 'শাকসবজি' },
    fruit: { emoji: '🥭', color: '#FFB347', label: 'Fruit', labelBn: 'ফল' },
};

/**
 * Get the localized label for a category.
 */
export function getCategoryLabel(key, language = 'en') {
    const cat = CATEGORIES[key];
    if (!cat) return key;
    return language === 'bn' ? cat.labelBn : cat.label;
}

const DHAKA_CENTER = [23.8103, 90.4125];
const DEFAULT_ZOOM = 15;

/**
 * Initialize and return the Leaflet map instance.
 */
export function initMap(containerId = 'map') {
    const map = L.map(containerId, {
        center: DHAKA_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: 14,
        zoomControl: false,
        attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    }).addTo(map);

    return map;
}

/**
 * Create an emoji-based DivIcon marker and add it to the map.
 * Returns the Leaflet marker layer.
 */
export function addVendorMarker(map, markerData) {
    const category = CATEGORIES[markerData.category] || CATEGORIES.potato;

    const icon = L.divIcon({
        className: '',
        html: `<div class="emoji-marker" style="background: ${category.color};">${category.emoji}</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -26],
    });

    const timeAgo = getTimeAgo(markerData.created_at);

    const layer = L.marker([markerData.lat, markerData.lng], { icon })
        .addTo(map)
        .bindPopup(
            `<div>
        <div class="popup-vendor-name">${category.emoji} ${markerData.vendor_name || 'Vendor'}</div>
        <div class="popup-time">⏱ ${timeAgo}</div>
      </div>`,
            { closeButton: false, maxWidth: 200 }
        );

    return layer;
}

/**
 * Add a blue pulsing dot for the user's GPS location.
 */
export function addUserDot(map, lat, lng) {
    const icon = L.divIcon({
        className: '',
        html: '<div class="user-dot"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });

    return L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(map);
}

/**
 * Smooth fly-to animation for recentering.
 */
export function flyTo(map, lat, lng, zoom = 15) {
    map.flyTo([lat, lng], zoom, { duration: 1.2 });
}

/**
 * Simple time-ago formatter.
 */
function getTimeAgo(dateStr) {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMin = Math.round((now - then) / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.round(diffMin / 60);
    return `${diffHr}h ago`;
}
