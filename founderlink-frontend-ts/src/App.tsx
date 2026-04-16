import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Sun, Moon } from 'lucide-react';
import store, { type AppDispatch } from './store/store';
import { toggleTheme, selectTheme } from './store/slices/themeSlice';
import router from './routes/router';

const ThemeToggle: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector(selectTheme);
  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 bg-white dark:bg-[#2c2c2e] border border-black/8 dark:border-white/8 text-[#1d1d1f] dark:text-[#f5f5f7] shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

function App(): React.ReactElement {
  return (
    <Provider store={store}>
      <ThemeToggle />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
