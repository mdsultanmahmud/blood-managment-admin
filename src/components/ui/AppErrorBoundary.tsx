import i18n from 'i18next';
import { Component, type ErrorInfo, type ReactNode } from 'react';

/** Top-level safety net: anything that escapes the router lands here instead of a blank page. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="flex min-h-screen items-center justify-center bg-canvas px-6">
        <div className="max-w-md">
          <h1 className="text-[26px] font-semibold tracking-[-0.015em] text-neutral-950">
            {i18n.t('status.crash.title')}
          </h1>
          <p className="mt-2 text-[15px] text-neutral-600">{i18n.t('status.crash.message')}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-9 items-center rounded-sm border border-primary-600 bg-primary-600 px-3.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            {i18n.t('common.actions.reload')}
          </button>
        </div>
      </div>
    );
  }
}
