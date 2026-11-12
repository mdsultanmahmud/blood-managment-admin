/**
 * Single-flight refresh: while one refresh is in progress, every caller awaits the same promise.
 * Without this, N concurrent 401s would fire N refreshes, and with rotating refresh tokens the
 * second one would present an already-rotated token and trip reuse detection (killing the session).
 */
export function createRefreshCoordinator(refresh: () => Promise<string>) {
  let inFlight: Promise<string> | null = null;
  return {
    refresh(): Promise<string> {
      inFlight ??= refresh().finally(() => {
        inFlight = null;
      });
      return inFlight;
    },
    get pending(): boolean {
      return inFlight !== null;
    },
  };
}

export type RefreshCoordinator = ReturnType<typeof createRefreshCoordinator>;
