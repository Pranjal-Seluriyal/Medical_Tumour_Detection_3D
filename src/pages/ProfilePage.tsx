import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { MinimalInput } from '../components/Inputs';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>(user?.phone || '+1 (555) 019-2831');
  const [age, setAge] = useState<number>(user?.age || 34);
  const [gender, setGender] = useState<string>(user?.gender || 'Female');
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        name,
        email,
        phone,
        age,
        gender
      });
      setIsEditing(false);
      setToastMsg('Profile details successfully updated.');
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update profile details:', err);
    }
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
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-surface-container-lowest">My Patient Profile</h1>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant mt-1">
            Manage your personal data, contact information, and demographic profiles.
          </p>
        </header>

        <div className="max-w-3xl pb-stack-lg">
          <div className="glass-panel rounded-xl p-6 relative overflow-hidden flex flex-col gap-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Profile Avatar View */}
            <div className="flex items-center gap-4 border-b border-outline-variant/30 pb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold shadow-md overflow-hidden shrink-0">
                <img
                  className="w-full h-full object-cover"
                  alt="User Avatar"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGXtVMCeF3kuvjT3uJFMDDMP_UWJk4wFHhgUjeEFoXuMCkiDgR_mwmYjuEJ1cStpmLH6d7x7LxBuhuIO66UFssUBOVZbJF95WpEwIt-AaukDSNAmIPyYboI4PAVZyD09Dy5QOPUeFx2l0CQiYoImAWkgXZ3RaKXmAixiLeHmz7_N1pHvHMis3S8-3DRrU7k-qZlLs89biEbEncOvF-aKBETLUR_gt6RLmhIjBVY7qeAUZcdRv4Bov9"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface dark:text-surface">{user?.name || 'Patient'}</h3>
                <p className="text-xs text-on-surface-variant dark:text-outline mt-1">ID: {user?.id || 'pat-1092'} • Patient Record Active</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <MinimalInput
                  label="Full Name"
                  disabled={!isEditing}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <MinimalInput
                  label="Email Address"
                  disabled={!isEditing}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <MinimalInput
                  label="Contact Phone"
                  disabled={!isEditing}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <MinimalInput
                  label="Age"
                  disabled={!isEditing}
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                />
                <div className="flex flex-col gap-1 w-full">
                  <label className="font-label-sm text-label-sm text-tertiary dark:text-outline-variant select-none">
                    Gender Identity
                  </label>
                  <select
                    disabled={!isEditing}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="form-input-minimal w-full font-body-md text-body-md text-on-surface dark:text-white border-b border-outline py-2.5 outline-none bg-transparent transition-colors focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Decline to State</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-label-sm px-6 py-3 rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 border-none cursor-pointer font-bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit Profile Details
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user?.name || '');
                        setEmail(user?.email || '');
                        setPhone(user?.phone || '');
                        setAge(user?.age || 0);
                        setGender(user?.gender || '');
                      }}
                      className="glass-panel text-primary dark:text-inverse-primary font-label-sm text-label-sm px-6 py-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-slate-800 transition-all border-none cursor-pointer font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-primary to-secondary text-white font-label-sm text-label-sm px-6 py-3 rounded-lg shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 border-none cursor-pointer font-bold"
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
