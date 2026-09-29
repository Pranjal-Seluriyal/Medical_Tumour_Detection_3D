import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export const Navbar: React.FC = () => {
  const { isLoggedIn, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center w-full px-container-padding py-4 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link
            to={isLoggedIn ? '/dashboard' : '/'}
            className="font-display-lg text-title-md tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2 border-none bg-transparent cursor-pointer outline-none no-underline"
          >
            <span className="material-symbols-outlined text-primary text-3xl icon-fill" style={{ fontVariationSettings: "'FILL' 1" }}>
              neurology
            </span>
            BrainAI
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className={`${isActive('/dashboard') ? 'text-primary dark:text-primary-fixed border-b-2 border-primary font-bold' : 'text-on-surface-variant dark:text-slate-300 font-medium'} pb-1 text-label-sm font-label-sm hover:text-primary dark:hover:text-primary-fixed transition-colors duration-300 no-underline`}
              >
                Dashboard
              </Link>
              <Link
                to="/upload"
                className={`${isActive('/upload') ? 'text-primary dark:text-primary-fixed border-b-2 border-primary font-bold' : 'text-on-surface-variant dark:text-slate-300 font-medium'} pb-1 text-label-sm font-label-sm hover:text-primary dark:hover:text-primary-fixed transition-colors duration-300 no-underline`}
              >
                Upload MRI
              </Link>
              <Link
                to="/reports"
                className={`${isActive('/reports') ? 'text-primary dark:text-primary-fixed border-b-2 border-primary font-bold' : 'text-on-surface-variant dark:text-slate-300 font-medium'} pb-1 text-label-sm font-label-sm hover:text-primary dark:hover:text-primary-fixed transition-colors duration-300 no-underline`}
              >
                My Reports
              </Link>
            </>
          ) : (
            <span className="text-on-surface-variant dark:text-slate-400 text-label-sm">
              Please log in to view portal features.
            </span>
          )}
        </nav>

        {/* Trailing Actions */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Toggle Theme"
            onClick={toggleTheme}
            className="text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed transition-colors duration-300 scale-95 active:scale-90 border-none bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {isLoggedIn ? (
            <>
              <button
                aria-label="Logout"
                onClick={handleLogout}
                className="text-on-surface-variant dark:text-slate-300 hover:text-error transition-colors duration-300 scale-95 active:scale-90 border-none bg-transparent cursor-pointer flex items-center"
                title="Log out"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
              <Link
                to="/profile"
                aria-label="Account"
                className="text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed transition-colors duration-300 scale-95 active:scale-90 no-underline flex items-center"
              >
                <span className="material-symbols-outlined icon-fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_circle
                </span>
              </Link>
              {location.pathname !== '/upload' && (
                <Link
                  to="/upload"
                  className="hidden md:flex items-center justify-center bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-label-sm px-6 py-2 rounded-full hover:opacity-90 transition-opacity shadow-md no-underline border-none cursor-pointer"
                >
                  Launch Portal
                </Link>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-primary dark:text-inverse-primary hover:text-secondary dark:hover:text-primary-fixed transition-colors font-label-sm text-label-sm no-underline px-4 py-2 font-bold"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-label-sm px-4 py-2 rounded-full hover:opacity-90 transition-opacity shadow-md no-underline flex items-center justify-center font-bold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
