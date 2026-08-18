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
import { hasPortalAccess } from '../../config/permissions';
import FlyingMatLogo from './FlyingMatLogo';

export const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'KSBC Executive Dashboard', path: '/dashboard', icon: LayoutDashboard, roleTag: 'Executive' },
    { label: 'Customer Master Database', path: '/customers', icon: Users, roleTag: 'Master DB' },
    { label: 'Accounts Database', path: '/accounts', icon: Wallet, roleTag: 'Accounts' },
    { label: 'Fresh Loan Applications', path: '/fresh-loans', icon: FileText, roleTag: 'Intake AI' },
    { label: 'Loans Database', path: '/loans-database', icon: Landmark, roleTag: 'Loans DB' },
    { label: 'Loans Portfolio Pipeline', path: '/loans', icon: Landmark, roleTag: 'Pipeline' },
    { label: 'CFO Executive AI Chatbot', path: '/cfo-ai-chat', icon: Bot, roleTag: 'CFO AI' },
    { label: 'AI Risk Calculator', path: '/loan-calculator', icon: Calculator, roleTag: 'AI Underwrite' },
    { label: 'Loan Defaulters & NPA', path: '/defaulters', icon: AlertOctagon, roleTag: 'Risk Watch' },
    { label: 'AI Fraud Detection', path: '/fraud-detection', icon: ShieldAlert, roleTag: 'AML Guard' },
    { label: 'AI Customer Support', path: '/customer-service', icon: MessageSquare, roleTag: '24/7 Bot' },
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

  // Dynamically filter navigation items based on active role permissions
  const visibleNavItems = navItems.filter((item) => hasPortalAccess(user?.role, item.path));

  return (
    <aside className="w-64 bg-[#141C33] border-r border-[#232E52] flex flex-col h-screen sticky top-0 z-30 shadow-2xl text-[#FAF7E6]">
      {/* KSBC Brand Header with Temple Logo */}
      <div className="p-3.5 border-b border-[#232E52] bg-[#10172B] flex items-center justify-center">
        <FlyingMatLogo size="sidebar" className="w-full" />
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-sidebar-scroll">
        <div className="px-3 pb-2 flex items-center justify-between">
          <span className="text-[10px] font-archivo font-extrabold uppercase tracking-wider text-[#C59E5F]">KSBC Portals</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#1E2748] text-[#FAF7E6]/80 rounded border border-[#2E3C66]">
            {visibleNavItems.length} Active
          </span>
        </div>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1E2748] text-[#FFFFFF] border border-[#3A4E82] shadow-md shadow-black/20 font-bold'
                    : 'text-[#9CB0D4] hover:text-[#FFFFFF] hover:bg-[#1A2544]'
                }`
              }
            >
              <div className="flex items-center space-x-3 truncate mr-2">
                <Icon className="w-4 h-4 flex-shrink-0 text-[#C59E5F]" />
                <span className="truncate">{item.label}</span>
              </div>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#10172B] text-[#C59E5F] font-mono border border-[#2E3C66] flex-shrink-0">
                {item.roleTag}
              </span>
            </NavLink>
          );
        })}
      </div>

      {/* Active User Persona Footer */}
      <div className="p-3.5 border-t border-[#232E52] bg-[#10172B]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#1E2748] border border-[#C59E5F]/50 flex items-center justify-center text-xs font-heading font-black text-[#C59E5F]">
            {user?.first_name?.[0] || 'K'}{user?.last_name?.[0] || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#FFFFFF] truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-[10px] text-[#C59E5F] font-mono capitalize truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;

