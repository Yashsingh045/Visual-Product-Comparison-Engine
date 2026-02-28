import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('App starting...');

try {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log('App rendered to root.');
  } else {
    console.error('Root container not found!');
  }
} catch (error) {
  console.error('Fatal error during render:', error);
}

