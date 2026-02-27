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
} from '../store';

export default function MapView() {
    const dispatch = useDispatch();
    const markers = useSelector((state) => state.markers.items);
    const userCoords = useSelector((state) => state.location.coords);
    const followMode = useSelector((state) => state.location.followMode);

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

    // ─── Sync markers state → map layers ───
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const currentIds = new Set(Object.keys(markers));
        const renderedIds = new Set(Object.keys(markerLayersRef.current));

        // Add new markers
        currentIds.forEach((id) => {
            if (!renderedIds.has(id)) {
                const layer = addVendorMarker(map, markers[id]);
                markerLayersRef.current[id] = layer;
            }
        });

        // Remove stale layers
        renderedIds.forEach((id) => {
            if (!currentIds.has(id)) {
                map.removeLayer(markerLayersRef.current[id]);
                delete markerLayersRef.current[id];
            }
        });
    }, [markers]);

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
