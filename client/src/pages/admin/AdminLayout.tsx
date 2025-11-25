import React from 'react';
import { Link, useLocation } from 'wouter';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
  const [location] = useLocation();
  const isActive = location.startsWith(href);
  return (
    <Link href={href}>
      <a 
        className={`block py-2.5 px-4 rounded transition duration-200 ${isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}>
        {children}
      </a>
    </Link>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold text-blue-600">CondoAdmin</h2>
        </div>
        <nav className="p-4 space-y-2">
          <NavLink href="/admin/dashboard">Dashboard</NavLink>
          <NavLink href="/admin/condo-approval">Aprovar Condomínios</NavLink>
          <NavLink href="/admin/users">Usuários</NavLink>
          <NavLink href="/admin/reports">Denúncias</NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
