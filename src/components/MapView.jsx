import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { initMap, addVendorMarker, addUserDot, flyTo, CATEGORIES } from '../map';
import { fetchActiveMarkers, subscribeToNewMarkers } from '../supabase';
import {
    setMarkers,
    addMarker,
    removeMarker,
    setLoading,
    setConnected,
    showToast,
    clearToast,
    setCoords,
    setFollowMode,
    setMapCenter,
    setLocationLabel,
} from '../store';

export default function MapView() {
    const dispatch = useDispatch();
    const markers = useSelector((state) => state.markers.items);
    const userCoords = useSelector((state) => state.location.coords);
    const followMode = useSelector((state) => state.location.followMode);
    const activeItems = useSelector((state) => state.ui.activeItems);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerLayersRef = useRef({}); // { [id]: L.marker }
    const userDotRef = useRef(null);

    // ─── Initialize Map ───
    useEffect(() => {
        if (mapInstanceRef.current) return;

        const map = initMap('map');
        mapInstanceRef.current = map;

        // Expose map instance globally for FAB buttons
        window.__bazarflow_map = map;

        // Initial data load
        loadMarkers();

        // Auto-locate user on first load
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    dispatch(setCoords(coords));
                    dispatch(setMapCenter(coords));
                    dispatch(setFollowMode(true));
                    flyTo(map, coords.lat, coords.lng, 15);

                    // Reverse geocode for label
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`)
                        .then((r) => r.json())
                        .then((data) => {
                            const name = data.display_name?.split(',').slice(0, 2).join(',') || 'My Location';
                            dispatch(setLocationLabel(name));
                        })
                        .catch(() => dispatch(setLocationLabel('My Location')));
                },
                () => { }, // Silently fall back to default center
                { enableHighAccuracy: true, timeout: 8000 }
            );
        }

        // Real-time subscription
        const channel = subscribeToNewMarkers((newMarker) => {
            dispatch(addMarker(newMarker));
            dispatch(
                showToast({ message: `${CATEGORIES[newMarker.category]?.emoji || '📍'} New vendor nearby!`, type: 'info' })
            );
            setTimeout(() => dispatch(clearToast()), 3000);
        });

        dispatch(setConnected(true));

        // Expiry check every 60s
        const expiryInterval = setInterval(() => {
            pruneExpiredMarkers();
        }, 60000);

        return () => {
            channel?.unsubscribe();
            clearInterval(expiryInterval);
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // ─── Sync markers state → map layers (filtered by activeItems) ───
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const shouldShow = (marker) =>
            activeItems.length === 0 || activeItems.includes(marker.category);

        const renderedIds = new Set(Object.keys(markerLayersRef.current));

        // Add / show matching markers
        Object.entries(markers).forEach(([id, marker]) => {
            if (shouldShow(marker)) {
                if (!renderedIds.has(id)) {
                    const layer = addVendorMarker(map, marker);
                    markerLayersRef.current[id] = layer;
                }
            } else {
                // Hide markers that don't match
                if (renderedIds.has(id)) {
                    map.removeLayer(markerLayersRef.current[id]);
                    delete markerLayersRef.current[id];
                }
            }
        });

        // Remove stale layers (marker deleted from state)
        renderedIds.forEach((id) => {
            if (!markers[id]) {
                if (markerLayersRef.current[id]) {
                    map.removeLayer(markerLayersRef.current[id]);
                }
                delete markerLayersRef.current[id];
            }
        });
    }, [markers, activeItems]);

    // ─── Update user dot position ───
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !userCoords) return;

        if (userDotRef.current) {
            userDotRef.current.setLatLng([userCoords.lat, userCoords.lng]);
        } else {
            userDotRef.current = addUserDot(map, userCoords.lat, userCoords.lng);
        }

        if (followMode) {
            flyTo(map, userCoords.lat, userCoords.lng);
        }
    }, [userCoords, followMode]);

    // ─── Data loading ───
    const loadMarkers = useCallback(async () => {
        dispatch(setLoading(true));
        const data = await fetchActiveMarkers();
        dispatch(setMarkers(data));
    }, [dispatch]);

    // ─── Prune expired markers ───
    const pruneExpiredMarkers = useCallback(() => {
        const now = new Date();
        Object.entries(markers).forEach(([id, m]) => {
            if (new Date(m.valid_until) < now) {
                dispatch(removeMarker(id));
            }
        });
    }, [markers, dispatch]);

    return <div id="map" style={{ width: '100%', height: '100%' }} />;
}
