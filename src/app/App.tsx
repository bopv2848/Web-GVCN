import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import { ErrorBoundary } from './ErrorBoundary';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  React.useEffect(() => {
    let savedTitle = '';
    const handleBeforePrint = () => {
      savedTitle = document.title;
      document.title = '';
    };
    const handleAfterPrint = () => {
      if (savedTitle) {
        document.title = savedTitle;
      }
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};
