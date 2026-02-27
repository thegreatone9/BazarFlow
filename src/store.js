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
    },
});

// ─── UI Slice ───
const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        connected: false,
        toast: null,       // { message, type: 'success'|'error'|'info' }
        selectedCategory: null,
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
        setSelectedCategory(state, action) {
            state.selectedCategory = action.payload;
        },
        toggleLanguage(state) {
            state.language = state.language === 'en' ? 'bn' : 'en';
        },
    },
});

// Export actions
export const { setLoading, setError, setMarkers, addMarker, removeMarker } =
    markersSlice.actions;
export const { setCoords, setTracking, setFollowMode, setMapCenter } =
    locationSlice.actions;
export const { setConnected, showToast, clearToast, setSelectedCategory, toggleLanguage } =
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
