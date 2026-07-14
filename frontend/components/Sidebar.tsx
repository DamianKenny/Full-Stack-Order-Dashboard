'use client';

import { useState } from 'react';
import { LayoutDashboard, Package, Settings, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', active: false },
  { icon: Package, label: 'Orders', active: true },
  { icon: Settings, label: 'Settings', active: false },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col h-screen border-r bg-card px-3 py-4 sidebar-transition',
        collapsed ? 'w-[72px]' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-8 mb-6 px-1">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-bold text-sm">V</span>
        </div>
        {!collapsed && (
          <span className="font-semibold text-base text-foreground">Veracity</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={cn(
                'flex items-center gap-3 h-9 px-3 rounded-lg text-sm font-medium transition-all duration-150',
                item.active
                  ? 'bg-accent text-accent-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon size={18} strokeWidth={1.75} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full h-9 rounded-lg"
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