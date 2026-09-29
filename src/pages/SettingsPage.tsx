import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  const [mriNotifications, setMriNotifications] = useState<boolean>(true);
  const [securityMfa, setSecurityMfa] = useState<boolean>(false);
  const [langPreference, setLangPreference] = useState<string>('en-US');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSave = () => {
    setToastMsg('Settings changes saved.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="min-h-screen flex font-body-md antialiased overflow-hidden bg-background dark:bg-inverse-surface transition-colors duration-200">
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-[280px] flex-1 flex flex-col h-screen relative bg-surface-bright dark:bg-inverse-surface transition-colors duration-200 p-container-padding overflow-y-auto">
        
        {/* Floating Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide glass-panel px-6 py-4 rounded-xl flex items-center gap-3 border-l-4 border-[#10b981]">
            <span className="material-symbols-outlined text-[#10b981]">check_circle</span>
            <span className="text-sm font-bold text-on-surface dark:text-white">{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <header className="mb-stack-md pt-4 max-w-3xl">
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-surface-container-lowest">Portal Settings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant mt-1">
            Configure display options, notifications, security settings, and legal guidelines.
          </p>
        </header>

        <div className="max-w-3xl pb-stack-lg flex flex-col gap-6">
          
          {/* General Displays */}
          <div className="glass-panel rounded-xl p-6 flex flex-col gap-6">
            <h3 className="font-title-md text-title-md text-on-surface dark:text-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">display_settings</span>
              Display & Personalization
            </h3>

            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
              <div>
                <h4 className="text-sm font-bold text-on-surface dark:text-surface">Dark Color Scheme</h4>
                <p className="text-xs text-on-surface-variant dark:text-outline mt-1">Apply a modern dark theme to the patient portal visual skin.</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 border-none cursor-pointer flex items-center ${
                  theme === 'dark' ? 'bg-primary justify-end' : 'bg-outline-variant/50 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-md"></span>
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
              <div>
                <h4 className="text-sm font-bold text-on-surface dark:text-surface">Preferred Portal Language</h4>
                <p className="text-xs text-on-surface-variant dark:text-outline mt-1">Select your language configuration preference.</p>
              </div>
              <select
                value={langPreference}
                onChange={(e) => setLangPreference(e.target.value)}
                className="glass-panel text-on-surface-variant dark:text-surface-container-lowest font-label-sm text-label-sm px-4 py-2 rounded-full border-none cursor-pointer bg-transparent outline-none"
              >
                <option value="en-US">English (United States)</option>
                <option value="es-ES">Español (España)</option>
                <option value="fr-FR">Français (France)</option>
              </select>
            </div>
          </div>

          {/* Notifications config */}
          <div className="glass-panel rounded-xl p-6 flex flex-col gap-6">
            <h3 className="font-title-md text-title-md text-on-surface dark:text-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">notifications_active</span>
              Alert Notification Settings
            </h3>

            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
              <div>
                <h4 className="text-sm font-bold text-on-surface dark:text-surface">Email Report Delivery Notifications</h4>
                <p className="text-xs text-on-surface-variant dark:text-outline mt-1">Send a summary copy to your email address when analysis is completed.</p>
              </div>
              <button
                onClick={() => setMriNotifications(!mriNotifications)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 border-none cursor-pointer flex items-center ${
                  mriNotifications ? 'bg-primary justify-end' : 'bg-outline-variant/50 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-md"></span>
              </button>
            </div>
          </div>

          {/* Security details */}
          <div className="glass-panel rounded-xl p-6 flex flex-col gap-6">
            <h3 className="font-title-md text-title-md text-on-surface dark:text-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
              Security & MFA Settings
            </h3>

            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
              <div>
                <h4 className="text-sm font-bold text-on-surface dark:text-surface">Two-Factor Authenticator (MFA)</h4>
                <p className="text-xs text-on-surface-variant dark:text-outline mt-1">Apply strict account multi-factor checks before showing medical histories.</p>
              </div>
              <button
                onClick={() => setSecurityMfa(!securityMfa)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 border-none cursor-pointer flex items-center ${
                  securityMfa ? 'bg-primary justify-end' : 'bg-outline-variant/50 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-md"></span>
              </button>
            </div>
          </div>

          {/* Policy Information */}
          <div className="glass-panel rounded-xl p-6 flex flex-col gap-4">
            <h3 className="font-title-md text-title-md text-on-surface dark:text-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">policy</span>
              Privacy & Legal Policies
            </h3>
            <div className="border-t border-outline-variant/30 pt-4 text-xs text-on-surface-variant dark:text-outline leading-relaxed space-y-3">
              <p>
                <strong>HIPAA Security Standards</strong>: We encrypt all uploaded scans and diagnostics both in transit and at rest using military-grade AES-256 protocols.
              </p>
              <p>
                <strong>Patient Consent and AI Protocols</strong>: By using this portal, you acknowledge that all visual tumor segmentation metrics and GNN diagnostic values are AI-generated and are strictly designed to support—not replace—professional medical expertise.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-label-sm px-8 py-3 rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 border-none cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
