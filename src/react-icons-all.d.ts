/**
 * The whole Lucide set for the icon picker. The `?all` query makes it a separate module from the
 * `react-icons/lu` the app imports icon by icon, so the full set stays a lazy chunk instead of
 * joining the startup bundle (see `src/lib/reactIcons.ts`).
 */
declare module 'react-icons/lu?all' {
  export * from 'react-icons/lu';
}
