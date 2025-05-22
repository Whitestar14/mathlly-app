/**
 * General-purpose filter utility for searching arrays of objects.
 * 
 * @param {Array} items - The array of objects to filter.
 * @param {string} query - The search query.
 * @param {Array<string|function>} fields - Fields (string keys or functions) to search in each object.
 * @returns {Array} Filtered array of objects matching the query.
 */
export function filterByQuery(items, query, fields = []) {
  if (!query || !query.trim()) return items;
  const normalizedQuery = query.toLowerCase().trim();

  return items.filter(item => {
    return fields.some(field => {
      let value = '';
      if (typeof field === 'function') {
        value = field(item);
      } else if (typeof field === 'string') {
        value = item[field];
      }
      if (Array.isArray(value)) value = value.join(' ');
      if (typeof value !== 'string') value = String(value ?? '');
      return value.toLowerCase().includes(normalizedQuery);
    });
  });
}