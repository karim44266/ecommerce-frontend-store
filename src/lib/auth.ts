const STORE_TOKEN_KEY = 'store_token';

export const getStoreToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(STORE_TOKEN_KEY);
};

export const setStoreToken = (token: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(STORE_TOKEN_KEY, token);
};

export const clearStoreToken = () => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORE_TOKEN_KEY);
};

export const isStoreAuthenticated = (): boolean => Boolean(getStoreToken());
