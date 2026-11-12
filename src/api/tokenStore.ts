/**
 * Access token lives in memory only (never localStorage). A page reload drops it and the app
 * gets a new one through the httpOnly refresh cookie.
 */
let accessToken: string | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};
