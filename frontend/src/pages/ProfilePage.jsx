import React from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Shield, Key, Mail, Calendar, LogOut } from 'lucide-react';

export const ProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#002b36] text-[#93a1a1]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-heading">User Profile & Security Clearance</h1>
            <p className="text-xs text-slate-400">Managed Personnel Credentials & RBAC Access Matrix</p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400 flex items-center justify-center text-2xl font-extrabold text-white">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.first_name} {user?.last_name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-amber-400 capitalize">
                    {user?.role?.replace('_', ' ')} Clearance
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Corporate Email</span>
                <span className="text-white font-mono text-sm">{user?.email}</span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Personnel User ID</span>
                <span className="text-slate-300 font-mono text-sm">{user?.id}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-xs text-blue-300 space-y-2">
              <span className="font-bold text-white block">Active RBAC Security Clearance:</span>
              <p>
                Your session is authenticated via JWT. You possess clearance to view and manage modules under the{' '}
                <span className="font-bold font-mono text-white">"{user?.role}"</span> clearance policy.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={logout}
                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold transition flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Session</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default ProfilePage;
