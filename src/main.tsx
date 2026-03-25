import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setConsoleFunction } from 'three';

// Suppress the THREE.Clock deprecation warning emitted by @react-three/fiber v9.
// THREE.Clock was deprecated in Three.js r183 in favour of THREE.Timer, but the
// current version of @react-three/fiber still uses it internally.
setConsoleFunction((type, message, ...params) => {
  if (type === 'warn' && typeof message === 'string' && message.includes('THREE.Clock')) {
    return;
  }
  const method = console[type as keyof Console];
  if (typeof method === 'function') (method as Function)(message, ...params);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
