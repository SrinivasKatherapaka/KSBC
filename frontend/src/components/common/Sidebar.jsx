import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  ShieldCheck, 
  Calculator, 
  Landmark, 
  AlertOctagon, 
  ShieldAlert, 
  MessageSquare, 
  Vault, 
  BookOpen, 
  ShoppingBag, 
  Zap, 
  BarChart3, 
  FileText, 
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
    { label: 'CFO Executive AI Chatbot', path: '/cfo-ai-chat', icon: Bot, roleTag: 'CFO AI' },
    { label: 'Accounts Database', path: '/accounts', icon: Wallet, roleTag: 'Master' },
    { label: 'Loans Database', path: '/loans-database', icon: Landmark, roleTag: 'Master DB' },
    { label: 'Loans Portfolio Pipeline', path: '/loans', icon: Landmark, roleTag: 'Loans' },
    { label: 'AI Risk Calculator', path: '/loan-calculator', icon: Calculator, roleTag: 'AI Underwrite' },
    { label: 'Loan Defaulters & NPA', path: '/defaulters', icon: AlertOctagon, roleTag: 'Risk Watch' },
    { label: 'AI Fraud Detection', path: '/fraud-detection', icon: ShieldAlert, roleTag: 'AML Guard' },
    { label: 'AI Customer Support', path: '/customer-service', icon: MessageSquare, roleTag: '24/7 Bot' },
    { label: 'Customer Operations', path: '/customers', icon: Users, roleTag: 'Ops' },
    { label: 'Compliance & KYC Hub', path: '/compliance', icon: ShieldCheck, roleTag: 'KYC' },
    { label: 'Treasury Reserves', path: '/treasury', icon: Vault, roleTag: 'Treasury' },
    { label: 'General Ledger', path: '/finance', icon: BookOpen, roleTag: 'Finance' },
    { label: 'Procurement & POs', path: '/procurement', icon: ShoppingBag, roleTag: 'Procure' },
    { label: 'AI Workflow Automation', path: '/workflow-automation', icon: Zap, roleTag: 'Auto AI' },
    { label: 'AI Predictive Analytics', path: '/predictive-analytics', icon: BarChart3, roleTag: 'Predict' },
    { label: 'AI Intelligent Reporting', path: '/intelligent-reporting', icon: FileText, roleTag: 'Reports' },
    { label: 'AI ERP Assistant', path: '/ai-assistant', icon: Bot, roleTag: 'AI Agent' },
    { label: 'AI Advisory History', path: '/advisory-history', icon: History, roleTag: 'Audit' },
    { label: 'User Security Profile', path: '/profile', icon: UserCheck, roleTag: 'Security' }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-[#dfbd84]/20 flex flex-col h-screen sticky top-0 z-30 bg-[#1b2827]/90 backdrop-blur-xl">
      {/* KSBC Brand Header with Temple Logo */}
      <div className="p-4 border-b border-[#dfbd84]/20 bg-[#20302f]/70 flex items-center justify-between">
        <FlyingMatLogo size="lg" />
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#dfbd84]">KSBC Enterprise Modules</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#273a39] text-[#dfbd84] border border-[#dfbd84]/50 shadow-md shadow-[#182423]'
                    : 'text-[#a4b8b5] hover:text-[#f4eee2] hover:bg-[#273a39]/50'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 flex-shrink-0 text-[#dfbd84]" />
                <span className="truncate">{item.label}</span>
              </div>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#182423] text-[#dfbd84] font-mono border border-[#dfbd84]/25">
                {item.roleTag}
              </span>
            </NavLink>
          );
        })}
      </div>

      {/* Active User Persona Footer */}
      <div className="p-4 border-t border-[#dfbd84]/20 bg-[#182423]/80">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#273a39] border border-[#dfbd84]/40 flex items-center justify-center text-xs font-bold text-[#dfbd84]">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#f4eee2] truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-[10px] text-[#dfbd84] font-mono capitalize truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
