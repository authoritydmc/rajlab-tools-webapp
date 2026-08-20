import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rajlabs_favorites') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('rajlabs_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (toolLink) => {
    setFavorites(prev =>
      prev.includes(toolLink) ? prev.filter(f => f !== toolLink) : [...prev, toolLink]
    );
  };

  const isFavorite = (toolLink) => favorites.includes(toolLink);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}
