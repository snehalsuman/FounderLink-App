import React from 'react';
import Navbar from '../shared/components/Navbar';
import Sidebar from '../shared/components/Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-dark-900">
    <Navbar />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  </div>
);

export default MainLayout;
