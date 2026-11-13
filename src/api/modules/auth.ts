import { request, send } from '../request';
import { loginResponseSchema } from '../schemas';

export const authApi = {
  login: (email: string, password: string) =>
    request('post', '/auth/login', loginResponseSchema, {
      body: { origin: window.location.origin, email, password },
    }),
  logout: () => send('post', '/auth/logout', {}),
};
