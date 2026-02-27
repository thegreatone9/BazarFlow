// ─── Mock Supabase Module ───
// Real Supabase integration is commented out below.
// This module loads vendor data from sample_data/vendors.json for local development.

import sampleVendors from '../sample_data/vendors.json';

/**
 * Fetch all active markers from mock data.
 * Filters by valid_until > now and status === 'active', just like the real query.
 */
export async function fetchActiveMarkers() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const now = new Date().toISOString();
    return sampleVendors.filter(
        (m) => m.status === 'active' && m.valid_until > now
    );
}

/**
 * Subscribe to real-time INSERT events (no-op in mock mode).
 * @param {function} _onInsert - callback (unused in mock)
 * @returns {object} Stub channel with unsubscribe()
 */
export function subscribeToNewMarkers(_onInsert) {
    console.log('[BazarFlow Mock] Real-time subscription stubbed.');
    return { unsubscribe: () => { } };
}

/**
 * Submit a new marker (mock — logs to console and returns data).
 */
export async function submitMarker(markerData) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    console.log('[BazarFlow Mock] Marker submitted:', markerData);
    return { data: { id: `mock-${Date.now()}`, ...markerData }, error: null };
}

// ──────────────────────────────────────────────────
// Original Supabase implementation (uncomment when ready):
// ──────────────────────────────────────────────────
//
// import { createClient } from '@supabase/supabase-js';
//
// const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
// const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
//
// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
//
// export async function fetchActiveMarkers() {
//     const { data, error } = await supabase
//         .from('markers')
//         .select('*')
//         .gt('valid_until', new Date().toISOString())
//         .eq('status', 'active')
//         .order('created_at', { ascending: false });
//
//     if (error) {
//         console.error('[BazarFlow] Failed to fetch markers:', error.message);
//         return [];
//     }
//
//     return data || [];
// }
//
// export function subscribeToNewMarkers(onInsert) {
//     const channel = supabase
//         .channel('markers-realtime')
//         .on(
//             'postgres_changes',
//             {
//                 event: 'INSERT',
//                 schema: 'public',
//                 table: 'markers',
//             },
//             (payload) => {
//                 if (payload.new) {
//                     onInsert(payload.new);
//                 }
//             }
//         )
//         .subscribe();
//
//     return channel;
// }
//
// export async function submitMarker(markerData, maxRetries = 3) {
//     let attempt = 0;
//     let lastError = null;
//
//     while (attempt < maxRetries) {
//         try {
//             const { data, error } = await supabase
//                 .from('markers')
//                 .insert([markerData])
//                 .select()
//                 .single();
//
//             if (error) throw error;
//             return { data, error: null };
//         } catch (err) {
//             lastError = err;
//             attempt++;
//             if (attempt < maxRetries) {
//                 const delay = Math.pow(2, attempt - 1) * 1000;
//                 await new Promise((resolve) => setTimeout(resolve, delay));
//             }
//         }
//     }
//
//     console.error(`[BazarFlow] Failed after ${maxRetries} attempts:`, lastError);
//     return { data: null, error: lastError };
// }
