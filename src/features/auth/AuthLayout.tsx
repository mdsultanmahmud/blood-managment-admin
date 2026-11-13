import type { ReactNode } from 'react';
import { useReadySite } from '@/context/siteState';
import { apiUrl } from '@/lib/env';

/** Centered card on the canvas, branded with the company, as BC's sign-in screens. */
export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  const site = useReadySite();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex items-center gap-2.5">
          <img
            src={apiUrl(site.company.logoUrl)}
            alt=""
            className="h-[30px] w-[30px] shrink-0 rounded-sm object-contain"
          />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[15px] font-semibold text-neutral-950">
              {site.company.title}
            </p>
            <p className="truncate text-xs text-neutral-500">{site.app.name}</p>
          </div>
        </div>
        <div className="rounded-md border border-neutral-200 bg-surface px-7 py-7">
          <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.01em] text-neutral-950">
            {title}
          </h1>
          {description && <p className="mt-1.5 text-sm text-neutral-600">{description}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
