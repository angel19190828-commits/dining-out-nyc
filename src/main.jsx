import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');

import('./App').then(({ default: App }) => {
  createRoot(rootElement).render(<StrictMode><App /></StrictMode>);
}).catch(error => {
  console.error('Application bootstrap failed.', error);
  rootElement.innerHTML = `<main style="min-height:100vh;display:grid;place-content:center;padding:2rem;font:16px DM Sans,sans-serif"><strong>The experience could not start.</strong><pre style="white-space:pre-wrap">${String(error.message || error)}</pre></main>`;
});
