/**
 * Transforms city key from API response format to API request format
 * API returns: lowercase-hyphenated (e.g., "asywt-algdydh")
 * API expects: uppercase-underscore (e.g., "ASYWT_ALGDYDH")
 */
export const transformCityKeyForAPI = (cityKey: string): string => {
  return cityKey.toUpperCase().replace(/-/g, '_');
};

