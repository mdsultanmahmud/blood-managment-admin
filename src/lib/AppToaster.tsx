import { Toaster } from 'react-hot-toast';

/** Mounted once in App. Top-right, below the top bar. Styling lives in notify.tsx. */
export function AppToaster() {
  return <Toaster position="top-right" gutter={8} containerStyle={{ top: 68, right: 16 }} />;
}
