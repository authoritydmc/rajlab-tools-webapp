import { useState, useEffect, useCallback } from 'react';

const USAGE_KEY = 'rajlabs_category_usage';
const CUSTOM_ORDER_KEY = 'rajlabs_category_custom_order';
const SORT_MODE_KEY = 'rajlabs_category_sort_mode';

export function useCategorySorting(initialCategories) {
  const [sortMode, setSortMode] = useState(() => localStorage.getItem(SORT_MODE_KEY) || 'default');
  const [usageStats, setUsageStats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USAGE_KEY)) || {};
    } catch {
      return {};
    }
  });
  const [customOrder, setCustomOrder] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_ORDER_KEY)) || [];
    } catch {
      return [];
    }
  });

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(SORT_MODE_KEY, sortMode);
  }, [sortMode]);

  useEffect(() => {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usageStats));
  }, [usageStats]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_ORDER_KEY, JSON.stringify(customOrder));
  }, [customOrder]);

  const trackClick = useCallback((categoryTitle) => {
    setUsageStats(prev => ({
      ...prev,
      [categoryTitle]: (prev[categoryTitle] || 0) + 1
    }));
  }, []);

  const moveCategory = useCallback((categoryTitle, direction) => {
    setSortMode('custom'); // Automatically switch to custom mode

    let currentList = customOrder.length > 0 
      ? [...customOrder] 
      : initialCategories.map(c => c.title);
      
    // Ensure all current categories are in the list
    const allTitles = initialCategories.map(c => c.title);
    currentList = currentList.filter(t => allTitles.includes(t));
    const missing = allTitles.filter(t => !currentList.includes(t));
    currentList.push(...missing);

    const index = currentList.indexOf(categoryTitle);
    if (index === -1) return;

    if (direction === 'up' || direction === 'left') {
      if (index > 0) {
        [currentList[index - 1], currentList[index]] = [currentList[index], currentList[index - 1]];
      }
    } else {
      if (index < currentList.length - 1) {
        [currentList[index + 1], currentList[index]] = [currentList[index], currentList[index + 1]];
      }
    }

    setCustomOrder(currentList);
  }, [initialCategories, customOrder]);

  const sortedCategories = [...initialCategories].sort((a, b) => {
    if (sortMode === 'usage') {
      const usageA = usageStats[a.title] || 0;
      const usageB = usageStats[b.title] || 0;
      if (usageA !== usageB) return usageB - usageA; // Descending
      // Fallback to original order
      return initialCategories.indexOf(a) - initialCategories.indexOf(b);
    } 
    
    if (sortMode === 'custom') {
      // Use custom order array, or fallback to original index if not found
      const idxA = customOrder.indexOf(a.title);
      const idxB = customOrder.indexOf(b.title);
      
      const posA = idxA !== -1 ? idxA : initialCategories.indexOf(a) + 1000;
      const posB = idxB !== -1 ? idxB : initialCategories.indexOf(b) + 1000;
      
      return posA - posB;
    }

    // Default mode: original order
    return 0;
  });

  return {
    sortMode,
    setSortMode,
    sortedCategories,
    trackClick,
    moveCategory
  };
}
