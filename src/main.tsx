import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import { App } from './App';
import './index.css';
import { reloadForFreshChunks } from './lib/chunkReload';

// A code-split chunk from a previous deploy is gone: reload once to pick up the new build.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadForFreshChunks()) event.preventDefault();
});

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
