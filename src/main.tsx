import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize theme from localStorage if available
const theme = localStorage.getItem('guitar-maestro-storage')
  ? JSON.parse(localStorage.getItem('guitar-maestro-storage')!).state.theme
  : 'light';

// Apply theme class to html element
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);