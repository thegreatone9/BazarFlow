import { configureStore, createSlice } from '@reduxjs/toolkit';

// ─── Markers Slice ───
const markersSlice = createSlice({
    name: 'markers',
    initialState: {
        items: {},       // { [id]: markerData }
        loading: false,
        error: null,
    },
    reducers: {
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
        setMarkers(state, action) {
            const markers = action.payload;
            state.items = {};
            markers.forEach((m) => {
                state.items[m.id] = m;
            });
            state.loading = false;
        },
        addMarker(state, action) {
            const marker = action.payload;
            state.items[marker.id] = marker;
        },
        removeMarker(state, action) {
            delete state.items[action.payload];
        },
    },
});

// ─── User Location Slice ───
const locationSlice = createSlice({
    name: 'location',
    initialState: {
        coords: null,      // { lat, lng } — user's GPS position
        tracking: false,
        followMode: false,  // whether map should auto-pan to user
        mapCenter: { lat: 23.8103, lng: 90.4125 }, // current "home" center (default: Dhaka)
        locationLabel: 'Dhaka', // display name for current center
    },
    reducers: {
        setCoords(state, action) {
            state.coords = action.payload;
        },
        setTracking(state, action) {
            state.tracking = action.payload;
        },
        setFollowMode(state, action) {
            state.followMode = action.payload;
        },
        setMapCenter(state, action) {
            state.mapCenter = action.payload;
        },
        setLocationLabel(state, action) {
            state.locationLabel = action.payload;
        },
    },
});

// ─── UI Slice ───
const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        connected: false,
        toast: null,       // { message, type: 'success'|'error'|'info' }
        pinnedItems: [],   // category keys added to bottom bar (max 5)
        activeItems: [],   // subset of pinnedItems currently visible on map
        language: 'en',    // 'en' | 'bn'
    },
    reducers: {
        setConnected(state, action) {
            state.connected = action.payload;
        },
        showToast(state, action) {
            state.toast = action.payload;
        },
        clearToast(state) {
            state.toast = null;
        },
        addPinnedItem(state, action) {
            const key = action.payload;
            if (state.pinnedItems.length < 5 && !state.pinnedItems.includes(key)) {
                state.pinnedItems.push(key);
                state.activeItems.push(key);
            }
        },
        removePinnedItem(state, action) {
            const key = action.payload;
            state.pinnedItems = state.pinnedItems.filter((k) => k !== key);
            state.activeItems = state.activeItems.filter((k) => k !== key);
        },
        toggleActiveItem(state, action) {
            const key = action.payload;
            if (state.activeItems.includes(key)) {
                state.activeItems = state.activeItems.filter((k) => k !== key);
            } else {
                state.activeItems.push(key);
            }
        },
        toggleLanguage(state) {
            state.language = state.language === 'en' ? 'bn' : 'en';
        },
    },
});

// Export actions
export const { setLoading, setError, setMarkers, addMarker, removeMarker } =
    markersSlice.actions;
export const { setCoords, setTracking, setFollowMode, setMapCenter, setLocationLabel } =
    locationSlice.actions;
export const { setConnected, showToast, clearToast, addPinnedItem, removePinnedItem, toggleActiveItem, toggleLanguage } =
    uiSlice.actions;

// ─── Store ───
const store = configureStore({
    reducer: {
        markers: markersSlice.reducer,
        location: locationSlice.reducer,
        ui: uiSlice.reducer,
    },
});

export default store;
