import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logoutUser } = useAuth();
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
    <nav className="bg-surface-container-lowest/80 dark:bg-on-surface/90 backdrop-blur-2xl border-r border-white/20 dark:border-outline-variant/10 shadow-lg fixed left-0 top-0 h-screen w-[280px] flex flex-col py-stack-md px-4 z-40 transition-colors duration-200">
      {/* Brand/Avatar Header */}
      <div className="flex items-center gap-3 mb-stack-lg px-2 pt-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-sm shrink-0 overflow-hidden">
          <img
            className="w-full h-full object-cover"
            alt="User profile avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGXtVMCeF3kuvjT3uJFMDDMP_UWJk4wFHhgUjeEFoXuMCkiDgR_mwmYjuEJ1cStpmLH6d7x7LxBuhuIO66UFssUBOVZbJF95WpEwIt-AaukDSNAmIPyYboI4PAVZyD09Dy5QOPUeFx2l0CQiYoImAWkgXZ3RaKXmAixiLeHmz7_N1pHvHMis3S8-3DRrU7k-qZlLs89biEbEncOvF-aKBETLUR_gt6RLmhIjBVY7qeAUZcdRv4Bov9"
          />
        </div>
        <div>
          <h2 className="font-title-md text-title-md text-on-surface dark:text-surface-container-lowest">
            {user?.name || 'Patient'}
          </h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant dark:text-outline-variant">
            Patient Portal
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex-1 flex flex-col gap-1">
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out border-none bg-transparent cursor-pointer font-label-sm text-label-sm no-underline ${
            isActive('/dashboard')
              ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-r-4 border-secondary text-secondary dark:text-primary-fixed-dim font-bold'
              : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant/50 hover:bg-surface-container-high dark:hover:bg-surface-variant/20'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">clinical_notes</span>
          Dashboard Home
        </Link>

        <Link
          to="/upload"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out border-none bg-transparent cursor-pointer font-label-sm text-label-sm no-underline ${
            isActive('/upload') || isActive('/analysis')
              ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-r-4 border-secondary text-secondary dark:text-primary-fixed-dim font-bold'
              : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant/50 hover:bg-surface-container-high dark:hover:bg-surface-variant/20'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">psychology</span>
          Analyze Hub
        </Link>

        <Link
          to="/reports"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out border-none bg-transparent cursor-pointer font-label-sm text-label-sm no-underline ${
            isActive('/reports') || location.pathname.startsWith('/report/')
              ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-r-4 border-secondary text-secondary dark:text-primary-fixed-dim font-bold'
              : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant/50 hover:bg-surface-container-high dark:hover:bg-surface-variant/20'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive('/reports') ? "'FILL' 1" : "'FILL' 0" }}>
            history
          </span>
          Scan History
        </Link>

        <Link
          to="/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out border-none bg-transparent cursor-pointer font-label-sm text-label-sm no-underline ${
            isActive('/profile')
              ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-r-4 border-secondary text-secondary dark:text-primary-fixed-dim font-bold'
              : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant/50 hover:bg-surface-container-high dark:hover:bg-surface-variant/20'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive('/profile') ? "'FILL' 1" : "'FILL' 0" }}>
            account_circle
          </span>
          My Profile
        </Link>

        <Link
          to="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 ease-in-out border-none bg-transparent cursor-pointer font-label-sm text-label-sm no-underline ${
            isActive('/settings')
              ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-r-4 border-secondary text-secondary dark:text-primary-fixed-dim font-bold'
              : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant/50 hover:bg-surface-container-high dark:hover:bg-surface-variant/20'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          Settings
        </Link>
      </div>

      {/* CTA Button */}
      {location.pathname !== '/upload' && (
        <Link
          to="/upload"
          className="w-full mt-stack-md mb-stack-sm bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-label-sm py-3 rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 border-none cursor-pointer no-underline font-bold"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          New Analysis
        </Link>
      )}

      {/* Footer Tabs */}
      <div className="mt-auto border-t border-outline-variant/30 pt-4 flex flex-col gap-1">
        <a
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant/50 hover:bg-surface-container-high dark:hover:bg-surface-variant/20 transition-all duration-200 ease-in-out font-label-sm text-label-sm"
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          <span className="material-symbols-outlined text-[18px]">help_outline</span>
          Support
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left text-error dark:text-error-container hover:bg-error/5 hover:bg-surface-container-high dark:hover:bg-surface-variant/20 transition-all duration-200 ease-in-out border-none bg-transparent cursor-pointer font-label-sm text-label-sm"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Logout
        </button>
      </div>
    </nav>
  );
};
