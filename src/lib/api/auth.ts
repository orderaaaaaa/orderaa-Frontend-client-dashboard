const TOKEN_KEY = 'access_token';

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
};
