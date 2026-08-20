import { useState, useEffect } from 'react';

let categoriesCache = null;
let fetchPromise = null;

function fetchCategories() {
  if (categoriesCache) return Promise.resolve(categoriesCache);
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('/toolCategories.json')
    .then(r => r.json())
    .then(data => {
      categoriesCache = data;
      return data;
    });

  return fetchPromise;
}

export function useCategorySiblings(currentLink) {
  const [siblings, setSiblings] = useState([]);

  useEffect(() => {
    fetchCategories().then(categories => {
      for (const cat of categories) {
        const found = cat.tools.find(t => t.link === currentLink);
        if (found) {
          setSiblings(cat.tools.filter(t => t.isEnabled));
          break;
        }
      }
    });
  }, [currentLink]);

  return siblings;
}
