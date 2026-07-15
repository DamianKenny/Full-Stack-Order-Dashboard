'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Settings, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/overview' },
  { icon: Package, label: 'Orders', href: '/' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex flex-col sidebar-modern px-4 py-6 sidebar-transition',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-10 mb-7 px-1">
        <div className="w-10 h-10 rounded-3xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-white font-black text-lg">V</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold tracking-[0.08em] uppercase text-slate-200">Veracity</p>
            <p className="text-xs text-slate-400">Order dashboard</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center h-12 rounded-3xl text-sm font-medium transition-all duration-200 sidebar-link',
                collapsed ? 'w-full justify-center' : 'w-full px-4 gap-3',
                isActive
                  ? 'bg-white/10 text-white shadow-soft ring-1 ring-white/15'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon size={18} strokeWidth={1.75} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full h-12 rounded-3xl text-slate-200 border border-white/10 bg-white/5 hover:bg-white/10"
      >
        <ChevronLeft
          size={18}
          strokeWidth={1.75}
          className={cn(
            'transition-transform duration-200',
            collapsed && 'rotate-180'
          )}
        />
      </Button>
    </aside>
  );
}