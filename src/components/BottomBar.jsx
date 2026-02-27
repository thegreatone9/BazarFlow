import { useSelector, useDispatch } from 'react-redux';
import { CATEGORIES, getCategoryLabel } from '../map';
import { setSelectedCategory } from '../store';

export default function BottomBar() {
    const dispatch = useDispatch();
    const selectedCategory = useSelector((state) => state.ui.selectedCategory);
    const language = useSelector((state) => state.ui.language);

    const categories = Object.entries(CATEGORIES);

    const handleCategoryClick = (key) => {
        dispatch(setSelectedCategory(selectedCategory === key ? null : key));
    };

    return (
        <div className="bottom-bar">
            <div className="category-row">
                {categories.map(([key, { emoji }]) => (
                    <button
                        key={key}
                        id={`category-${key}`}
                        className={`category-chip ${selectedCategory === key ? 'active' : ''}`}
                        onClick={() => handleCategoryClick(key)}
                        aria-label={getCategoryLabel(key, language)}
                        title={getCategoryLabel(key, language)}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
}
