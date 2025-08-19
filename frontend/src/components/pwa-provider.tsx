'use client';

import { useEffect } from 'react';

export function PWAProvider() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service worker registered'))
        .catch(err => console.error('Service worker registration failed', err));
    }
  }, []);

  return null;
}