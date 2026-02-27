import { useDispatch, useSelector } from 'react-redux';
import { setCoords, setTracking, setFollowMode, setMapCenter, setLocationLabel } from '../store';
import { showToast, clearToast, toggleLanguage } from '../store';
import { flyTo } from '../map';

export default function FloatingButtons() {
    const dispatch = useDispatch();
    const userCoords = useSelector((state) => state.location.coords);
    const tracking = useSelector((state) => state.location.tracking);
    const mapCenter = useSelector((state) => state.location.mapCenter);
    const language = useSelector((state) => state.ui.language);

    // 📍 Locate Me — get GPS position and fly there
    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            dispatch(showToast({ message: '📍 GPS not available', type: 'error' }));
            setTimeout(() => dispatch(clearToast()), 3000);
            return;
        }

        dispatch(setTracking(true));

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                dispatch(setCoords(coords));
                dispatch(setFollowMode(true));
                dispatch(setTracking(false));
                dispatch(showToast({ message: '📍 Location found!', type: 'success' }));
                setTimeout(() => dispatch(clearToast()), 2500);

                // Update map center to GPS and fly there
                dispatch(setMapCenter(coords));
                const map = window.__bazarflow_map;
                if (map) flyTo(map, coords.lat, coords.lng, 15);

                // Reverse geocode for location label
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`)
                    .then((r) => r.json())
                    .then((data) => {
                        const name = data.display_name?.split(',').slice(0, 2).join(',') || 'My Location';
                        dispatch(setLocationLabel(name));
                    })
                    .catch(() => dispatch(setLocationLabel('My Location')));
            },
            (err) => {
                console.error('[BazarFlow] Geolocation error:', err);
                dispatch(setTracking(false));
                dispatch(showToast({ message: '📍 Could not get location', type: 'error' }));
                setTimeout(() => dispatch(clearToast()), 3000);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // 🎯 Recenter — fly back to the current map center (search result or default)
    const handleRecenter = () => {
        const map = window.__bazarflow_map;
        if (map && mapCenter) {
            flyTo(map, mapCenter.lat, mapCenter.lng, 15);
        }
    };

    const handleToggleLanguage = () => {
        dispatch(toggleLanguage());
    };

    return (
        <div className="fab-container">
            <button
                id="btn-lang"
                className="fab fab-lang"
                onClick={handleToggleLanguage}
                aria-label="Toggle language"
                title={language === 'en' ? 'Switch to Bangla' : 'Switch to English'}
            >
                <span className="fab-lang-inner">
                    <span className="fab-lang-icon">🌐</span>
                    <span className="fab-lang-badge">{language === 'en' ? 'EN' : 'বাং'}</span>
                </span>
            </button>
            <button
                id="btn-recenter"
                className="fab fab-recenter"
                onClick={handleRecenter}
                aria-label="Recenter map"
                title="Recenter"
            >
                🎯
            </button>
            <button
                id="btn-locate"
                className="fab fab-locate"
                onClick={handleLocateMe}
                aria-label="Find my location"
                title="Locate Me"
            >
                {tracking ? '⏳' : '📍'}
            </button>
        </div>
    );
}
