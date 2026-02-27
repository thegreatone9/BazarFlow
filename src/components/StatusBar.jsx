import { useSelector } from 'react-redux';

export default function StatusBar() {
    const connected = useSelector((state) => state.ui.connected);

    return (
        <div className="status-bar glass-panel">
            <div className={`status-dot ${connected ? '' : 'offline'}`} />
            <span className="status-text">
                {connected ? 'Live' : 'Offline'}
            </span>
        </div>
    );
}
