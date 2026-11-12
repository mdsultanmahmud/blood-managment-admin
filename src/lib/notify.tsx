import toast from 'react-hot-toast';
import { ToastCard, type NotifyOptions, type Tone } from '@/components/ui/ToastCard';

function show(tone: Tone, message: string, opts: NotifyOptions = {}): string {
  return toast.custom((t) => <ToastCard t={t} tone={tone} message={message} opts={opts} />, {
    duration: opts.duration ?? (tone === 'error' ? 7000 : 3500),
  });
}

/**
 * The single notification helper. Copy is short and plain: "User created", "Role saved".
 */
export const notify = {
  success: (message: string, opts?: NotifyOptions) => show('success', message, opts),
  error: (message: string, opts?: NotifyOptions) => show('error', message, opts),
  info: (message: string, opts?: NotifyOptions) => show('info', message, opts),
  dismiss: (id?: string) => toast.dismiss(id),
};
