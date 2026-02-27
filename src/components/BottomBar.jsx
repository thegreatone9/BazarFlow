import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CATEGORIES, getCategoryLabel } from '../map';
import { addPinnedItem, removePinnedItem, toggleActiveItem } from '../store';

export default function BottomBar() {
    const dispatch = useDispatch();
    const pinnedItems = useSelector((state) => state.ui.pinnedItems);
    const activeItems = useSelector((state) => state.ui.activeItems);
    const language = useSelector((state) => state.ui.language);

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef(null);

    // Filter categories by search query, excluding already pinned items
    const availableItems = Object.entries(CATEGORIES).filter(
        ([key, cat]) =>
            !pinnedItems.includes(key) &&
            (getCategoryLabel(key, language).toLowerCase().includes(searchQuery.toLowerCase()) ||
                getCategoryLabel(key, 'en').toLowerCase().includes(searchQuery.toLowerCase()) ||
                getCategoryLabel(key, 'bn').toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleAdd = (key) => {
        dispatch(addPinnedItem(key));
        setSearchOpen(false);
        setSearchQuery('');
    };

    const handleRemove = (e, key) => {
        e.stopPropagation();
        dispatch(removePinnedItem(key));
    };

    const handleToggle = (key) => {
        dispatch(toggleActiveItem(key));
    };

    const openSearch = () => {
        setSearchOpen(true);
        setSearchQuery('');
        // Focus input after render
        setTimeout(() => searchRef.current?.focus(), 50);
    };

    // Close search on Escape
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const canAddMore = pinnedItems.length < 5;

    return (
        <div className="bottom-bar">
            {/* Vendor item search above the bar */}
            {searchOpen && (
                <div className="vendor-search">
                    {searchQuery.trim().length >= 2 && (
                        <ul className="vendor-search-dropdown">
                            {availableItems.length > 0 ? (
                                availableItems.map(([key, { emoji }]) => (
                                    <li
                                        key={key}
                                        className="vendor-search-item"
                                        onClick={() => handleAdd(key)}
                                    >
                                        <span className="vendor-search-item-emoji">{emoji}</span>
                                        <span className="vendor-search-item-label">
                                            {getCategoryLabel(key, language)}
                                        </span>
                                    </li>
                                ))
                            ) : (
                                <li className="vendor-search-empty">No items found</li>
                            )}
                        </ul>
                    )}
                    < input
                        ref={searchRef}
                        className="vendor-search-input"
                        type="text"
                        placeholder="Search vendor items…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                    />
                </div>
            )}

            {/* Pinned items row */}
            <div className="category-row">
                {pinnedItems.map((key) => {
                    const cat = CATEGORIES[key];
                    if (!cat) return null;
                    const isActive = activeItems.includes(key);
                    return (
                        <div key={key} className="chip-wrapper" data-label={getCategoryLabel(key, language)}>
                            <button
                                id={`category-${key}`}
                                className={`category-chip ${isActive ? 'active' : ''}`}
                                onClick={() => handleToggle(key)}
                            >
                                {cat.emoji}
                            </button>
                            <button
                                className="chip-remove"
                                onClick={(e) => handleRemove(e, key)}
                                aria-label={`Remove ${getCategoryLabel(key, language)}`}
                                title="Remove"
                            >
                                ×
                            </button>
                        </div>
                    );
                })}

                {/* Add button */}
                {canAddMore && (
                    <button
                        id="btn-add-item"
                        className="category-chip chip-add"
                        onClick={searchOpen ? () => setSearchOpen(false) : openSearch}
                        aria-label="Add vendor item"
                        title="Add item"
                    >
                        {searchOpen ? '✕' : '＋'}
                    </button>
                )}
            </div>
        </div>
    );
}
