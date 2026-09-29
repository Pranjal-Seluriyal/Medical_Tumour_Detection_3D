import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { MinimalInput } from '../components/Inputs';
import { GradientButton } from '../components/Buttons';

export const SignupPage: React.FC = () => {
  const { signupUser, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!name || !email || !password) return;

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      console.log("Sending registration request to API for name:", name, "email:", email);
      await signupUser(name, email, password);
      console.log("Registration successful! Navigating to dashboard...");
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Registration request failed:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to create account';
      setErrorMsg(errMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-0 transition-colors duration-300 relative bg-background dark:bg-inverse-surface">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-white shadow-sm hover:shadow-md transition-all duration-300 z-50 border-none cursor-pointer flex items-center justify-center"
      >
        <span className="material-symbols-outlined">
          {theme === 'dark' ? 'light_mode' : 'dark_mode'}
        </span>
      </button>

      {/* Auth Panel Container */}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row overflow-hidden rounded-2xl glass-panel min-h-[700px] animate-fade">
        {/* Illustration Panel */}
        <div className="lg:w-1/2 relative hidden lg:flex flex-col justify-center items-center p-12 overflow-hidden bg-surface-container-lowest dark:bg-inverse-surface">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover opacity-80 dark:opacity-60 mix-blend-multiply dark:mix-blend-screen"
              alt="Healthcare and AI technology illustration"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgey3YjX7eoBPTAVVduvKMBaARVaYuhtzw016RPDP04QU8v3Qu5DODs5nN5xoOnmEAvu_LZVPU5_Q7lZYKwHgNFPSujRfBd7aoQ_GAN4jMhhQrMT-XJJ8ZJ51SU_OXBzDXbLORfltnCLaQ4IT3fozxCldMTYeu_bxDAKxiFKA9E5JdOqFnnFS-wvxhqI5vXKadB_L28LdeoUKB07_Bp0EIuWT_IT0WnYtf542Voy7dhKdldD3v5xUf"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-surface-container-low/80 dark:from-inverse-surface/80 dark:to-inverse-surface/90 backdrop-blur-[2px]"></div>
          </div>
          <div className="relative z-10 text-center text-on-surface dark:text-white">
            <h2 className="font-display-lg text-display-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-stack-sm">
              BrainAI Portal
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-surface-container-highest max-w-md mx-auto">
              Advanced diagnostic insights powered by precision AI, providing clarity in critical moments.
            </p>
          </div>
        </div>

        {/* Form Panel */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative bg-white/40 dark:bg-inverse-surface/60 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-stack-lg lg:hidden">
            <h1 className="font-title-md text-title-md bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              BrainAI
            </h1>
          </div>

          <div className="transition-opacity duration-300 opacity-100">
            <h3 className="font-headline-lg text-headline-lg text-on-surface dark:text-white mb-stack-sm">
              Create Account
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-container-highest mb-stack-lg">
              Join the BrainAI portal for advanced insights.
            </p>
            
            {errorMsg && (
              <div className="mb-4 p-3 bg-error-container/20 border border-error/30 text-error rounded-lg text-sm">
                {errorMsg}
              </div>
            )}
            
            <form className="space-y-stack-sm" onSubmit={handleSubmit}>
              <MinimalInput
                label="Full Name"
                placeholder="Dr. Jane Smith"
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <MinimalInput
                label="Email Address"
                placeholder="jane@hospital.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <MinimalInput
                label="Password"
                placeholder="••••••••"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <MinimalInput
                label="Confirm Password"
                placeholder="••••••••"
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <GradientButton
                className="w-full mt-stack-md"
                icon="person_add"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </GradientButton>
            </form>

            <p className="font-body-md text-body-md text-center text-on-surface-variant dark:text-surface-container-highest mt-stack-md">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary dark:text-inverse-primary font-semibold hover:text-secondary dark:hover:text-primary-fixed transition-colors no-underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
