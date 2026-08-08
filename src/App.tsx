import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppRouter } from './router/AppRouter';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <AppRouter />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
