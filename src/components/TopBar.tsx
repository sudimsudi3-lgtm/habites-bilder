import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  Bell, 
  BellOff, 
  Globe, 
  Check, 
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';
import { formatDisplayDate, getLocalDateString } from '../utils/dateUtils';
import { SupportedLanguage } from '../types';
import { TranslationDictionary } from '../i18n/translations';
import { 
  canUseNotifications, 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendHabitNotification 
} from '../utils/notificationUtils';

interface TopBarProps {
  pageTitle: string;
  onOpenMobileSidebar: () => void;
  onOpenAddHabit: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  displayName: string;
  t: TranslationDictionary;
}

export const TopBar: React.FC<TopBarProps> = ({
  pageTitle,
  onOpenMobileSidebar,
  onOpenAddHabit,
  searchQuery,
  onSearchChange,
  language,
  onLanguageChange,
  displayName,
  t,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [notifState, setNotifState] = useState(getNotificationPermission());
  const todayStr = getLocalDateString();

  const handleToggleNotifications = async () => {
    if (!canUseNotifications()) {
      alert('Browser notifications are not supported in this browser.');
      return;
    }

    if (notifState === 'granted') {
      sendHabitNotification(
        'Habit Builder AI',
        'Notifications are active! You will receive timely habit reminders.'
      );
      return;
    }

    const granted = await requestNotificationPermission();
    setNotifState(granted ? 'granted' : 'denied');
    if (granted) {
      sendHabitNotification(
        'Habit Builder AI',
        'Notifications enabled! Small steps lead to remarkable progress.'
      );
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-[#0B0D12]/90 backdrop-blur-md border-b border-[#293043] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile menu & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-[#9CA3AF] hover:text-[#F3F4F6] rounded-xl hover:bg-[#151925] transition"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#F3F4F6] tracking-tight">
            {pageTitle}
          </h2>
          <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF] mt-0.5">
            <CalendarIcon className="w-3 h-3 text-[#8B5CF6]" />
            <span>{formatDisplayDate(todayStr, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Middle: Global Search */}
      <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search habits, categories, notes..."
            className="w-full bg-[#151925] border border-[#293043] rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:border-[#8B5CF6] focus:outline-hidden transition"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#151925] border border-[#293043] text-xs font-medium text-[#9CA3AF] hover:text-[#F3F4F6] transition"
            title="Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span className="uppercase font-mono text-[10px] font-bold">
              {language === 'roman_ur' ? 'R-UR' : language}
            </span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-[#151925] border border-[#293043] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in duration-150">
              {[
                { id: 'en' as SupportedLanguage, label: 'English' },
                { id: 'roman_ur' as SupportedLanguage, label: 'Roman Urdu' },
                { id: 'ur' as SupportedLanguage, label: 'اردو (Urdu)' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    onLanguageChange(lang.id);
                    setShowLangMenu(false);
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left flex items-center justify-between text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1A2030] transition"
                >
                  <span>{lang.label}</span>
                  {language === lang.id && <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications toggle */}
        <button
          onClick={handleToggleNotifications}
          className={`p-2 rounded-xl border transition ${
            notifState === 'granted'
              ? 'bg-[#34D399]/15 border-[#34D399]/30 text-[#34D399]'
              : 'bg-[#151925] border-[#293043] text-[#9CA3AF] hover:text-[#F3F4F6]'
          }`}
          title={notifState === 'granted' ? 'Notifications active (Click to test)' : 'Click to enable browser notifications'}
        >
          {notifState === 'granted' ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </button>

        {/* Add Habit Primary CTA */}
        <button
          onClick={onOpenAddHabit}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-linear-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9061F9] hover:to-[#6D28D9] text-white text-xs font-bold shadow-md shadow-[#8B5CF6]/20 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">{t.dashboard.addHabit}</span>
        </button>
      </div>
    </header>
  );
};
