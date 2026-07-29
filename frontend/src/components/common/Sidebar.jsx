import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet,
  Users, 
  ShieldCheck, 
  Calculator, 
  Landmark, 
  Vault, 
  BookOpen, 
  ShoppingBag, 
  Bot, 
  History, 
  UserCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FlyingMatLogo from './FlyingMatLogo';

export const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'KSBC Executive Dashboard', path: '/dashboard', icon: LayoutDashboard, roleTag: 'Executive' },
    { label: 'Accounts Database', path: '/accounts', icon: Wallet, roleTag: 'Master' },
    { label: 'Loans Portfolio', path: '/loan-applications', icon: Landmark, roleTag: 'Loans' },
    { label: 'Customer Operations', path: '/customers', icon: Users, roleTag: 'Ops' },
    { label: 'Compliance & KYC Hub', path: '/compliance', icon: ShieldCheck, roleTag: 'KYC' },
    { label: 'AI Risk Calculator', path: '/loan-calculator', icon: Calculator, roleTag: 'Risk' },
    { label: 'Treasury Reserves', path: '/treasury', icon: Vault, roleTag: 'Treasury' },
    { label: 'General Ledger', path: '/finance', icon: BookOpen, roleTag: 'Finance' },
    { label: 'Procurement & POs', path: '/procurement', icon: ShoppingBag, roleTag: 'Procure' },
    { label: 'AI ERP Assistant', path: '/ai-assistant', icon: Bot, roleTag: 'AI Agent' },
    { label: 'AI Advisory History', path: '/advisory-history', icon: History, roleTag: 'Audit' },
    { label: 'User Security Profile', path: '/profile', icon: UserCheck, roleTag: 'Security' }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-rose-900/30 flex flex-col h-screen sticky top-0 z-30">
      {/* KSBC Brand Header with Flying Mat Logo */}
      <div className="p-4 border-b border-rose-900/30">
        <FlyingMatLogo size="md" showText={true} />
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-rose-300/60">KSBC Enterprise Modules</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-rose-900/50 text-rose-300 border border-rose-600/50 shadow-md shadow-rose-900/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-rose-950/40'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span className="truncate">{item.label}</span>
              </div>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 font-mono border border-rose-900/40">
                {item.roleTag}
              </span>
            </NavLink>
          );
        })}
      </div>

      {/* Active User Persona Footer */}
      <div className="p-4 border-t border-rose-900/30 bg-rose-950/60">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-rose-900/40 border border-rose-600/40 flex items-center justify-center text-xs font-bold text-rose-300">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-[10px] text-amber-400 font-mono capitalize truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
