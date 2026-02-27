import { useSelector } from 'react-redux';
import { CATEGORIES, getCategoryLabel } from '../map';

export default function Legend() {
    const language = useSelector((state) => state.ui.language);
    const categories = Object.entries(CATEGORIES);

    return (
        <div className="legend-overlay glass-panel">
            {categories.map(([key, { emoji }]) => (
                <div key={key} className="legend-item">
                    <span className="legend-emoji">{emoji}</span>
                    <span>{getCategoryLabel(key, language)}</span>
                </div>
            ))}
        </div>
    );
}
