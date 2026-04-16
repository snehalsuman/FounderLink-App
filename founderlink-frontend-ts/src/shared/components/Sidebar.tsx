import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Rocket, Search, DollarSign, ShieldCheck, TrendingUp, Mail, CreditCard } from 'lucide-react';
import useAuth from '../hooks/useAuth';

interface SidebarLink {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const Sidebar: React.FC = () => {
  const { isFounder, isInvestor, isCoFounder } = useAuth();

  const founderLinks: SidebarLink[] = [
    { to: '/founder/dashboard',   icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
    { to: '/founder/startups',    icon: <Rocket size={17} />,          label: 'My Startups' },
    { to: '/founder/investments', icon: <DollarSign size={17} />,      label: 'Investment Requests' },
    { to: '/founder/payments',    icon: <CreditCard size={17} />,      label: 'Received Payments' },
  ];
  const coFounderLinks: SidebarLink[] = [
    { to: '/cofounder/dashboard',  icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
    { to: '/cofounder/startups',   icon: <Search size={17} />,          label: 'Browse Startups' },
    { to: '/founder/invitations',  icon: <Mail size={17} />,            label: 'My Invitations' },
  ];
  const investorLinks: SidebarLink[] = [
    { to: '/investor/dashboard',   icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
    { to: '/investor/startups',    icon: <Search size={17} />,          label: 'Browse Startups' },
    { to: '/investor/investments', icon: <TrendingUp size={17} />,      label: 'My Investments' },
    { to: '/investor/payments',    icon: <CreditCard size={17} />,      label: 'Payment History' },
  ];
  const adminLinks: SidebarLink[] = [
    { to: '/admin/dashboard', icon: <ShieldCheck size={17} />, label: 'Approvals' },
  ];

  let links = adminLinks;
  let roleLabel = 'Admin';
  let roleDot = 'bg-[#ff9f0a]';
  let roleText = 'text-[#c25f00] dark:text-[#ffd60a]';

  if (isFounder) {
    links = founderLinks;
    roleLabel = 'Founder';
    roleDot = 'bg-accent';
    roleText = 'text-accent dark:text-accent-light';
  } else if (isCoFounder) {
    links = coFounderLinks;
    roleLabel = 'Co-Founder';
    roleDot = 'bg-[#bf5af2]';
    roleText = 'text-[#9333ea] dark:text-[#bf5af2]';
  } else if (isInvestor) {
    links = investorLinks;
    roleLabel = 'Investor';
    roleDot = 'bg-[#34c759]';
    roleText = 'text-[#248a3d] dark:text-[#30d158]';
  }

  return (
    <aside className="w-60 bg-white dark:bg-[#1c1c1e] border-r border-black/6 dark:border-white/6 min-h-screen flex flex-col">
      {/* Role pill */}
      <div className="px-4 py-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${roleDot}`} />
          <span className={`text-xs font-semibold uppercase tracking-widest ${roleText}`}>{roleLabel}</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-black/5 dark:border-white/5">
        <div className="px-3 py-2 text-[10px] text-[#8e8e93] font-medium tracking-wide">FounderLink v1.0</div>
      </div>
    </aside>
  );
};

export default Sidebar;
