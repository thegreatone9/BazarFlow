import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setMapCenter } from '../store';
import { flyTo } from '../map';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export default function SearchBar() {
    const dispatch = useDispatch();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);
    const debounceRef = useRef(null);

    // ─── Geocode via Nominatim ───
    const search = useCallback(async (q) => {
        if (q.trim().length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            setResults(data);
            setOpen(data.length > 0);
        } catch (err) {
            console.error('[BazarFlow] Nominatim error:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Debounced input handler ───
    const handleInput = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(value), 400);
    };

    // ─── Select a result ───
    const handleSelect = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        // Update map center for recenter button
        dispatch(setMapCenter({ lat, lng }));

        const map = window.__bazarflow_map;
        if (map) flyTo(map, lat, lng, 15);

        setQuery(result.display_name.split(',')[0]);
        setOpen(false);
        setResults([]);
    };

    // ─── Keyboard: Escape to dismiss ───
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setOpen(false);
            e.target.blur();
        }
    };

    // ─── Click outside to dismiss ───
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="search-bar" ref={containerRef}>
            <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                    id="search-input"
                    className="search-input"
                    type="text"
                    placeholder="Search location…"
                    value={query}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    autoComplete="off"
                />
                {loading && <span className="search-spinner" />}
            </div>

            {open && results.length > 0 && (
                <ul className="search-results">
                    {results.map((r) => (
                        <li
                            key={r.place_id}
                            className="search-result-item"
                            onClick={() => handleSelect(r)}
                        >
                            <span className="search-result-name">
                                {r.display_name.split(',')[0]}
                            </span>
                            <span className="search-result-detail">
                                {r.display_name.split(',').slice(1, 3).join(',')}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
