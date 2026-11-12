import { describe, expect, it } from 'vitest';
import { ApiError } from '@/api/errors';
import { userMessage } from './errors';

describe('userMessage', () => {
  it('translates known error codes', () => {
    expect(userMessage(new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'))).toBe(
      'Invalid email or password.',
    );
  });

  it('never shows backend text for codes it does not know', () => {
    expect(userMessage(new ApiError(409, 'SOMETHING_NEW', 'Backend English'))).toBe(
      'Something went wrong.',
    );
    expect(userMessage(new ApiError(503, 'UNAVAILABLE', 'Backend English'))).toBe(
      'The server ran into a problem. Try again in a moment.',
    );
    expect(userMessage(new ApiError(403, 'FORBIDDEN', 'Backend English'))).toBe(
      "You don't have access to that.",
    );
  });

  it('explains network failures', () => {
    expect(userMessage(new ApiError(0, 'NETWORK_ERROR', 'x'))).toBe(
      'Cannot reach the server. Check your connection and try again.',
    );
  });
});
