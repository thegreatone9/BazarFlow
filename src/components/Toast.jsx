import { useSelector } from 'react-redux';

export default function Toast() {
    const toast = useSelector((state) => state.ui.toast);

    return (
        <div className={`toast ${toast ? 'visible' : ''} ${toast?.type || 'info'}`}>
            {toast?.message || ''}
        </div>
    );
}
