'use client';

import { useState } from 'react';
import { LayoutDashboard, Package, Settings, ChevronLeft } from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', active: false },
    { icon: Package, label: 'Orders', active: true },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <aside
      className={`flex flex-col h-screen bg-surface border-r border-default px-3 py-4 transition-all duration-200 ${
        collapsed ? 'w-[72px]' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-8 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[color:var(--accent)] flex items-center justify-center">
          <span className="text-white font-bold text-sm">V</span>
        </div>
        {!collapsed && (
          <span className="ml-3 font-semibold text-base text-primary">Veracity</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 mt-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`flex items-center gap-3 h-9 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                item.active
                  ? 'bg-[color:var(--accent-surface)] text-[color:var(--accent)] font-semibold'
                  : 'text-secondary hover:bg-[color:var(--border-subtle)] hover:text-primary'
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-9 rounded-lg text-secondary hover:bg-[color:var(--border-subtle)] hover:text-primary transition-all duration-150"
      >
        <ChevronLeft
          size={18}
          strokeWidth={1.75}
          className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
        />
      </button>
    </aside>
  );
}