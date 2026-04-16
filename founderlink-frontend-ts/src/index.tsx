import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { store } from './store/store';

const applyTheme = (): void => {
  const theme = store.getState().theme.mode;
  document.documentElement.classList.toggle('dark', theme === 'dark');
};
applyTheme();
store.subscribe(applyTheme);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
