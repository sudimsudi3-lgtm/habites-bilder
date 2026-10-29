import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Bot, 
  Settings as SettingsIcon, 
  FlaskConical, 
  X,
  Sparkles,
  Flame
} from 'lucide-react';
import { TranslationDictionary } from '../i18n/translations';

export type NavView = 'dashboard' | 'habits' | 'calendar' | 'analytics' | 'aiCoach' | 'settings';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenTestRunner: () => void;
  remainingCount: number;
  currentStreak: number;
  isDemoData: boolean;
  t: TranslationDictionary;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  onOpenTestRunner,
  remainingCount,
  currentStreak,
  isDemoData,
  t,
}) => {
  const navItems = [
    { id: 'dashboard' as NavView, label: t.nav.dashboard, icon: LayoutDashboard, badge: remainingCount > 0 ? remainingCount : undefined },
    { id: 'habits' as NavView, label: t.nav.habits, icon: CheckSquare },
    { id: 'calendar' as NavView, label: t.nav.calendar, icon: CalendarIcon },
    { id: 'analytics' as NavView, label: t.nav.analytics, icon: BarChart3 },
    { id: 'aiCoach' as NavView, label: t.nav.aiCoach, icon: Bot, isAi: true },
    { id: 'settings' as NavView, label: t.nav.settings, icon: SettingsIcon },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#10131B] border-r border-[#293043] select-none">
      {/* Brand & Logo */}
      <div className="p-6 border-b border-[#293043] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#8B5CF6] to-[#22D3EE] p-0.5 shadow-md shadow-[#8B5CF6]/25">
            <div className="w-full h-full bg-[#151925] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#F3F4F6] tracking-tight flex items-center gap-1.5">
              Habit Builder
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-sm bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
                AI
              </span>
            </h1>
            <p className="text-[11px] text-[#9CA3AF] tracking-tight">{t.tagline}</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 text-[#9CA3AF] hover:text-[#F3F4F6] rounded-lg hover:bg-[#1A2030]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Demo dataset banner if active */}
      {isDemoData && (
        <div className="mx-4 mt-4 p-2.5 bg-[#FBBF24]/10 border border-[#FBBF24]/20 rounded-xl text-[11px] text-[#FBBF24] flex items-center justify-between">
          <span>Sample Demo Data Active</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#FBBF24]/20 rounded-md">DEMO</span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition duration-200 group ${
                isActive
                  ? 'bg-[#8B5CF6]/15 text-[#F3F4F6] border border-[#8B5CF6]/30 font-semibold shadow-xs'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#151925]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive
                      ? item.isAi ? 'text-[#22D3EE]' : 'text-[#8B5CF6]'
                      : 'text-[#6B7280] group-hover:text-[#9CA3AF]'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#8B5CF6] text-white">
                  {item.badge}
                </span>
              )}
              {item.isAi && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
                  NEW
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Streaks & Verification Suite */}
      <div className="p-4 border-t border-[#293043] space-y-3">
        {/* Quick Streak Widget */}
        <div className="p-3 bg-[#151925] border border-[#293043] rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24] flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                Consistency
              </div>
              <div className="text-sm font-extrabold text-[#F3F4F6] tabular-nums">
                {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-full border border-[#34D399]/20">
            Active
          </span>
        </div>

        {/* System Tests shortcut */}
        <button
          onClick={onOpenTestRunner}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#9CA3AF] hover:text-[#22D3EE] hover:bg-[#151925] border border-transparent hover:border-[#293043] transition"
        >
          <FlaskConical className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span>{t.nav.testSuite}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
